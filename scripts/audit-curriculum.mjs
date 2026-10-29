// 24주 × 22항목 원문 대조표를 만든다 → docs/completion/CURRICULUM-24W-FINAL-AUDIT.md
//
//   node --import ./tests/register-hooks.mjs scripts/audit-curriculum.mjs
//
// ★ 손으로 판정하지 않는다. 화면 데이터(week-dashboards · weeks · lesson-support)의 문장이
//   저장소의 PDF 추출 텍스트에 그대로(또는 낱말이 모두) 있는지 기계로 대조한다.
// ★ 판정: ✔ 원문 확인 · ✎ 웹 체험 편집 · ◇ 교사용 제안 · ∅ 원문 「미작성」 · ✕ 자료 없음(검수 필요) · △ 원문과 일부 다름(검수 필요)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (p) => import(pathToFileURL(join(ROOT, p)).href);
const { EXPERIENCE_WEEKS } = await imp("src/data/experience/weeks.ts");
const { weekDashboard, gatherForWeek, isEditedLine, EDITED_LINES } = await imp("src/data/experience/teacher-dashboard/week-dashboards.ts");
const { TEACHER_POINT_PROPOSALS, weekProposal } = await imp("src/data/experience/teacher-dashboard/proposals.ts");
const { SAFETY_ORIGIN } = await imp("src/data/experience/lesson-support.ts");

