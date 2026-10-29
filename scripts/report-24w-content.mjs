// 24주 수업 콘텐츠 최종 표 → docs/completion/CURRICULUM-24W-CONTENT-FINAL.md
//   node --import ./tests/register-hooks.mjs scripts/report-24w-content.mjs
// ★ 손으로 쓰지 않는다 — 화면이 읽는 데이터(week-dashboards · week-pdf-extra · lesson-engine)에서 그대로 센다.
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (p) => import(pathToFileURL(join(ROOT, p)).href);
const { EXPERIENCE_WEEKS } = await imp("src/data/experience/weeks.ts");
const { weekDashboard, editedLines } = await imp("src/data/experience/teacher-dashboard/week-dashboards.ts");
const { pdfExtraOf } = await imp("src/data/experience/teacher-dashboard/week-pdf-extra.ts");
const { buildLessonPlan, connectionCheck } = await imp("src/data/experience/lesson-engine/plan.ts");

const cell = (s) => String(s ?? "—").replace(/\|/g, "/");
const rows = EXPERIENCE_WEEKS.map((w) => {
  const d = weekDashboard(w.weekNo);
  // 14 · 17~24주는 공식 가이드 기준 수업 — PDF 추가 칸이 없다
  const x = pdfExtraOf(w.weekNo) ?? { artUse: [], artExamples: [], kitLead: [], kitMissions: [] };
  const p = buildLessonPlan(w);
  const chains = connectionCheck(p);
  const ready = p.mediaAssets.filter((a) => a.state === "ready").length;
  const move = w.stages.find((s) => s.key === "move");
  const make = w.stages.find((s) => s.key === "make");
  return [
    `${w.weekNo} 「${cell(w.title)}」`,
    `《${cell(d.storybookTitle)}》${x.ebook ? ` · E-BOOK ${x.ebook}` : ""}`,
    `${cell(d.physicalTitle)} (${d.physicalSteps.length}단계)${d.physical2 ? ` + ${cell(d.physical2.title)} (${d.physical2.steps.length}단계)` : ""} · 플레이어 ${move.steps.length}개 하나씩`,
    `${cell(d.artTitle)} (순서 ${d.artSteps.length}${x.artUse.length ? ` · 활용 ${x.artUse.length}` : ""}${x.artTip ? " · TIP" : ""}) · 플레이어 ${make.steps.length > 1 ? `${make.steps.length}개 하나씩` : "1개"}`,
    `${d.workbookSheets.length}장`,
    `${cell(x.kitName)} · 구성 ${d.kitItems.length} · 원 준비물 ${d.orgItems.length}${x.kitMissions.length ? ` · 미션 ${x.kitMissions.length}` : ""}`,
    `${cell(d.familyTitle)} (방법 ${d.familyHow.length} · 대화 ${d.familyTalk.length}${x.familyNote ? " · 안내" : ""}${x.familyTip ? " · TIP" : ""})`,
    `${cell(d.homeKitName)}${d.homeKitHow.length ? ` (방법 ${d.homeKitHow.length})` : ""}`,
    `${d.nuri.length}영역`,
    `음원 ${d.media.length}곡 · 영상 설명 ${x.videoDesc ? "있음" : "—"} · 파일 준비 중`,
    `관찰 ${p.observationPoints.items.length}문항 → 지표 연결 ${p.growthIndicatorMappings.filter((l) => l.indicators.length).length} · 활동 연결 ${chains.filter((c) => c.complete).length}/${chains.length}`,
    d.crossWeek ? "있음 (원문)" : "—",
    `공개 파일 ${ready} / 자리 ${p.mediaAssets.length}${editedLines(w.weekNo).length ? ` · 편집 문장 ${editedLines(w.weekNo).length}` : ""}`,
  ];
});
const HEAD = ["주차", "그림책", "대표 신체활동", "미술", "워크북", "교구 · 놀이자료", "가족연계", "가정용 교구 · 지원", "누리과정", "음원 · 영상", "관찰 · 5대 지표", "주차 연계", "자료 파일"];
const md = `# 24주 수업 콘텐츠 최종 표 (2026-10-27)

- 만든 방법: \`node --import ./tests/register-hooks.mjs scripts/report-24w-content.mjs\` — 화면이 읽는 데이터를 그대로 센다
- 원문: 24개 PDF (2026-10-27 묶음 = 2026-10-22 판, SHA-256 동일 — \`PDF-LATEST-20261027.md\`)
- 화면 대조: \`PDF-WEB-COVERAGE.md\` (만들어진 HTML 에서 원문 줄을 찾는다)
- 「파일 준비 중」 — 공개 사용이 확인된 파일은 1~8주 그림책 표지뿐이다. 워크북 · 음원 · 영상 · 교구 사진 · 활동 사진은 모두 「자료 준비 중」 + 글로 된 운영 방법이다.

| ${HEAD.join(" | ")} |
|${HEAD.map(() => "---").join("|")}|
${rows.map((r) => `| ${r.join(" | ")} |`).join("\n")}
`;
writeFileSync(join(ROOT, "docs/completion/CURRICULUM-24W-CONTENT-FINAL.md"), md);
console.log("ok", rows.length);
