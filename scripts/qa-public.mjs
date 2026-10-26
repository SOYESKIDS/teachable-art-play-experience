// 공개 체험 사이트 브라우저 QA — 로그인 · 토큰 · 쿠키 없이 (시크릿 창과 같은 새 프로필).
//   node scripts/qa-public.mjs https://teachable-art-play-experience.vercel.app [캡처 폴더]
// 6개 화면 × 6개 폭(휴대폰 360 · 390 · 태블릿 768 · 1024 · PC 1440 · 전자칠판 1920) · 24주 상세 + 플레이어 48개 · 플레이어 버튼 17개 · 운영 경로 404 · 외부 요청 0 · 문의 동선.
// `vercel env run` (env VERCEL_OIDC_TOKEN), is attached ONLY to requests for the preview host,
// and is never printed.
import { launch } from "./cdp.mjs";
import { createRequire } from "node:module";
// 화면 캡처는 sharp 가 있을 때만 (없으면 건너뛴다)
let sharp = null;
try { sharp = createRequire(import.meta.url)("sharp"); } catch { /* optional */ }
const [base, out] = process.argv.slice(2);
const host = new URL(base).host;
const { page, close } = await launch({ port: Number(process.env.CDP_PORT ?? 9371) });
page.idle = (ms = 300) => new Promise((r) => setTimeout(r, Math.min(Math.max(ms, 400), 900)));
const results = [];
const note = (ok, label, info = "") => { results.push(ok); console.log(ok ? "PASS" : "FAIL", label, info); };
// 공개 사이트는 자기 출처 밖으로 요청하지 않는다 (Supabase 포함 모든 외부 요청 0)
const supa = () => {
  const r = page.requests.map((x) => x.url).filter((u) => /^https?:/.test(u));
  const ext = r.filter((u) => new URL(u).host !== host);
  return { prod: 0, any: ext.length, ext };
};
const MEASURE = `(()=>({
  status: performance.getEntriesByType('navigation')[0]?.responseStatus,
  sw: document.documentElement.scrollWidth, vw: innerWidth,
  broken: [...document.images].filter(i=>i.complete&&i.naturalWidth===0).length,
  imgs: document.images.length,
  h1: document.querySelectorAll('h1').length,
  noAlt: [...document.images].filter(i=>!i.hasAttribute('alt')).length,
  demo: document.body.innerText.includes('체험용 화면'),
  draftLabel: document.body.innerText.includes('정식 교안 확정 전') || document.body.innerText.includes('검수 전'),
  login: /Log in to Vercel|vercel\\.com\\/login/i.test(document.body.innerText + location.href),
  forms: document.querySelectorAll('form,input,textarea').length
}))()`;
const measure = () => page.eval(MEASURE);

// 1. key pages x widths
const PAGES = ["/", "/experience", "/experience/weeks", "/experience/weeks/4", "/experience/classroom/4", "/experience/report"];
for (const w of (process.env.SKIP_PART1 ? [] : [360, 390, 768, 1024, 1440, 1920])) {
  for (const p of PAGES) {
    page.requests = []; page.drain();
    await page.viewport(w, w === 1920 ? 1080 : 900, w < 768);
    await page.goto(base + p).catch(() => {});
    await page.eval("(async()=>{for(let y=0;y<document.body.scrollHeight;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,50));}window.scrollTo(0,0)})()");
    await page.idle(400, 8000);
    const m = await measure(); const d = page.drain(); const s = supa();
    const issues = [];
    if (m.status !== 200) issues.push(`status ${m.status}`);
    if (m.login) issues.push("auth wall");
    if (m.sw > m.vw) issues.push(`overflowX ${m.sw}>${m.vw}`);
    if (m.broken) issues.push(`broken ${m.broken}/${m.imgs}`);
    if (m.h1 !== 1) issues.push(`h1=${m.h1}`);
    if (m.noAlt) issues.push(`noAlt ${m.noAlt}`);
    if (p.startsWith("/experience") && !m.demo) issues.push("no demo notice");
    if (s.prod) issues.push(`PRODUCTION SUPABASE REQUESTS ${s.prod}`);
    if (s.any) issues.push(`external requests ${s.any} ${s.ext.slice(0, 2).join(" ")}`);
    if (m.forms) issues.push(`form fields ${m.forms}`);
    if (d.consoleErrors.length) issues.push(`console ${JSON.stringify(d.consoleErrors).slice(0, 200)}`);
    if (d.badResponses.length) issues.push(`bad ${JSON.stringify(d.badResponses).slice(0, 200)}`);
    note(issues.length === 0, `${w} ${p}`, issues.join(" ; "));
    if (sharp && out && (w === 390 || w === 1440)) {
      const { data } = await page.send("Page.captureScreenshot", { format: "png" });
      await sharp(Buffer.from(data, "base64")).resize({ width: Math.round(w * (w > 1000 ? 0.55 : 0.8)) }).png().toFile(`${out}/pv-${w}-${p.replace(/\//g, "_") || "_home"}.png`);
    }
  }
}