const SRC_DIR = join(ROOT, "docs/curriculum-upgrade/TAP_Curriculum_Development_Pack/TeachAble_24Week_Dashboard_DevPack/source_text");
const sourceText = (n) => readFileSync(n <= 20 ? join(SRC_DIR, `week-${String(n).padStart(2, "0")}.txt`) : join(ROOT, `docs/curriculum-upgrade/dashboard-source-21-24/week-${n}.txt`), "utf8");
// PDF 추출본은 작은따옴표를 ʼ(U+02BC)로 적은 곳이 있다 — 같은 글자로 본다
const squash = (s) => s.normalize("NFC").replace(/[\s?.!,·ˮʼ”“"'‘’()~\-–]/g, "");

const ITEMS = [
  "주차명", "성장 키워드", "교육 목표", "그림책 제목", "줄거리", "대표 신체활동", "신체 단계", "미술활동", "미술 순서",
  "워크북", "교구 · 구성품", "기관 준비물", "가정연계", "가정용 교구", "누리과정", "음원 · 영상", "운영 포인트",
  "관찰 문항", "성장기록 예시", "부모 안내", "안전", "주차 연계",
];
const MARK = { ok: "✔", edited: "✎", proposal: "◇", blank: "∅", none: "✕", diff: "△" };

const notes = [];
const rows = [];
for (const w of EXPERIENCE_WEEKS) {
  const n = w.weekNo;
  const d = weekDashboard(n);
  const p = weekProposal(n);
  const src = squash(sourceText(n));
  const has = (t) => {
    if (!t) return false;
    const words = t.split(/\s+/).map(squash).filter((x) => x.length >= 2);
    return src.includes(squash(t)) || (words.length > 0 && words.every((x) => src.includes(x)));
  };
  const blank = (label) => d.missingInSource.some((m) => m.includes(label));
  const judge = (label, values, missLabel) => {
    const all = (Array.isArray(values) ? values : [values]).filter(Boolean);
    const list = all.filter((x) => !isEditedLine(n, x));
    if (!all.length) return missLabel && blank(missLabel) ? "blank" : "none";
    if (list.length < all.length && list.every(has)) return "edited";
    const bad = list.filter((x) => !has(x));
    if (bad.length) {
      notes.push(`- ${n}주 ${label}: 원문과 다른 문장 ${bad.length}/${list.length} — ${bad.slice(0, 2).map((x) => `「${x.slice(0, 40)}」`).join(" ")}`);
      return "diff";
    }
    return "ok";
  };
  const r = {};
  r["주차명"] = d.pdfTitle && d.pdfTitle.replace(/\s/g, "") === w.title.replace(/\s/g, "") ? judge("주차명", d.pdfTitle) : "diff";
  if (r["주차명"] === "diff" && !(d.pdfTitle && d.pdfTitle.replace(/\s/g, "") === w.title.replace(/\s/g, ""))) notes.push(`- ${n}주 주차명: 화면 「${w.title}」 · 자료 「${d.pdfTitle}」`);
  r["성장 키워드"] = d.keyword === w.growthKeyword ? judge("성장 키워드", d.keyword) : "diff";
  r["교육 목표"] = d.goals.length ? judge("교육 목표", d.goals) : p?.goals.length ? "proposal" : blank("목표") ? "blank" : "none";
  r["그림책 제목"] = judge("그림책 제목", d.storybookTitle);
  r["줄거리"] = judge("줄거리", [d.storySummary, d.storyMessage]);
  r["대표 신체활동"] = judge("대표 신체활동", d.physicalTitle);
  r["신체 단계"] = judge("신체 단계", d.physicalSteps.flatMap((s) => [s.title, s.guide]));
  r["미술활동"] = judge("미술활동", d.artTitle);
  r["미술 순서"] = judge("미술 순서", d.artSteps);
  r["워크북"] = judge("워크북", d.workbookSheets.flatMap((s) => [s.title, s.guide]), "워크북");
  r["교구 · 구성품"] = judge("교구", d.kitItems, "교구");
  r["기관 준비물"] = judge("기관 준비물", d.orgItems, "준비물");
  r["가정연계"] = judge("가정연계", [d.familyTitle, ...d.familyHow], "가족");
  r["가정용 교구"] = judge("가정용 교구", [d.homeKitName, ...d.homeKitItems], "가정용");
  r["누리과정"] = judge("누리과정", d.nuri.flatMap((x) => x.items), "누리");
  r["음원 · 영상"] = d.media.length ? judge("음원", d.media) : blank("음원") ? "blank" : "none";
  r["운영 포인트"] = d.teacherPoint ? judge("운영 포인트", d.teacherPoint) : TEACHER_POINT_PROPOSALS[n] ? "proposal" : blank("운영") ? "blank" : "none";
  r["관찰 문항"] = d.observations.length ? judge("관찰 문항", d.observations) : p?.observations.length ? "proposal" : blank("관찰") ? "blank" : "none";
  r["성장기록 예시"] = judge("성장기록 예시", d.kidsnote, "성장기록");
  r["부모 안내"] = judge("부모 안내", d.parentNotice, "부모");
  r["안전"] = SAFETY_ORIGIN === "source" ? judge("안전", w.body.safety) : SAFETY_ORIGIN;
  r["주차 연계"] = d.crossWeek || gatherForWeek(n).length ? judge("주차 연계", d.crossWeek) : "none";
  rows.push({ n, title: w.title, r });
}

const count = (k) => rows.reduce((s, x) => s + Object.values(x.r).filter((v) => v === k).length, 0);
const total = rows.length * ITEMS.length;
const md = `# 24주 커리큘럼 원문 대조표 (최종)

- 만든 날: 2026-10-26 · 만든 방법: \`node --import ./tests/register-hooks.mjs scripts/audit-curriculum.mjs\` (기계 대조 — 다시 돌리면 같은 표가 나온다)
- 원문: 저장소의 주차 PDF 추출 텍스트 (1~20주 \`docs/curriculum-upgrade/TAP_Curriculum_Development_Pack/.../source_text\`, 21~24주 \`docs/curriculum-upgrade/dashboard-source-21-24\`)
- 대조 대상: 교사 대시보드 12개 영역이 쓰는 데이터(\`week-dashboards.ts\`) · 화면 주차명/키워드(\`weeks.ts\`) · 안전 안내(\`lesson-support.ts\`)
- 판정: ✔ 원문 확인 · ✎ 원문을 고쳐 씀(편집 표시) · ◇ 교사용 제안(검수 전) · ∅ 원문에 「미작성」 · ✕ 자료 없음(검수 필요) · △ 원문과 일부 다름(검수 필요)

## 요약

| 판정 | 칸 수 | 비율 |
|---|---:|---:|
| ✔ 원문 확인 | ${count("ok")} | ${Math.round((count("ok") / total) * 100)}% |
| ✎ 고쳐 씀 | ${count("edited")} | ${Math.round((count("edited") / total) * 100)}% |
| ◇ 교사용 제안 | ${count("proposal")} | ${Math.round((count("proposal") / total) * 100)}% |
| ∅ 원문 미작성 | ${count("blank")} | ${Math.round((count("blank") / total) * 100)}% |
| ✕ 자료 없음 | ${count("none")} | ${Math.round((count("none") / total) * 100)}% |
| △ 일부 다름 | ${count("diff")} | ${Math.round((count("diff") / total) * 100)}% |
| 합계 | ${total} | |

★ 「안전」 열은 24주 모두 ◇ 이다 — 자료 PDF 에 안전 유의사항 항목이 따로 없다. 화면 · 인쇄물에 「교사용 제안」으로 표시한다.
★ 「✎」은 원문을 일부러 고쳐 쓴 문장이 있는 칸이다 — 화면에 「웹 체험 편집」으로 표시한다:
${EDITED_LINES.map((e) => `  - ${e.weekNo}주 「${e.text}」 ← 원문 「${e.original}」 (${e.reason})`).join("\n")}
★ 「✔」은 문장이 원문 텍스트에 있다는 뜻이다. 본사가 교안으로 승인했다는 뜻이 아니다 (9~24주 「개편 후보 · 검수 전」 유지).

## 24주 × 22항목

| 주 | 화면 제목 | ${ITEMS.join(" | ")} |
|---|---|${ITEMS.map(() => ":-:").join("|")}|
${rows.map((x) => `| ${x.n} | ${x.title} | ${ITEMS.map((k) => MARK[x.r[k]]).join(" | ")} |`).join("\n")}

## 검수가 필요한 칸 (△ · ✕)

${notes.length ? notes.join("\n") : "- 없음"}
${rows.flatMap((x) => ITEMS.filter((k) => x.r[k] === "none").map((k) => `- ${x.n}주 ${k}: 자료에서 찾지 못함 — 화면은 「자료에서 확인하지 못했습니다」로 적는다`)).join("\n")}

## 원문에 「미작성」으로 적힌 칸 (∅)

${rows.flatMap((x) => ITEMS.filter((k) => x.r[k] === "blank").map((k) => `- ${x.n}주 ${k}`)).join("\n") || "- 없음"}
`;
mkdirSync(join(ROOT, "docs/completion"), { recursive: true });
writeFileSync(join(ROOT, "docs/completion/CURRICULUM-24W-FINAL-AUDIT.md"), md);
console.log(`ok ✔${count("ok")} ◇${count("proposal")} ∅${count("blank")} ✕${count("none")} △${count("diff")} / ${total}`);
