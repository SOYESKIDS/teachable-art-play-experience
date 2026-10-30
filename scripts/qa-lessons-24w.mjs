// 24주 수업 콘텐츠 브라우저 확인 — 실제 화면(Chrome)에서 주차마다
//   ① 주차 상세 교사 대시보드 12개 영역 ② 상세 수업 지도안(/guide) ③ 인쇄 요약 ④ 교실 플레이어(몸으로 놀기 · 만들기 PDF 단계 하나씩)
//   node --import ./tests/register-hooks.mjs scripts/qa-lessons-24w.mjs <base-url> [보고서.json]
// ★ 기대값은 화면 코드가 아니라 데이터(week-dashboards · week-pdf-extra · weeks)에서 만든다.
// ★ 그림은 그 주차 표지(공개 확인분)와 로고만 허용한다 — 다른 주차 그림이 보이면 실패.
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (p) => import(pathToFileURL(join(ROOT, p)).href);
const { launch } = await imp("scripts/cdp.mjs");
const { EXPERIENCE_WEEKS } = await imp("src/data/experience/weeks.ts");
const { weekDashboard, isOfficialGuideWeek } = await imp("src/data/experience/teacher-dashboard/week-dashboards.ts");
const { pdfExtraOf } = await imp("src/data/experience/teacher-dashboard/week-pdf-extra.ts");
const { weekProposal } = await imp("src/data/experience/teacher-dashboard/proposals.ts");

