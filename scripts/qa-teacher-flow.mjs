// 교사 관점 수업 흐름 체험 — 대시보드 「수업 흐름」 10단계를 차례대로 눌러 가며 PDF 내용과 맞는지 본다
//   node --import ./tests/register-hooks.mjs scripts/qa-teacher-flow.mjs <base-url> [보고서.json]
//   주차: 1 · 4 · 7 · 8 · 16 · 18 · 19 · 21 · 22 · 24 (WEEKS=… 로 바꿀 수 있다)
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (p) => import(pathToFileURL(join(ROOT, p)).href);
const { launch } = await imp("scripts/cdp.mjs");
const { experienceWeek } = await imp("src/data/experience/weeks.ts");
const { weekDashboard } = await imp("src/data/experience/teacher-dashboard/week-dashboards.ts");
const { prepNotes } = await imp("src/data/experience/lesson-engine/prep-notes.ts");
const { sequenceNotes } = await imp("src/data/experience/lesson-engine/sequence-notes.ts");

const base = process.argv[2];
const WEEKS = process.env.WEEKS ? process.env.WEEKS.split(",").map(Number) : [1, 4, 7, 8, 16, 18, 19, 21, 22, 24];
const { page, close } = await launch({ port: 9375 });
let pass = 0, fail = 0;
const report = {};
const note = (ok, label, detail = "") => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${label} ${ok ? "" : String(detail).slice(0, 600)}`); };
const sq = (s) => (s ?? "").normalize("NFC").replace(/[\s?.!,·ˮʼ”“"'‘’()~\-–:;/「」『』…《》#]/g, "");

/** 수업 흐름 i 번째 단추를 누르고, 펼쳐진 영역(들)의 글을 돌려준다 */
async function flowStep(i) {
  return page.eval(`(async()=>{const li=document.querySelectorAll('nav[aria-label="수업 흐름"] li')[${i}];const b=li.querySelector('button');
    b.click();await new Promise(r=>setTimeout(r,400));
    return [...document.querySelectorAll('details[open], #dash-prep, #dash-kidsboard')].map(e=>e.innerText).join('\\n')})()`);
}

for (const n of WEEKS) {
  const w = experienceWeek(n);
  const d = weekDashboard(n);
  const r = (report[n] = {});
  await page.viewport(1440, 900);
  await page.goto(`${base}/experience/weeks/${n}`); await page.idle(600, 8000);
  const labels = await page.eval(`[...document.querySelectorAll('nav[aria-label="수업 흐름"] li')].map(li=>li.innerText.replace(/^\\d+/,'').trim())`);
  note(labels.length === 10, `${n}주 수업 흐름 10단계`, JSON.stringify(labels));

  const t0 = await flowStep(0); // 준비
  const prepOk = d.kitItems.every((k) => sq(t0).includes(sq(k))) && prepNotes(n).filter((p) => p.when === "before").every((p) => sq(t0).includes(sq(p.action.text)));
  note(prepOk, `${n}주 ① 수업 준비 — 키트 ${d.kitItems.length}가지 · 사전 준비 ${prepNotes(n).filter((p) => p.when === "before").length}`);
  const t1 = await flowStep(1);
  note(sq(t1).includes(sq(d.storybookTitle)) && (!d.storySummary || sq(t1).includes(sq(d.storySummary))), `${n}주 ② 그림책 《${d.storybookTitle}》 줄거리`);
  const t2 = await flowStep(2);
  const steps = [...d.physicalSteps, ...(d.physical2?.steps ?? [])];
  note(steps.every((s) => sq(t2).includes(sq(s.title))), `${n}주 ③ 신체활동 ${d.physical2 ? "두 개 · " : ""}${steps.length}단계`, steps.filter((s) => !sq(t2).includes(sq(s.title))).map((s) => s.title).join(" | "));
  const t3 = await flowStep(3);
  note(sq(t3).includes(sq(d.artTitle)) && d.artSteps.every((s) => sq(t3).includes(sq(s))), `${n}주 ④ 미술 「${d.artTitle}」 순서 ${d.artSteps.length}`);
  const t4 = await flowStep(4);
  note(d.workbookSheets.every((s) => sq(t4).includes(sq(s.title))) && d.orgItems.every((o) => sq(t4).includes(sq(o))), `${n}주 ⑤ 워크북 ${d.workbookSheets.length}장 · 기관 준비물 ${d.orgItems.length}`);
  const t6 = await flowStep(6);
  note(d.observations.every((o) => sq(t6).includes(sq(o))) && /5대 성장지표/.test(t6), `${n}주 ⑦ 관찰 문항 ${d.observations.length} → 5대 지표`);
  const t8 = await flowStep(8);
  note(sq(t8).includes(sq(d.familyTitle)) && d.familyHow.every((h) => sq(t8).includes(sq(h)) || /몰래/.test(h)) && t8.includes("키즈보드"), `${n}주 ⑨ 가정연계 「${d.familyTitle}」 · 키즈보드`);
  r.flow = { labels };

  // ⑥ 플레이어 — 순서 주의가 있는 주차는 교사 화면에 보인다
  const hrefs = await page.eval(`[...document.querySelectorAll('nav[aria-label="수업 흐름"] a')].map(a=>a.getAttribute('href'))`);
  note(JSON.stringify(hrefs) === JSON.stringify([`/experience/classroom/${n}`, `/experience/growth-demo?week=${n}`, `/experience/weeks/${n}/guide`]), `${n}주 흐름 링크 (플레이어 · 성장분석 · 지도안)`, JSON.stringify(hrefs));
  await page.goto(`${base}${hrefs[0]}`); await page.eval("sessionStorage.clear()");
  await page.goto(`${base}${hrefs[0]}`); await page.idle(600, 8000);
  await page.clickText("교사 화면"); await page.clickText("수업 시작", { exact: false }); await page.idle(300);
  for (let i = 0; i < 2; i++) { await page.eval(`window.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight'}))`); await page.idle(250); }
  const pane = await page.eval(`document.querySelector("[aria-label='교사 화면']")?.innerText ?? ''`);
  const seq = sequenceNotes(n).length > 0;
  note(pane.includes("순서 주의") === seq && sq(pane).includes(sq(d.physicalTitle)), `${n}주 ⑥ 플레이어 몸으로 놀기 — 「${d.physicalTitle}」${seq ? " · 순서 주의 표시" : ""}`);

  // ⑧ 성장 분석 → 승인 → 리포트 (이 주차)
  await page.goto(`${base}${hrefs[1]}`); await page.idle(800, 8000);
  await page.clickText("분석 초안 만들기"); await page.idle(300);
  await page.eval(`[...document.querySelectorAll('section[aria-labelledby=demo-draft] article button')].filter(b=>b.textContent.trim()==='사실 확인했어요').forEach(b=>b.click())`);
  for (const l of ["검토 완료로", "승인"]) await page.clickText(l);
  await page.idle(300);
  const rp = await page.eval(`document.querySelector('section[aria-labelledby=demo-report]')?.innerText ?? ''`);
  note(rp.includes(`${n}주차 「${w.title}」`) && (!d.parentNotice.length || sq(rp).includes(sq(d.parentNotice[0]))), `${n}주 ⑧ 성장분석 → 승인 → 리포트 (이 주차 · 부모 안내 원문)`, rp.slice(0, 200));

  // ⑩ 상세 지도안 (인쇄)
  await page.goto(`${base}${hrefs[2]}`); await page.idle(500, 8000);
  const g = await page.eval(`document.querySelector('main article')?.innerText ?? ''`);
  note(sq(g).includes(sq(d.familyTitle)) && steps.every((s) => sq(g).includes(sq(s.title))) && (!d.crossWeek || sq(g).includes(sq(d.crossWeek))), `${n}주 ⑩ 상세 지도안 — 활동 · 가정연계 · 주차 연계`);
}
writeFileSync(process.argv[3] ?? "qa-teacher-flow.json", JSON.stringify(report, null, 1));
console.log("SUMMARY", pass, "/", pass + fail);
close();
process.exit(0);
