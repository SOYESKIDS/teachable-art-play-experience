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
// ★ Vercel 은 public/ 을 그대로 내보낸다. 화면이 쓰지 않는 파일도 주소만 알면 받힌다 —
//   그래서 public/ 에 있는 것 = 공개되는 것으로 본다 (빌드 결과물 out/ 이 아니라 public/ 을 검사한다).
const LOGO = "public/images/site/brand/soyeskids-logo-primary.png";
const { LICENSE_STATUS, WEEK_IMAGE_FILES, WEEK_COVER_REGISTRY, WEEK_MEDIA } = await import("../src/data/experience/media.ts");
const ALLOWED_PUBLIC_FILES = LICENSE_STATUS === "confirmed" ? [LOGO, ...WEEK_IMAGE_FILES] : [LOGO];

test("public 에는 로고(와 사용권이 확인된 표지)만 있다 — zip · pdf · 원본 · 문서가 없다", () => {
  // zip · pdf · 동영상 · 문서 · 임의 업로드 파일 · 사용권 미확인 표지가 들어오면 여기서 걸린다
  assert.deepEqual(files("public", /./).map(rel).sort(), [...ALLOWED_PUBLIC_FILES].sort());
  for (const f of files("public", /./)) assert.doesNotMatch(rel(f), /\.(zip|pdf|psd|ai|docx?|xlsx?|pptx?|hwp|mp4|mov|png\.bak)$/i, rel(f));
});

test("사용권이 확인되기 전에는 표지 파일이 public 에 없고 화면도 싣지 않는다 (배포 주소는 404)", () => {
  // 그림 속 내용이 확인된 1~8주차만 등록부에 둔다. 나머지는 자체 제작 SVG 를 쓴다
  assert.deepEqual(Object.keys(WEEK_COVER_REGISTRY).map(Number).sort((a, b) => a - b), Array.from({ length: 8 }, (_, i) => i + 1));
  assert.deepEqual(Object.values(WEEK_COVER_REGISTRY).map((x) => `public${x.src}`).sort(), [...WEEK_IMAGE_FILES].sort());
  if (LICENSE_STATUS === "confirmed") {
    for (const f of WEEK_IMAGE_FILES) assert.ok(existsSync(join(ROOT, f)), `${f} — 사용권 확인 뒤에는 파일이 있어야 한다`);
    return;
  }
  assert.deepEqual(Object.keys(WEEK_MEDIA), [], "화면이 사용권 미확인 표지를 싣는다");
  for (const f of WEEK_IMAGE_FILES) assert.ok(!existsSync(join(ROOT, f)), `${f} — public 에 있으면 Vercel 이 그대로 내보낸다`);
  assert.ok(!existsSync(join(ROOT, "public/images/week-covers-web")), "표지 폴더가 public 에 남아 있다");
  // 효과가 없던 빌드 뒤 정리 단계(out/ 만 지움)에 기대지 않는다
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  assert.equal(pkg.scripts.postbuild, undefined);
});

test("배포 QA 가 표지 주소 404 를 실제 배포에서 확인한다", () => {
  const qa = readFileSync(join(ROOT, "scripts/qa-public.mjs"), "utf8");
  assert.match(qa, /week-covers-web\/week-0/, "qa-public.mjs 에 표지 주소 검사가 없다");
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