// 2. all 24 week details + classroom players
await page.viewport(1024, 800);
const bad24 = [];
for (let n = 1; n <= 24; n++) {
  for (const p of [`/experience/weeks/${n}`, `/experience/classroom/${n}`]) {
    page.requests = []; page.drain();
    await page.goto(base + p).catch(() => {});
    await page.idle(300, 6000);
    const m = await measure(); const s = supa(); const d = page.drain();
    const needsDraft = p.includes("/weeks/");
    if (m.status !== 200 || m.broken || !m.demo || s.any || d.consoleErrors.length || (needsDraft && !m.draftLabel)) {
      bad24.push(`${p}:${m.status}/${m.broken}/${m.demo}/${s.any}/${d.consoleErrors.length}/${m.draftLabel}`);
    }
  }
}
note(bad24.length === 0, "24주 상세 + 플레이어 48페이지 (200, 이미지, 체험표시, 임시콘텐츠 표기, Supabase 0, 콘솔 · CSP 위반 0)", bad24.join(" "));

// 2-1. 주제 일치 — 주차 상세 제목 · 그림책 · 대시보드 그림책 · 교실 플레이어 시작 화면이 같은 수업을 가리킨다
const TOPIC = `(()=>{const t=(s)=>document.querySelector(s)?.textContent.trim()??null;
  const book=[...document.querySelectorAll("p")].map(p=>p.textContent.trim()).find(x=>x.startsWith("그림책 《"))??null;
  return {h1:t("h1"), h2:t("[aria-label='수업 시작'] h2"), book, dashBook:[...document.querySelectorAll("#teacher-dash ~ div details p")].map(p=>p.textContent.trim()).find(x=>/^《.*》$/.test(x))??null};})()`;
const topicBad = [];
for (let n = 1; n <= 24; n++) {
  await page.goto(base + `/experience/weeks/${n}`).catch(() => {}); await page.idle(300, 6000);
  const a = await page.eval(TOPIC);
  await page.goto(base + `/experience/classroom/${n}`).catch(() => {}); await page.eval("sessionStorage.clear()"); await page.goto(base + `/experience/classroom/${n}`).catch(() => {}); await page.idle(300, 6000);
  const b = await page.eval(TOPIC);
  const sameBook = a.book && a.dashBook && a.book === `그림책 ${a.dashBook}` && b.book === a.book;
  if (!a.h1 || a.h1 !== b.h2 || !sameBook) topicBad.push(`${n}: 상세「${a.h1}」 플레이어「${b.h2}」 ${a.book} / 대시보드 ${a.dashBook} / 플레이어 ${b.book}`);
}
page.drain();
note(topicBad.length === 0, "24주 주제 일치 (상세 제목 = 플레이어 제목, 상세 그림책 = 대시보드 그림책 = 플레이어 그림책)", topicBad.join(" | "));
// 2-2. 인쇄용 수업 요약 24개 — 200 · 검색 제외 · 출처 표시 · 가로 넘침 없음 · 인쇄 때 머리말 · 꼬리말 · 단추 숨김
{
  const bad = [];
  await page.viewport(390, 844, true);
  for (let n = 1; n <= 24; n++) {
    page.requests = []; page.drain();
    await page.goto(`${base}/experience/weeks/${n}/print`).catch(() => {});
    await page.idle(300, 6000);
    const m = await measure();
    const extra = await page.eval(`({noindex:/noindex/.test(document.querySelector('meta[name=robots]')?.content??''),
      origin:document.body.innerText.includes('PDF 원문'), table:!!document.querySelector('table'), family:document.body.innerText.includes('가족연계 안내문')})`);
    await page.send("Emulation.setEmulatedMedia", { media: "print" });
    // 실제로 그려지는지 본다 (숨긴 머리말 안의 단추도 display 값은 그대로라서 getClientRects 로 판정)
    const pr = await page.eval(`(()=>{const v=(el)=>!!el&&el.getClientRects().length>0;return {header:v(document.querySelector('header')),footer:v(document.querySelector('footer')),button:[...document.querySelectorAll('button')].some(v)}})()`);
    await page.send("Emulation.setEmulatedMedia", { media: "" });
    const s = supa(); const d = page.drain();
    if (m.status !== 200 || m.sw > m.vw || m.h1 !== 1 || m.forms || s.any || d.consoleErrors.length || !extra.noindex || !extra.origin || !extra.table || !extra.family || pr.header || pr.footer || pr.button) {
      bad.push(`${n}:${JSON.stringify({ st: m.status, ox: m.sw > m.vw, ...extra, print: pr })}`);
    }
  }
  note(bad.length === 0, "인쇄용 수업 요약 24개 (200 · noindex · 출처 표시 · 진행표 · 가족 안내문 · 인쇄 때 메뉴/단추 숨김 · 가로 넘침 없음)", bad.join(" "));
}

