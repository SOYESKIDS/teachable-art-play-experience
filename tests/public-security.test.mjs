/**
 * 공개 체험 사이트 보안 경계 (정적 검사).
 *
 * ★ 이 사이트는 정적 파일만 배포한다. DB · 로그인 · 서버 API · 비밀값 · 개인정보 입력이 없어야 한다.
 *   여기서 막는 것이 생기면 「공개해도 되는 사이트」라는 전제가 깨진다.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const files = (dir, re) =>
  existsSync(join(ROOT, dir))
    ? readdirSync(join(ROOT, dir), { recursive: true }).map((f) => join(ROOT, dir, f)).filter((f) => statSync(f).isFile() && re.test(f))
    : [];
const SRC = files("src", /\.(ts|tsx|css|mjs)$/);
const rel = (f) => relative(ROOT, f).split(sep).join("/");

test("의존성은 Next · React 뿐이다 (Supabase · OpenAI · DB 드라이버 없음)", () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  assert.deepEqual(Object.keys(pkg.dependencies).sort(), ["next", "react", "react-dom"]);
  const all = JSON.stringify({ ...pkg.dependencies, ...pkg.devDependencies });
  assert.doesNotMatch(all, /supabase|openai|\bpg\b|prisma|mysql|mongo|firebase|stripe|toss|axios/i);
});

test("정적 export 설정이다 — 서버 API · 서버 액션 · 미들웨어를 만들 수 없다", () => {
  assert.match(readFileSync(join(ROOT, "next.config.ts"), "utf8"), /output:\s*"export"/);
  for (const name of ["middleware.ts", "proxy.ts", "src/middleware.ts", "src/proxy.ts"]) assert.ok(!existsSync(join(ROOT, name)), name);
  const routes = files("src/app", /route\.(ts|tsx|js)$/);
  assert.deepEqual(routes.map(rel), []);
});

test("소스에 DB · 인증 · 네트워크 전송 · 저장 코드가 없다", () => {
  const banned = [
    [/@supabase|supabase\.co|createClient\(/, "Supabase"],
    [/from\s+["']openai["']|api\.openai\.com/, "OpenAI"],
    [/["']use server["']|next\/headers|server-only|cookies\(\)/, "서버 전용 코드"],
    [/\bfetch\(|XMLHttpRequest|navigator\.sendBeacon|new WebSocket/, "네트워크 전송"],
    [/localStorage|indexedDB|document\.cookie/, "영구 저장 (진행 상태는 sessionStorage 만)"],
    [/process\.env\./, "환경변수 (비밀값을 읽을 자리가 없어야 한다)"],
    [/<form\b|<input\b|<textarea\b|type="file"/, "입력 폼 · 업로드 (개인정보를 받지 않는다)"],
  ];
  for (const f of SRC) {
    const s = readFileSync(f, "utf8");
    for (const [re, label] of banned) assert.doesNotMatch(s, re, `${rel(f)} — ${label}`);
  }
});

test("운영 SaaS 화면(로그인 · 교사 · 원장 · 관리자 · 공유)으로 가는 링크가 없다", () => {
  for (const f of SRC.filter((x) => /\.tsx?$/.test(x))) {
    const s = readFileSync(f, "utf8");
    assert.doesNotMatch(s, /href=\{?["'`]\/(login|kindergarten|teacher|director|admin|share|class\/|api\/)/, rel(f));
  }
  assert.deepEqual(readdirSync(join(ROOT, "src/app")).filter((d) => /^(login|kindergarten|teacher|director|admin|share|class|api|auth|sales)$/.test(d)), []);
});

test("비밀값처럼 보이는 문자열이 저장소에 없다", () => {
  // 이 파일 자신은 검사 패턴(운영 프로젝트 ref)을 적어 두므로 뺀다
  const all = [...SRC, ...files("tests", /\.mjs$/).filter((f) => !f.endsWith("public-security.test.mjs")), ...files("scripts", /\.(mjs|py)$/), join(ROOT, "package.json"), join(ROOT, "vercel.json"), join(ROOT, "next.config.ts")];
  for (const f of all) {
    const s = readFileSync(f, "utf8");
    assert.doesNotMatch(s, /sb_(secret|publishable)_[A-Za-z0-9]{8,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9]{20,}|vpppxuhodwauaclhybtg|itcddooiuqsqingfhxkk/, rel(f));
  }
});

// ★ 손으로 적은 고정 목록이다. 새 파일이 public 에 들어오면 그대로 걸린다.
const ALLOWED_PUBLIC_FILES = [
  "public/images/site/brand/soyeskids-logo-primary.png",
  "public/images/week-covers-web/week-01.webp",
  "public/images/week-covers-web/week-02.webp",
  "public/images/week-covers-web/week-03.webp",
  "public/images/week-covers-web/week-04.webp",
  "public/images/week-covers-web/week-05.webp",
  "public/images/week-covers-web/week-06.webp",
  "public/images/week-covers-web/week-07.webp",
  "public/images/week-covers-web/week-08.webp",
];

test("배포 폴더(public)에는 로고와 승인된 주차 표지 8장만 있다", () => {
  assert.equal(ALLOWED_PUBLIC_FILES.length, 9, "로고 1 + 표지 8");
  // zip · pdf · 동영상 · 문서 · 임의 업로드 파일이 들어오면 여기서 걸린다
  assert.deepEqual(files("public", /./).map(rel).sort(), [...ALLOWED_PUBLIC_FILES].sort());
});

test("허용 목록과 media.ts 등록이 어긋나지 않는다", async () => {
  const { WEEK_IMAGE_FILES, WEEK_COVER_REGISTRY } = await import("../src/data/experience/media.ts");
  assert.deepEqual([...WEEK_IMAGE_FILES].sort(),
    ALLOWED_PUBLIC_FILES.filter((f) => f.includes("week-covers-web")).sort());
  // 그림 속 내용이 확인된 1~8주차만 등록한다. 나머지는 자체 제작 SVG 를 쓴다
  assert.deepEqual(Object.keys(WEEK_COVER_REGISTRY).map(Number).sort((a, b) => a - b),
    Array.from({ length: 8 }, (_, i) => i + 1));
});

test("사용권이 확인되기 전에는 표지를 화면에도 배포본(out/)에도 싣지 않는다", async () => {
  const { LICENSE_STATUS, WEEK_MEDIA } = await import("../src/data/experience/media.ts");
  if (LICENSE_STATUS === "confirmed") return;
  assert.deepEqual(Object.keys(WEEK_MEDIA), [], "화면이 사용권 미확인 표지를 싣는다");
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  assert.equal(pkg.scripts.postbuild, "node scripts/strip-unlicensed-media.mjs", "빌드 뒤 표지를 빼는 단계가 없다");
  // 빌드한 결과물이 있으면 그 안에도 없어야 한다
  if (existsSync(join(ROOT, "out"))) {
    assert.deepEqual(files("out", /week-covers-web/).map(rel), [], "배포본에 사용권 미확인 표지가 남아 있다");
  }
});

test("public 의 그림은 실제 이미지 파일이다 (확장자와 내용이 같다)", () => {
  const MAGIC = [
    [Buffer.from([0x89, 0x50, 0x4e, 0x47]), "PNG"],
    [Buffer.from([0xff, 0xd8, 0xff]), "JPEG"],
    [Buffer.from("RIFF"), "WEBP"],
  ];
  for (const f of ALLOWED_PUBLIC_FILES) {
    assert.match(f, /\.(png|jpe?g|webp)$/i, `${f} — 허용하지 않는 확장자`);
    const head = readFileSync(join(ROOT, f)).subarray(0, 4);
    assert.ok(MAGIC.some(([m]) => head.subarray(0, m.length).equals(m)), `${f} — 확장자와 실제 내용이 다르다`);
  }
});

test("문의는 전화 · 이메일 · 영업 사이트 링크뿐이다 (저장하는 폼 없음)", () => {
  const site = readFileSync(join(ROOT, "src/data/site.ts"), "utf8");
  assert.match(site, /02-303-4420/);
  assert.match(site, /soyes2013@gmail\.com/);
  assert.match(site, /https:\/\/teachable-art-play-sales\.vercel\.app\//);
});
