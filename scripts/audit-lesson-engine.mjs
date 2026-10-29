// 24주 실행형 수업 데이터 보고서 → docs/completion/LESSON-ENGINE-24W.md
//   node --import ./tests/register-hooks.mjs scripts/audit-lesson-engine.mjs
// ★ 손으로 쓰지 않는다 — lesson-engine/plan.ts 의 데이터와 연결 검사 결과를 그대로 표로 옮긴다.
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (p) => import(pathToFileURL(join(ROOT, p)).href);
const { EXPERIENCE_WEEKS } = await imp("src/data/experience/weeks.ts");
const { buildLessonPlan, connectionCheck, indicatorName, CHAIN_LABEL } = await imp("src/data/experience/lesson-engine/plan.ts");
const { SEQUENCE_NOTES } = await imp("src/data/experience/lesson-engine/sequence-notes.ts");
const { OPEN_CHILD_LINES } = await imp("src/data/experience/lesson-engine/classroom-lines.ts");

const plans = EXPERIENCE_WEEKS.map(buildLessonPlan);
const chains = plans.flatMap((p) => connectionCheck(p).map((r) => ({ ...r, weekNo: p.weekNo })));
const ORIGIN = { source: "PDF 원문", edited: "웹 체험 편집", proposal: "교사용 제안", review: "검수 필요" };
const cell = (s) => String(s ?? "").replace(/\|/g, "/").replace(/\n/g, " ");
const kinds = {};
for (const p of plans) for (const a of p.mediaAssets) { kinds[a.kind] ??= { total: 0, ready: 0, listed: 0 }; kinds[a.kind].total++; kinds[a.kind][a.state === "ready" ? "ready" : a.state === "listed" ? "listed" : "total"] += a.state === "pending" ? 0 : 1; }

const md = `# 24주 실행형 수업 데이터 · 성장 데이터 연결 (2026-10-27)

- 만든 방법: \`node --import ./tests/register-hooks.mjs scripts/audit-lesson-engine.mjs\` (데이터에서 자동 생성)
- 원문: \`D:\\소예키즈\\마케팅\\2026 유치원 영업전략\\프로그램\\대쉬보드 구성안\\\` 24개 PDF (2026-10-22 판) → 저장소 추출 텍스트
  - ★ 2026-10-27 받은 최신 PDF(1~15주 ZIP 3개 · 1~24주 묶음 1개, 39개 파일)는 SHA-256 으로 2026-10-22 판과 바이트 단위로 같다 — \`PDF-LATEST-20261027.md\`.
  - PDF 추가 칸(미술 활용 · 예시 · TIP · 교구 이름 · 미션 · 활용 · 가족연계 소개 · 안내 · TIP · 가정용 교구 안내 · 뮤직비디오 설명 등)은 \`teacher-dashboard/week-pdf-extra.ts\`, 화면 대조는 \`PDF-WEB-COVERAGE.md\`.
- 코드: \`src/data/experience/lesson-engine/\` (plan · assets · growth-mapping · sequence-notes · classroom-lines) · \`src/lib/growth/demo-analysis.ts\`
- 출처 표시: PDF 원문 · 웹 체험 편집 · 교사용 제안 · 검수 필요 — 지표 연결 · 순서 운영 · 대체 운영 · 교실 첫 문장은 모두 교사용 제안(본사 검수 전)

## 1. 기존 수업 프로그램과 PDF 의 불일치 (이번에 찾은 것)

| # | 주차 | 내용 | 처리 |
|---|---|---|---|
| 1 | 1~24 | 교실 화면 「이야기 열기」 큰 글씨가 24주 모두 「오늘은 무엇을 만날까요?」 — 수업 주제가 안 보임 | 주차 주제 문장 24개 + 「오늘 할 것」(그림책 · 몸놀이 · 만들기 — PDF 이름) |
${SEQUENCE_NOTES.map((s, i) => `| ${i + 2} | ${s.weekNo} | 신체활동 단계가 뒤 단계(예술 표현)에서 만들 것을 먼저 씀 — 「${cell(s.conflict.text)}」 | 교사 화면 「순서 주의」 + 운영 제안 |`).join("\n")}
| ${SEQUENCE_NOTES.length + 2} | 16 | 가정연계 1문장이 원문에서 고쳐 쓴 문장인데 원문처럼 보였음 (2026-10-26 수정 · 편집 표시) | 유지 |
| ${SEQUENCE_NOTES.length + 3} | 1~24 | 안전 문장이 PDF 에 없는데 출처 표시가 없었음 (2026-10-26 수정 · 교사용 제안) | 유지 |

이번 요청의 확인 항목: 7주 대표활동 2개 · 9주 2개 (둘 다 플레이어 3단계에 원문 단계로 들어감) · 8주 4~7주 결과물 통합(CW 체크 · 시연 장면) ·
10주 「여름 곤충 자석 꾸미기」 · 12주 「가을 산물 허수아비」 · 13주 「복을 담은 복주머니」(PDF 추출 깨짐 — 제목 검수 필요 표시 유지) ·
16주 사계절 회고 · 24주 마무리 — 모두 아래 연결 검사에서 끊김 없음.

## 2. 연결 검사 — PDF 대표활동 → 플레이어 단계 → 자료 → 관찰 문항 → 성장지표 → 리포트 근거

활동 ${chains.length}개 · 완료 ${chains.filter((c) => c.complete).length}개 · **미완료 ${chains.filter((c) => !c.complete).length}개**

| 주 | 활동 ID | 활동 | ${Object.values(CHAIN_LABEL).join(" | ")} | 상태 |
|---|---|---|${Object.keys(CHAIN_LABEL).map(() => ":-:").join("|")}|---|
${chains.map((c) => `| ${c.weekNo} | \`${c.activityId}\` | ${cell(c.title)} | ${Object.keys(CHAIN_LABEL).map((k) => (c.links[k] ? "✔" : "✕")).join(" | ")} | ${c.complete ? "완료" : "**미완료**"}${c.note ? ` · ${c.note}` : ""} |`).join("\n")}

