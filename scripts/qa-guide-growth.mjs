// 상세 지도안 · 인쇄 요약 24주 접근성 · A4 인쇄 + 성장 분석 체험(주차별) + 키즈보드 연결 — 실제 Chrome
//   node --import ./tests/register-hooks.mjs scripts/qa-guide-growth.mjs <base-url> [보고서.json]
// ★ axe-core (WCAG 2.1 A/AA) 를 화면 · 인쇄 매체 둘 다에서 돌린다. 인쇄는 A4 폭(794px)에서 글자 크기 · 가로 넘침 · 사이트 머리말 숨김을 본다.
// ★ 성장 분석: ?week=N 으로 들어오면 그 주차 · 그 주차 기록만 보이는지, 주차를 바꾸면 다른 주차 기록이 남지 않는지 본다.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (p) => import(pathToFileURL(join(ROOT, p)).href);
const { launch } = await imp("scripts/cdp.mjs");
const { EXPERIENCE_WEEKS } = await imp("src/data/experience/weeks.ts");
const { buildLessonPlan } = await imp("src/data/experience/lesson-engine/plan.ts");
const { kidsboardSetFor, kidsboardRows } = await imp("src/data/experience/kidsboard.ts");
const AXE = readFileSync(join(ROOT, "node_modules/axe-core/axe.min.js"), "utf8");
const AXE_VER = JSON.parse(readFileSync(join(ROOT, "node_modules/axe-core/package.json"), "utf8")).version;