// 2-3. 교실 플레이어 — 시작 화면 「수업 전 확인」, 마무리 화면 「수업 마무리 확인」, 단계 시간 표시
{
  await page.viewport(1440, 900);
  const bad = [];
  for (const n of [1, 8, 16, 24]) {
    await page.goto(`${base}/experience/classroom/${n}`).catch(() => {}); await page.eval("sessionStorage.clear()");
    await page.goto(`${base}/experience/classroom/${n}`).catch(() => {}); await page.idle(400, 6000);
    const intro = await page.eval(`document.body.innerText.includes('수업 전 확인')`);
    await page.clickText("수업 시작", { exact: false }); await page.idle(400, 4000);
    const timer = await page.eval(`/이 단계 \\d+:\\d\\d \\/ \\d+분/.test(document.body.innerText)`);
    for (let i = 0; i < 5; i++) { await page.eval(`window.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight'}))`); await page.idle(200, 2000); }
    const done = await page.eval(`({closing:document.body.innerText.includes('수업 마무리 확인'), note:document.body.innerText.includes('새로고침하면 사라집니다')})`);
    if (!intro || !timer || !done.closing || !done.note) bad.push(`${n}:${JSON.stringify({ intro, timer, ...done })}`);
  }
  note(bad.length === 0, "플레이어 수업 전 확인 · 단계 시간 · 수업 마무리 확인 (1 · 8 · 16 · 24주)", bad.join(" "));
  page.drain();
}

page.requests = []; page.drain();
await page.goto(base + "/experience/weeks/25").catch(() => {});
note((await measure()).status === 404, "없는 주차(25) 404");
page.drain();

// 3. player buttons
await page.viewport(1440, 900);
await page.goto(base + "/experience/classroom/4");
await page.eval("sessionStorage.clear()");
await page.goto(base + "/experience/classroom/4");
await page.idle(400, 6000);
page.requests = [];
const ST = `({ p: document.querySelector('[role=progressbar]')?.getAttribute('aria-valuenow'), c: !!document.querySelector('[aria-label="교실 화면"]'), t: !!document.querySelector('[aria-label="교사 화면"]'), dlg: document.querySelector('dialog[open]')?.getAttribute('aria-label') ?? null, done: !!document.querySelector('[aria-label="수업 완료"]'), intro: !!document.querySelector('[aria-label="수업 시작"]') })`;
const st = () => page.eval(ST);
const steps = [
  ["수업 시작", () => page.clickText("수업 시작"), (s) => s.c && s.p === "0"],
  ["다음 단계", () => page.clickText("다음 단계", { exact: false }), (s) => s.p === "20"],
  ["오른쪽 화살표", () => page.key("ArrowRight", "ArrowRight", 39), (s) => s.p === "40"],
  ["왼쪽 화살표", () => page.key("ArrowLeft", "ArrowLeft", 37), (s) => s.p === "20"],
  ["이전", () => page.clickText("← 이전", { exact: false }), (s) => s.p === "0"],
  ["교사 화면", () => page.clickText("교사 화면"), (s) => s.t && !s.c],
  ["나란히", () => page.clickText("나란히"), (s) => s.t && s.c],
  ["교실 화면", () => page.clickText("교실 화면"), (s) => s.c && !s.t],
  ["준비물", () => page.clickText("준비물"), (s) => s.dlg === "준비물 · 안전"],
  ["Esc 닫기", () => page.key("Escape", "Escape", 27), (s) => !s.dlg],
  ["발문", () => page.clickText("발문"), (s) => s.dlg === "교사 발문"],
  ["닫기 버튼", () => page.click('dialog[open] button[aria-label="닫기"]'), (s) => !s.dlg],
  ["전체 단계에서 5단계로", async () => { await page.clickText("전체 단계"); return page.clickText("5. 나누고 정리", { exact: false }); }, (s) => s.p === "80"],
  ["새로고침 후 복원", async () => { await page.goto(base + "/experience/classroom/4"); await page.idle(700, 6000); }, (s) => s.p === "80"],
  ["수업 종료 → 계속 진행", async () => { await page.clickText("수업 종료"); return page.clickText("계속 진행"); }, (s) => !s.dlg && !s.done],
  ["수업 종료 → 수업 마치기", async () => { await page.clickText("수업 종료"); return page.click("dialog[open] button.bg-pop-pink-deep"); }, (s) => s.done && s.p === "100"],
  ["처음부터 다시", () => page.clickText("처음부터 다시"), (s) => s.intro],
];
for (const [label, act, ok] of steps) {
  await act();
  await page.idle(300, 4000);
  const s = await st();
  note(ok(s), `플레이어: ${label}`, JSON.stringify(s));
}
note(await page.eval("[...document.querySelectorAll('button')].some(b=>b.textContent.includes('전체 화면'))"), "플레이어: 전체 화면 버튼 표시");
note(supa().any === 0, "플레이어 조작 중 Supabase 요청 0");
const d = page.drain();
note(!d.consoleErrors.length && !d.badResponses.length, "플레이어 콘솔/실패 응답 0", JSON.stringify(d).slice(0, 200));