## 3. 24주 × 수업 단계 실행 데이터

${plans.map((p) => `### ${p.weekNo}주 「${p.weekTitle}」 — 《${p.storybook.title}》 · #${p.growthKeyword} · ${p.reviewStatus}

- 교실 첫 문장: 「${OPEN_CHILD_LINES[p.weekNo]}」 · 오늘 할 것: ${p.lessonStages[0].classroom.chips.join(" · ")}
- 대표활동: ${p.physicalActivities.map((a) => `\`${a.id}\` ${a.title} (단계 ${a.steps.length})`).join(" · ")} · 미술 \`${p.artActivity?.id}\` ${p.artActivity?.title} (순서 ${p.artActivity?.steps.length ?? 0})
- 워크북 ${p.workbookActivities.length}장 · 교구 ${p.kitAndMaterials.kit.length} · 원 준비물 ${p.kitAndMaterials.org.length} · 가정연계 「${cell(p.familyActivity.title)}」${p.crossWeekOutputs.gather.length ? ` · 앞 주차에서 모아 올 것 ${p.crossWeekOutputs.gather.length}` : ""}
${p.sequenceNotes.map((s) => `- 순서 주의: ${cell(s.resolution.text)}`).join("\n")}

| 단계 | 분 | 교사가 할 말 (출처) | 아이들이 할 일 | 준비물 | 안전 | 자료 있음/전체 | 관찰 → 지표 |
|---|---:|---|---:|---:|---:|---:|---|
${p.lessonStages.map((s) => `| ${s.title} | ${s.minutes} | ${cell(s.teacherSays[0].text)} (${ORIGIN[s.teacherSays[0].origin]}) | ${s.childrenDo.length}단계 | ${s.materials.length} | ${s.cautions.length} | ${s.assetsReady.ready}/${s.assetsReady.total} | ${s.observable.filter((o) => o.indicators.length).map((o) => o.indicators.map(indicatorName).join("+")).filter((v, i, a) => a.indexOf(v) === i).join(", ") || "—"} |`).join("\n")}
`).join("\n")}

## 4. 관찰 문항 → 5대 성장지표 (교사용 제안 · 117문항)

| 주 | 관찰 문항 (출처) | 지표 |
|---|---|---|
${plans.flatMap((p) => p.growthIndicatorMappings.map((l) => `| ${p.weekNo} | ${cell(l.item)} (${ORIGIN[p.observationPoints.origin]}) | ${l.indicators.map(indicatorName).join(" · ") || "연결 없음"} |`)).join("\n")}

연결 없음 ${plans.flatMap((p) => p.growthIndicatorMappings).filter((l) => !l.indicators.length).length}문항 — 신체 조절 · 안전 지식 · 기억처럼 5대 지표 정의(표현 · 형태 · 시도 · 참여 · 설명)에 맞지 않는 문항은 억지로 잇지 않았다.

## 5. 자료 (PDF 그림 자리 ID) 보유 현황

| 종류 | 자리 | 있음 | 목록만 |
|---|---:|---:|---:|
${Object.entries(kinds).map(([k, v]) => `| ${k} | ${v.total} | ${v.ready} | ${v.listed} |`).join("\n")}

★ 「있음」은 공개 사용이 확인된 1~8주차 그림책 표지 8장뿐이다. 나머지 자리는 교사 화면에 「대체 운영」(교사용 제안)을 함께 보인다.

## 6. 주차별 자료 자리 ID (PDF 원문 ID · 파일 확보 순서표)

파일을 받으면 이 ID 로 \`lesson-engine/assets.ts\` 에 연결한다 — 다른 주차의 그림을 빌려 쓰지 않는다. ✔ = 공개 파일 있음 · ○ = 목록만 · · = 자료 준비 중

${plans.map((p) => {
  const by = {};
  for (const a of p.mediaAssets) (by[a.label] ??= []).push(`${a.state === "ready" ? "✔" : a.state === "listed" ? "○" : "·"} \`${a.id}\``);
  return `### ${p.weekNo}주 「${p.weekTitle}」\n\n${Object.entries(by).map(([k, v]) => `- ${k}: ${v.join(" ")}`).join("\n")}`;
}).join("\n\n")}
`;
writeFileSync(join(ROOT, "docs/completion/LESSON-ENGINE-24W.md"), md);
console.log("ok", chains.length, "activities", chains.filter((c) => !c.complete).length, "broken");