const base = process.argv[2];
const only = process.env.WEEKS ? process.env.WEEKS.split(",").map(Number) : null;
const { page, close } = await launch({ port: 9371 });
let pass = 0, fail = 0;
const report = {};
const note = (ok, label, detail = "") => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${label} ${ok ? "" : String(detail).slice(0, 600)}`); };
const sq = (s) => (s ?? "").normalize("NFC").replace(/[\s?.!,·ˮʼ”“"'‘’()~\-–:;/「」『』…《》#]/g, "");
const splitTitle = (t) => (t.includes(" — ") ? t.slice(0, t.indexOf(" — ")) : t);
const IMG_OK = (n) => new RegExp(`(week-${String(n).padStart(2, "0")}\\.webp|/brand/|logo)`);
const imgs = () => page.eval(`[...document.querySelectorAll('img')].map(i=>i.currentSrc||i.src)`);

/** 주차 데이터에서 화면에 꼭 보여야 할 원문 문장 */
function expected(n) {
  const d = weekDashboard(n);
  // 14 · 17~24주는 공식 가이드 기준 수업 — PDF 추가 칸이 없다 (빈 묶음으로 본다)
  const x = pdfExtraOf(n) ?? { artUse: [], artExamples: [], kitLead: [], kitMissions: [] };
  const p = weekProposal(n);
  const areas = {
    "2 그림책": [d.storybookTitle, d.storySummary, d.storyMessage, x.ebook],
    "3 신체활동": [d.physicalTitle, d.physicalLead, ...d.physicalSteps.flatMap((s) => [s.title, s.guide]), d.coreExperience, d.activityTip, ...(d.physical2 ? [d.physical2.title, ...d.physical2.steps.map((s) => s.title)] : [])],
    "4 미술": [d.artTitle, d.artLead, ...d.artSteps, ...x.artUse, ...x.artExamples, x.artTip],
    "5 워크북": d.workbookSheets.flatMap((s) => [s.title, s.guide]),
    "6 교구": [x.kitNotice, x.kitName, ...x.kitLead, ...d.kitItems, ...d.orgItems, ...x.kitMissions, x.kitUse],
    "7 가족연계": [d.familyTitle, x.familyLead, ...d.familyHow, ...d.familyTalk, x.familyNote, x.familyTip],
    "8 가정용 교구": [d.homeKitName, d.homeKitLead, ...d.homeKitItems, ...d.homeKitHow, x.homeKitNote],
    "9 누리과정": d.nuri.flatMap((a) => [a.area, ...a.items]),
    "10 음원": [...d.media, x.videoDesc],
    "11 관찰": [...(d.observations.length ? d.observations : p?.observations ?? []), d.kidsnote, d.teacherPoint],
    "12 연계": [d.crossWeek, ...d.parentNotice],
    "1 기본": [d.coreTheme, d.keyword, x.topicElements, x.makesKit],
  };
  for (const k of Object.keys(areas)) areas[k] = areas[k].filter(Boolean);
  return areas;
}
function missingIn(text, areas) {
  const t = sq(text);
  const out = [];
  for (const [k, list] of Object.entries(areas)) for (const s of list) if (!t.includes(sq(s))) out.push(`${k}: ${s}`);
  return out;
}

for (const week of EXPERIENCE_WEEKS) {
  const n = week.weekNo;
  if (only && !only.includes(n)) continue;
  const areas = expected(n);
  const total = Object.values(areas).flat().length;
  const r = (report[n] = {});
  await page.viewport(1440, 900);

  // ① 주차 상세 — 12개 영역을 모두 펼쳐 읽는다
  await page.goto(`${base}/experience/weeks/${n}`); await page.idle(600, 8000);
  const det = await page.eval(`(()=>{document.querySelectorAll("details").forEach(d=>d.open=true);return {t:document.body.innerText, areas:document.querySelectorAll('[id^=dash-area-]').length, slots:(document.body.innerText.match(/자료 준비 중/g)||[]).length, guide:!!document.querySelector('a[href$="/${n}/guide"]')}})()`);
  const dm = missingIn(det.t, areas);
  r.dashboard = { missing: dm, slots: det.slots };
  note(det.areas === 12 && dm.length === 0, `${n}주 대시보드 12개 영역 · 원문 ${total}칸 모두 보임`, JSON.stringify(dm));
  note(det.slots > 0 && det.guide, `${n}주 대시보드 「자료 준비 중」 ${det.slots}곳 · 지도안 링크`);
  const di = (await imgs()).filter((s) => !IMG_OK(n).test(s));
  note(di.length === 0, `${n}주 대시보드 그림 — 다른 주차 그림 없음`, JSON.stringify(di));

  // ② 상세 수업 지도안
  await page.goto(`${base}/experience/weeks/${n}/guide`); await page.idle(500, 8000);
  const gd = await page.eval(`(()=>({t:document.body.innerText, h2:[...document.querySelectorAll('article h2')].map(h=>h.textContent.trim()), robots:document.querySelector('meta[name=robots]')?.content??''}))()`);
  const gm = missingIn(gd.t, areas);
  r.guide = { missing: gm, h2: gd.h2 };
  // 14 · 17~24주도 13개 절 — 공식 가이드 원문 전문은 공개 체험에 싣지 않는다 (2026-10-29, 공개 요약만)
  const wantH2 = 13;
  note(gd.h2.length === wantH2 && !gd.t.includes("공식 교사용 수업가이드 원문") && gm.length === 0 && /noindex/.test(gd.robots), `${n}주 상세 지도안 ${wantH2}개 절 · 원문 ${total}칸 · noindex${isOfficialGuideWeek(n) ? " · 가이드 원문 영역 없음" : ""}`, JSON.stringify({ h2: gd.h2.length, gm, robots: gd.robots }));
  const stageTotal = week.stages.reduce((a, s) => a + s.steps.length, 0);
  const guideSteps = await page.eval(`[...document.querySelectorAll('article section')].find(s=>s.querySelector('h2')?.textContent.startsWith('11.'))?.querySelectorAll('ol ol li').length ?? 0`);
  note(guideSteps === stageTotal, `${n}주 지도안 단계별 진행 ${guideSteps}/${stageTotal}줄`);

  // ③ 인쇄 요약
  await page.goto(`${base}/experience/weeks/${n}/print`); await page.idle(400, 6000);
  const pr = await page.eval(`(()=>({rows:document.querySelectorAll('tbody tr').length, guide:!!document.querySelector('a[href$="/guide"]')}))()`);
  note(pr.rows === 5 && pr.guide, `${n}주 인쇄 요약 5단계 · 지도안 링크`, JSON.stringify(pr));

  // ④ 교실 플레이어 — 나란히 보기로 교실 · 교사 화면을 함께 본다
  await page.goto(`${base}/experience/classroom/${n}`); await page.eval("sessionStorage.clear()");
  await page.goto(`${base}/experience/classroom/${n}`); await page.idle(600, 8000);
  await page.clickText("나란히"); await page.idle(200);
  await page.clickText("수업 시작", { exact: false }); await page.idle(400);
  const key = async (k) => { await page.eval(`window.dispatchEvent(new KeyboardEvent('keydown',{key:'${k}'}))`); await page.idle(250); };
  await key("ArrowRight"); await key("ArrowRight"); // 1 → 3단계 (몸으로 놀기)
  r.player = {};
  for (const [si, sk] of [[2, "move"], [3, "make"]]) {
    const stage = week.stages[si];
    const steps = stage.steps;
    const readState = () => page.eval(`(()=>{const c=document.querySelector("[aria-label='교실 화면']");const t=document.querySelector("[aria-label='교사 화면']");
      const card=c?.querySelector('.animate-stage-in.rounded-\\\\[28px\\\\]');
      return {head:document.body.innerText.match(/(\\d) \\/ 5 단계/)?.[1], count:card?.querySelector('p')?.textContent.trim()??null, title:card?.querySelector('p.font-display')?.textContent.trim()??null,
        current:t?[...t.querySelectorAll('ol')[0].children].findIndex(li=>li.getAttribute('aria-current')==='step'):-2,
        nextDisabled:[...document.querySelectorAll('button')].find(b=>b.textContent.includes('다음 활동'))?.disabled??null}})()`);
    const seen = [];
    let ok = true;
    if (steps.length > 1) {
      for (let i = 0; i < steps.length; i++) {
        const s = await readState();
        const want = splitTitle(steps[i].text);
        seen.push(s.title);
        if (s.head !== String(si + 1) || s.count !== `활동 ${i + 1} / ${steps.length}` || sq(s.title) !== sq(want) || s.current !== i) { ok = false; seen.push(`✕ ${JSON.stringify(s)} 기대 ${want}`); }
        if (i < steps.length - 1) await page.clickText("다음 활동 ▶");
        else if (!s.nextDisabled) { ok = false; seen.push("마지막 활동에서 다음 활동 단추가 꺼지지 않음"); }
      }
      await page.clickText("◀ 앞 활동");
      const back = await readState();
      if (back.count !== `활동 ${steps.length - 1} / ${steps.length}`) { ok = false; seen.push(`앞 활동 ✕ ${back.count}`); }
    } else {
      const s = await readState();
      if (s.count !== null) { ok = false; seen.push("PDF 단계가 1개인데 활동 넘기기 카드가 보임"); }
    }
    r.player[sk] = seen;
    note(ok, `${n}주 플레이어 ${stage.title} — PDF 단계 ${steps.length}개를 교실 화면 · 교사 화면에서 하나씩`, seen.join(" | "));
    const pi = (await imgs()).filter((s) => !IMG_OK(n).test(s));
    if (pi.length) note(false, `${n}주 플레이어 그림 — 다른 주차 그림`, JSON.stringify(pi));
    await key("ArrowRight"); // → 다음 수업 단계 (활동 번호가 아니라 단계가 넘어간다)
  }
  const after = await page.eval(`document.body.innerText.match(/(\\d) \\/ 5 단계/)?.[1]`);
  note(after === "5", `${n}주 → 키는 활동이 아니라 수업 단계를 넘긴다 (만들기 뒤 5단계)`, after);
  const share = await page.eval(`document.querySelector("[aria-label='교사 화면']")?.innerText ?? ''`);
  const fam = weekDashboard(n).familyTitle;
  note(!fam || sq(share).includes(sq(fam)), `${n}주 나누기 단계 교사 화면 가정연계 「${fam}」`);
}

writeFileSync(process.argv[3] ?? "qa-lessons-24w.json", JSON.stringify(report, null, 1));
console.log("SUMMARY", pass, "/", pass + fail);
close();
process.exit(0);