// 4. 운영 SaaS 경로 · API 가 아예 없다 (로그인 화면조차 없다 → 404)
for (const p of ["/teacher", "/director", "/admin", "/login", "/kindergarten", "/api/share/portal/resolve", "/class/1"]) {
  await page.goto(base + p).catch(() => {});
  await page.idle(300);
  const m = await page.eval("({status: performance.getEntriesByType('navigation')[0]?.responseStatus, path: location.pathname})");
  note(m.status === 404, `운영 경로 없음 ${p}`, JSON.stringify(m));
}
// 4-1. 공개 표지 8장만 받히고, 원본 · 저장소 파일이 배포 주소로 받히지 않는다 (Vercel 은 public/ 을 그대로 내보낸다)
{
  const covers = [];
  for (let n = 1; n <= 8; n++) covers.push((await fetch(`${base}/images/week-covers-web/week-0${n}.webp`)).status);
  // 2026-10-26 소예키즈 사용권 확인 → 1~8주차 표지 8장만 공개. 원본 PNG 와 9~16주차 이름의 파일은 공개하지 않는다
  note(covers.every((s) => s === 200), "1~8주차 표지 8장 200 (배포 주소)", covers.join(","));
  const originals = [];
  for (const p of ["/images/1주차_유치원 가는 날.png", "/images/9주_안녕봄아.png", "/images/16주_나비야놀러와.png",
    "/images/week-covers-web/week-09.webp", "/images/week-covers-web/week-16.webp", "/images/week-covers/week-09.png"]) {
    const s = (await fetch(base + encodeURI(p))).status;
    if (s !== 404) originals.push(`${p}:${s}`);
  }
  note(originals.length === 0, "원본 PNG · 9~16주차 표지 주소 404", originals.join(" "));
  const leaks = [];
  for (const p of ["/package.json", "/.env", "/.env.local", "/vercel.json", "/docs/curriculum/PDF-SYNC-2026-10-26.md", "/src/data/site.ts",
    "/TeachAble_24Week_Dashboard_DevPack.zip", "/images/week-covers/week-01.png"]) {
    const s = (await fetch(base + p)).status;
    if (s !== 404) leaks.push(`${p}:${s}`);
  }
  note(leaks.length === 0, "저장소 · 원본 파일이 배포 주소로 열리지 않는다", leaks.join(" "));
  note((await fetch(`${base}/images/site/brand/soyeskids-logo-primary.png`)).status === 200, "회사 로고 200");
}

// 5. 문의 동선 — 전화 · 이메일 · 영업 사이트 (저장 폼 없음)
await page.goto(base + "/"); await page.idle(600);
const c = await page.eval(`({tel: !!document.querySelector('a[href^="tel:023034420"]'), mail: !!document.querySelector('a[href^="mailto:soyes2013@gmail.com"]'), sales: !!document.querySelector('a[href="https://teachable-art-play-sales.vercel.app/"]'), contact: !!document.getElementById("contact"), forms: document.querySelectorAll("form,input,textarea").length})`);
note(c.tel && c.mail && c.sales && c.contact && c.forms === 0, "문의 동선 (전화 · 이메일 · 영업 사이트 · 폼 0)", JSON.stringify(c));
console.log("SUMMARY", results.filter(Boolean).length, "/", results.length);
await close();