const base = process.argv[2];
const only = process.env.WEEKS ? process.env.WEEKS.split(",").map(Number) : null;
const { page, close } = await launch({ port: 9373 });
let pass = 0, fail = 0;
const out = [];
const note = (ok, label, detail = "") => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${label} ${ok ? "" : String(detail).slice(0, 700)}`); };

async function axe(label) {
  await page.send("Runtime.evaluate", { expression: AXE });
  const r = await page.eval(`(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},resultTypes:['violations']});
    return r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,t:v.nodes.slice(0,3).map(x=>x.target.join(' ')+' :: '+(x.any[0]?.message??'').slice(0,120))}))})()`);
  out.push({ label, violations: r });
  return r;
}

/** A4 인쇄 — 가장 작은 글자 · 가로로 넘치는 요소 · 머리말/꼬리말 숨김 */
const PRINT_CHECK = `(()=>{const art=document.querySelector('main article');const sizes=[];const w=document.createTreeWalker(art,NodeFilter.SHOW_TEXT);
  while(w.nextNode()){const t=w.currentNode;if(!t.textContent.trim())continue;const el=t.parentElement;if(!el.getClientRects().length)continue;sizes.push(parseFloat(getComputedStyle(el).fontSize));}
  const aw=art.getBoundingClientRect().right;const over=[...art.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>aw+1}).slice(0,3).map(e=>e.tagName+':'+(e.textContent||'').trim().slice(0,30));
  return {min:Math.min(...sizes),small:sizes.filter(s=>s<11).length,total:sizes.length,over,docOver:document.documentElement.scrollWidth>innerWidth+1,
    chrome:['body > header','body > footer','header[role=banner]'].filter(s=>document.querySelector(s)?.getClientRects().length).length,
    hiddenBtn:[...document.querySelectorAll('button')].filter(b=>b.getClientRects().length).length}})()`;

for (const week of EXPERIENCE_WEEKS) {
  const n = week.weekNo;
  if (only && !only.includes(n)) continue;
  for (const kind of ["guide", "print"]) {
    await page.viewport(1280, 900);
    await page.send("Emulation.setEmulatedMedia", { media: "" });
    await page.goto(`${base}/experience/weeks/${n}/${kind}`); await page.idle(500, 8000);
    const ok = await page.waitFor("!!document.querySelector('main article')", 10000);
    if (!ok) { note(false, `${n}주 ${kind} 렌더링`); continue; }
    const v1 = await axe(`${n} ${kind} screen`);
    await page.viewport(794, 1123);
    await page.send("Emulation.setEmulatedMedia", { media: "print" });
    const v2 = await axe(`${n} ${kind} print`);
    const r = await page.eval(PRINT_CHECK);
    await page.send("Emulation.setEmulatedMedia", { media: "" });
    out.push({ label: `${n} ${kind} A4`, ...r });
    note(v1.length === 0 && v2.length === 0, `${n}주 ${kind} axe 화면 · 인쇄`, JSON.stringify([...v1, ...v2]));
    note(r.min >= 11 && r.over.length === 0 && !r.docOver && r.chrome === 0 && r.hiddenBtn === 0, `${n}주 ${kind} A4 (최소 ${r.min}px · 넘침 없음 · 메뉴 · 단추 숨김)`, JSON.stringify(r));
  }

  // 주차 대시보드 — 키즈보드 연결 · 수업 흐름
  await page.viewport(1440, 900);
  await page.goto(`${base}/experience/weeks/${n}`); await page.idle(500, 8000);
  const kb = await page.eval(`(()=>{const k=document.getElementById('dash-kidsboard');const f=document.querySelector('nav[aria-label="수업 흐름"]');
    return {items:k?[...k.querySelectorAll('li')].map(li=>li.querySelector('span.font-bold')?.textContent.trim()):[], text:k?.innerText??'', flow:f?f.querySelectorAll('li').length:0,
      growth:!!document.querySelector('a[href="/experience/growth-demo?week=${n}"]')}})()`);
  const set = kidsboardSetFor(n);
  const want = kidsboardRows(n).filter((r) => !set || r.set === set).map((r) => r.name);
  note(JSON.stringify(kb.items) === JSON.stringify(want) && (set ? kb.text.includes(`세트 ${set}`) : kb.text.includes("세트 미정")) && kb.flow === 10 && kb.growth,
    `${n}주 키즈보드 ${set ? `세트 ${set}` : "세트 미정"} ${kb.items.length}메뉴 · 수업 흐름 10단계 · 성장분석 링크`, JSON.stringify(kb).slice(0, 400));
  const vd = await axe(`${n} dashboard`);
  note(vd.length === 0, `${n}주 대시보드 axe`, JSON.stringify(vd));

  // 성장 분석 — 이 주차로 들어와 이 주차 기록만
  const plan = buildLessonPlan(week);
  const acts = [...plan.physicalActivities, ...(plan.artActivity ? [plan.artActivity] : [])].map((a) => a.title);
  await page.goto(`${base}/experience/growth-demo?week=${n}`); await page.idle(800, 8000);
  const g = await page.eval(`(()=>{const sel=[...document.querySelectorAll('select')].find(s=>[...s.options].some(o=>o.textContent.startsWith('24주')));
    const heads=[...document.querySelectorAll('#demo-records ~ ol li > p:first-child, section[aria-labelledby=demo-records] ol > li > p:first-child')].map(p=>p.textContent);
    return {week:sel?.value, heads, acts:[...document.querySelectorAll('section[aria-labelledby=demo-records] ol > li select')].filter((s,i)=>i%6===0).map(s=>s.selectedOptions[0]?.textContent)}})()`);
  const onlyThis = g.heads.length > 0 && g.heads.every((h) => h.includes(` · ${n}주차 · `));
  note(g.week === String(n) && onlyThis && g.acts.every((a) => acts.some((t) => a?.endsWith(t))), `${n}주 성장분석 ?week=${n} — 이 주차 활동 · 기록 ${g.heads.length}개만`, JSON.stringify(g).slice(0, 500));
  await page.clickText("분석 초안 만들기");
  await page.idle(300);
  const d = await page.eval(`(()=>({stmts:document.querySelectorAll('section[aria-labelledby=demo-draft] article').length, blocked:!!document.querySelector('section[aria-labelledby=demo-draft] [role=alert]')}))()`);
  // 교사 검토 — AI 문장마다 「사실 확인했어요」 → 검토 완료 → 승인
  await page.eval(`[...document.querySelectorAll('section[aria-labelledby=demo-draft] article button')].filter(b=>b.textContent.trim()==='사실 확인했어요').forEach(b=>b.click())`);
  await page.idle(300);
  for (const label of ["검토 완료로", "승인"]) await page.clickText(label);
  await page.idle(300);
  const rp = await page.eval(`(()=>{const s=document.querySelector('section[aria-labelledby=demo-report]');return {open:!!s, text:s?.innerText??''}})()`);
  note(d.stmts > 0 && !d.blocked, `${n}주 분석 초안 ${d.stmts}문장`, JSON.stringify(d));
  const otherWeek = EXPERIENCE_WEEKS.filter((w) => w.weekNo !== n).some((w) => rp.text.includes(`${w.weekNo}주차 「${w.title}」`));
  note(rp.open && rp.text.includes(`${n}주차 「${week.title}」`) && acts.every((t) => rp.text.includes(t)) && !otherWeek, `${n}주 사실 확인 → 검토 → 승인 → 리포트 미리보기 (이 주차 활동만)`, rp.text.slice(0, 300));
}

// 주차를 바꾸면 앞 주차 기록이 남지 않는다
await page.goto(`${base}/experience/growth-demo?week=4`); await page.idle(800, 8000);
await page.eval(`(()=>{const sel=[...document.querySelectorAll('select')].find(s=>[...s.options].some(o=>o.textContent.startsWith('24주')));
  const set=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set;set.call(sel,'21');sel.dispatchEvent(new Event('change',{bubbles:true}));})()`);
await page.idle(500);
const sw = await page.eval(`[...document.querySelectorAll('section[aria-labelledby=demo-records] ol > li > p:first-child')].map(p=>p.textContent)`);
note(sw.length > 0 && sw.every((h) => h.includes(" · 21주차 · ")), "주차 4 → 21 바꾸면 4주 기록이 남지 않는다", JSON.stringify(sw));
const st = await page.eval(`JSON.stringify({ls:Object.keys(localStorage), ss:Object.keys(sessionStorage), ck:document.cookie})`);
note(st === JSON.stringify({ ls: [], ss: [], ck: "" }), "성장 분석 — 브라우저 저장 · 쿠키 없음", st);
const inputs = await page.eval(`document.querySelectorAll('input:not([type=hidden]), textarea, form').length`);
note(inputs === 0, "성장 분석 — 글 입력 칸 · 폼 없음 (개인정보 받지 않음)", inputs);

writeFileSync(process.argv[3] ?? "qa-guide-growth.json", JSON.stringify({ axe: AXE_VER, out }, null, 1));
console.log(`axe-core ${AXE_VER}`);
console.log("SUMMARY", pass, "/", pass + fail);
close();
process.exit(0);
