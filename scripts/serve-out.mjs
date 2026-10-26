// LOCAL ONLY — 빌드 결과물(out/)을 vercel.json 의 보안 헤더(CSP 포함)와 함께 내보내는 정적 서버.
//   npm run build && node scripts/serve-out.mjs 3131
//   node scripts/qa-public.mjs http://localhost:3131
// ★ 배포 전에 CSP 가 실제 정적 리소스(인라인 하이드레이션 스크립트 · 글꼴 · 그림)를 막지 않는지
//   브라우저 콘솔로 확인하려는 것이다. Vercel 처럼 /path → path.html, 없으면 404.html(404).
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const port = Number(process.argv[2] ?? 3131);
const headers = Object.fromEntries(
  JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8")).headers.flatMap((h) => h.headers)
    // http://localhost 에서는 https 승격을 뺀다 (배포본은 https 라 그대로 적용된다)
    .map((h) => [h.key, h.value.replace(/; upgrade-insecure-requests/, "")]),
);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2", ".png": "image/png", ".webp": "image/webp", ".ico": "image/x-icon", ".svg": "image/svg+xml",
  ".xml": "application/xml", ".json": "application/json",
};

function resolveFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, "");
  const base = join(OUT, clean);
  if (!base.startsWith(OUT)) return null;
  // Next 16 세그먼트 프리페치: …/__next.experience.weeks.__PAGE__.txt 는
  // …/__next.experience/weeks/__PAGE__.txt 에 저장된다 (Vercel 이 같은 규칙으로 내보낸다)
  const m = basename(base).match(/^__next\.(.+)\.txt$/);
  const segFile = m ? join(dirname(base), `__next.${m[1].split(".").join("/")}.txt`) : base;
  for (const c of [base, `${base}.html`, join(base, "index.html"), segFile]) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

createServer((req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  const file = resolveFile(pathname === "/" ? "/index.html" : pathname);
  const target = file ?? join(OUT, "404.html");
  res.writeHead(file ? 200 : 404, { ...headers, "Content-Type": TYPES[extname(target)] ?? "application/octet-stream" });
  res.end(readFileSync(target));
}).listen(port, () => console.log(`out/ → http://localhost:${port} (vercel.json 헤더 적용)`));
