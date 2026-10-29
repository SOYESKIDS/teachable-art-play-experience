// 24주 실행형 수업 데이터 · 관찰 → 5대 지표 · 가상 성장 분석 · 검토 승인 흐름
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { EXPERIENCE_WEEKS } from "../src/data/experience/weeks.ts";
import { WEEK_DASHBOARDS } from "../src/data/experience/teacher-dashboard/week-dashboards.ts";
import { buildLessonPlan, connectionCheck } from "../src/data/experience/lesson-engine/plan.ts";
import { indicatorsFor } from "../src/data/experience/lesson-engine/growth-mapping.ts";
import { weekAssets } from "../src/data/experience/lesson-engine/assets.ts";
import { MEDIA_SLOT_IDS } from "../src/data/experience/lesson-engine/media-slots-generated.ts";
import { OPEN_CHILD_LINES } from "../src/data/experience/lesson-engine/classroom-lines.ts";
import { SEQUENCE_NOTES } from "../src/data/experience/lesson-engine/sequence-notes.ts";
import { DEMO_SCENARIOS } from "../src/data/experience/growth-demo-scenarios.ts";
import { GROWTH_INDICATORS } from "../src/data/experience/report.ts";
import * as G from "../src/lib/growth/demo-analysis.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "docs/curriculum-upgrade/TAP_Curriculum_Development_Pack/TeachAble_24Week_Dashboard_DevPack/source_text");
const sourceText = (n) => readFileSync(n <= 20 ? join(SRC_DIR, `week-${String(n).padStart(2, "0")}.txt`) : join(ROOT, `docs/curriculum-upgrade/dashboard-source-21-24/week-${n}.txt`), "utf8");
const sq = (s) => s.normalize("NFC").replace(/[\s?.!,·ˮʼ”“"'‘’()~\-–]/g, "");
const NAME = Object.fromEntries(GROWTH_INDICATORS.map((g) => [g.code, g.name]));
const DEF = Object.fromEntries(GROWTH_INDICATORS.map((g) => [g.code, g.definition]));
const plans = EXPERIENCE_WEEKS.map(buildLessonPlan);

test("24주 실행형 데이터 — 요구한 항목이 모두 있고 45분 · 단계 5개다", () => {
  const KEYS = ["weekNo", "weekTitle", "storybook", "learningGoals", "growthKeyword", "lessonDuration", "lessonStages", "physicalActivities", "artActivity",
    "workbookActivities", "kitAndMaterials", "safetyGuidance", "teacherQuestions", "observationPoints", "growthIndicatorMappings", "familyActivity",
    "crossWeekOutputs", "mediaAssets", "sourceReferences", "reviewStatus"];
  for (const p of plans) {
    for (const k of KEYS) assert.ok(k in p, `${p.weekNo}주 ${k}`);
    assert.equal(p.lessonStages.length, 5);
    assert.equal(p.lessonStages.reduce((a, s) => a + s.minutes, 0), 45, `${p.weekNo}주 45분`);
    for (const s of p.lessonStages) {
      assert.match(s.id, new RegExp(`^w${p.weekNo}\\.stage\\.`));
      assert.ok(s.teacherSays.length && s.teacherDoes.length && s.childrenDo.length, `${s.id} 교사 말 · 행동 · 아이 행동`);
      assert.ok(s.classroom.line.trim(), `${s.id} 교실 화면`);
    }
    assert.ok(p.learningGoals.length && p.storybook.title && p.familyActivity.title, `${p.weekNo}주 목표 · 그림책 · 가정연계`);
  }
});

test("PDF 대표활동 개수 그대로 — 7 · 9주는 신체활동 둘, 나머지는 하나, 미술은 24주 모두 하나", () => {
  for (const p of plans) {
    const d = WEEK_DASHBOARDS.find((x) => x.weekNo === p.weekNo);
    assert.equal(p.physicalActivities.length, d.physical2 ? 2 : 1, `${p.weekNo}주 신체활동 개수`);
    assert.ok(p.artActivity, `${p.weekNo}주 미술`);
    // 활동 이름 · 단계는 PDF 원문에 있다
    for (const a of [...p.physicalActivities, p.artActivity]) {
      assert.ok(sq(sourceText(p.weekNo)).includes(sq(a.title)), `${a.id} 이름이 PDF 에 없다`);
      for (const s of a.steps) for (const part of s.text.split(" — ")) assert.ok(sq(sourceText(p.weekNo)).includes(sq(part)) || part.split(/\s+/).every((w) => w.length < 2 || sq(sourceText(p.weekNo)).includes(sq(w))), `${a.id} 단계 ${part}`);
    }
    assert.deepEqual(plans.filter((x) => x.physicalActivities.length === 2).map((x) => x.weekNo), [7, 9]);
  }
});

test("연결 검사 — 24주 50개 활동 모두 PDF 대표활동 → 플레이어 단계 → 자료 → 관찰 문항 → 성장지표 → 리포트 근거가 이어진다", () => {
  const all = plans.flatMap((p) => connectionCheck(p).map((r) => ({ ...r, weekNo: p.weekNo })));
  assert.equal(all.length, 50);
  const broken = all.filter((r) => !r.complete).map((r) => `${r.activityId} ${JSON.stringify(r.links)}`);
  assert.deepEqual(broken, []);
});

test("자료 자리 — PDF 의 그림 자리 ID 489개를 그대로 쓰고, 실제 파일은 1~8주 표지만 「있음」", () => {
  const total = Object.values(MEDIA_SLOT_IDS).reduce((a, x) => a + x.length, 0);
  assert.equal(total, 489);
  for (let n = 1; n <= 24; n++) {
    for (const id of MEDIA_SLOT_IDS[n]) assert.ok(sourceText(n).includes(id), `${id} 가 PDF 에 없다`);
    const assets = weekAssets(n);
    for (const a of assets) {
      assert.equal(a.state === "ready", a.kind === "storybookCover" && n <= 8, `${a.id} 상태`);
      if (a.state !== "ready") assert.ok(a.fallback && a.fallback.origin === "proposal", `${a.id} 대체 운영`);
    }
  }
});

test("교실 화면 「이야기 열기」 — 24주 모두 같은 추상 문장이 아니라 그 주차 주제 문장이고 오늘 할 것을 보인다", () => {
  const lines = EXPERIENCE_WEEKS.map((w) => w.stages[0].childLine);
  assert.equal(new Set(lines).size, 24);
  assert.ok(!lines.includes("오늘은 무엇을 만날까요?"));
  for (const w of EXPERIENCE_WEEKS) {
    assert.equal(w.stages[0].childLine, OPEN_CHILD_LINES[w.weekNo]);
    assert.ok([...OPEN_CHILD_LINES[w.weekNo]].length <= 18, `${w.weekNo}주 큰 글씨 길이`);
  }
  for (const p of plans) {
    const chips = p.lessonStages[0].classroom.chips;
    assert.ok(chips.some((c) => c.includes(p.storybook.title)) && chips.some((c) => c.startsWith("몸놀이")) && chips.some((c) => c.startsWith("만들기")), `${p.weekNo}주 오늘 할 것`);
  }
});

test("순서 주의 — 신체활동이 뒤 단계 결과물을 먼저 쓰는 4 · 11 · 22 · 24주에 원문 문장과 운영 제안이 있다", () => {
  assert.deepEqual(SEQUENCE_NOTES.map((x) => x.weekNo), [4, 11, 22, 24]);
  for (const s of SEQUENCE_NOTES) {
    // PDF 추출본은 단(column)대로 뽑혀 한 문장이 여러 줄에 흩어진 곳이 있다 — 낱말이 모두 원문에 있어야 한다
    const src = sq(sourceText(s.weekNo));
    for (const part of s.conflict.text.split(" · ")) for (const piece of part.split(" — ")) {
      assert.ok(src.includes(sq(piece)) || piece.split(/\s+/).filter((w) => sq(w).length >= 2).every((w) => src.includes(sq(w))), `${s.weekNo}주 원문 ${piece}`);
    }
    assert.equal(s.resolution.origin, "proposal");
  }
  // 4 · 11 · 22 · 24 말고는 신체 단계가 「만든 · 꾸민 …」을 먼저 쓰지 않는다
  for (const d of WEEK_DASHBOARDS) {
    const uses = d.physicalSteps.some((s) => /내가 만든|직접 만든|각자 꾸민/.test(s.guide));
    assert.equal(uses, [4, 11, 22, 24].includes(d.weekNo), `${d.weekNo}주`);
  }
});

test("관찰 문항 → 5대 지표 — 많아야 둘, 듣기는 자기 설명이 아니고, 맞지 않으면 연결하지 않는다", () => {
  assert.deepEqual(indicatorsFor("친구의 이야기를 끝까지 듣는가?"), ["engagement_immersion"]);
  assert.ok(!indicatorsFor("곤충의 움직임을 몸으로 표현하는가?").includes("self_explanation"));
  assert.ok(!indicatorsFor("도움이 필요할 때 큰 소리로 어른을 부르는가?").includes("expression_variety"));
  assert.ok(!indicatorsFor("내 자리와 사물함을 스스로 찾아가는가?").includes("form_space_composition"));
  assert.deepEqual(indicatorsFor("안전한 행동과 위험한 행동을 구별하는가?"), []);
  for (const p of plans) {
    for (const l of p.growthIndicatorMappings) { assert.ok(l.indicators.length <= 2); assert.equal(l.origin, "proposal"); }
    assert.ok(p.growthIndicatorMappings.some((l) => l.indicators.length), `${p.weekNo}주 연결된 지표 없음`);
  }
});

const run = (s) => G.analyze({ childLabel: s.childLabel, weekNo: s.weekNo, observations: s.observations, evidence: s.evidence, indicatorName: (c) => NAME[c], indicatorDefinition: (c) => DEF[c] });
const scen = (k) => DEMO_SCENARIOS.find((s) => s.key === k);

test("가상 성장 분석 — 장면 8개가 규칙대로 나온다", () => {
  const enough = run(scen("enough"));
  assert.equal(enough.statements.length, 2);
  assert.ok(enough.statements.every((s) => s.origin === "ai" && s.observationIds.length === 1 && s.flags.length === 0));
  assert.deepEqual(enough.statements[0].evidenceIds, ["ev-4-1"]);
  assert.ok(enough.parentExperience);

  const none = run(scen("none"));
  assert.equal(none.statements.length, 0);
  assert.equal(none.parentExperience, null);

  const photo = run(scen("photoOnly"));
  assert.equal(photo.statements.length, 0);
  assert.match(photo.warnings.join(), /사진 · 작품 자료만 있고 교사 관찰 기록이 없어/);

  const conflict = run(scen("conflict"));
  assert.equal(conflict.statements.length, 1);
  assert.match(conflict.statements[0].flags.join(), /사실을 확인/);
  assert.equal(conflict.parentExperience, null, "확인 안 된 문장은 보호자 설명에 쓰지 않는다");

  const miss = run(scen("missingIndicator"));
  assert.deepEqual(miss.statements.map((s) => s.indicator), ["creative_attempt"]);
  assert.equal(miss.noRecord.length, 4);

  const two = run(scen("twoActivities"));
  assert.equal(two.statements.length, 2);
  assert.match(two.warnings.join(), /대표활동 2개/);
  assert.ok(two.statements[0].text.includes("나비놀이") && two.statements[1].text.includes("벌놀이"));

  const integ = run(scen("integration"));
  assert.match(integ.statements[1].text, /5주차 결과물/);

  const pii = run(scen("pii"));
  assert.ok(pii.blocked.length >= 2);
  assert.equal(pii.statements.length, 0);
});

test("시연 장면의 활동 ID · 관찰 문항 · 지표는 실행형 데이터와 같다 (지어낸 활동이 없다)", () => {
  for (const s of DEMO_SCENARIOS) {
    for (const o of s.observations) {
      const p = plans.find((x) => x.weekNo === o.weekNo);
      const act = [...p.physicalActivities, p.artActivity].find((a) => a.id === o.activityId);
      assert.ok(act, `${o.id} 활동 ${o.activityId}`);
      assert.equal(act.title, o.activityTitle, `${o.id} 활동 이름`);
      const link = p.growthIndicatorMappings.find((l) => l.item === o.item);
      assert.ok(link, `${o.id} 관찰 문항이 ${o.weekNo}주 문항에 없다: ${o.item}`);
      if (o.indicator) assert.ok(link.indicators.includes(o.indicator), `${o.id} 지표 ${o.indicator} ∉ ${link.indicators}`);
      for (const e of o.evidenceIds) assert.ok(s.evidence.some((x) => x.id === e), `${o.id} 근거 ${e}`);
    }
    assert.ok(G.VIRTUAL_CHILDREN.includes(s.childLabel));
  }
});

test("개인정보 차단 — 전화 · 이메일 · 주민번호 · 생년월일 · 주소 · 실명은 막고, 가상 원아 이름은 통과", () => {
  assert.deepEqual(G.detectPII("하늘이가 씨앗을 골랐다."), []);
  assert.deepEqual(G.detectPII("친구가 먼저 흔드는 것을 보았다."), []);
  assert.deepEqual(G.detectPII("선생님이 스티커 붙이는 것을 함께 도와주는 장면"), []);
  for (const [t, r] of [["엄마 번호 010-2222-3333", "전화번호"], ["mail me a@b.com", "이메일"], ["901010-1234567", "주민등록번호"],
    ["2020년 3월 5일 생", "생년월일"], ["서울시 강남구 역삼동 12", "주소"], ["김민준이가 이름표를 만들었다", "실명으로 보이는 이름"], ["박서연 원아", "실명으로 보이는 이름"]]) {
    assert.ok(G.detectPII(t).includes(r), `${t} → ${r}`);
  }
  const blocked = G.analyze({ ...scen("enough"), childLabel: "김서연", indicatorName: (c) => NAME[c], indicatorDefinition: (c) => DEF[c] });
  assert.ok(blocked.blocked.length > 0, "가상 원아가 아닌 이름은 막는다");
});

test("쓰면 안 되는 표현 — 진단 · 비교 · 점수 · 성격 단정 · 감정 단정을 찾아낸다", () => {
  for (const t of ["ADHD 같아요", "또래보다 느려요", "오늘 8점", "원래 내성적인 아이", "속으로 슬퍼했다", "항상 잘해요"]) assert.ok(G.bannedReasons(t).length, t);
  assert.deepEqual(G.bannedReasons("친구를 본 뒤 리듬에 맞춰 흔들었다."), []);
  // AI 초안 문장 자체에도 금지 표현이 없다
  for (const s of DEMO_SCENARIOS) for (const st of run(s).statements) assert.deepEqual(G.bannedReasons(st.text), [], st.text);
});

test("검토 · 승인 흐름 — AI 초안 → 교사 수정 → 검토 완료 → 승인, 체험에서는 공유하지 않는다", () => {
  let doc = { state: "ai_draft", statements: run(scen("conflict")).statements, demo: true };
  assert.ok(G.nextStateBlockers(doc, "approved").length, "순서를 건너뛸 수 없다");
  assert.match(G.nextStateBlockers(doc, "reviewed").join(), /사실 확인/);
  doc = G.editStatement(doc, "st-1", "튜브 무늬는 스스로 그렸고, 스티커는 선생님과 함께 붙였다.");
  assert.equal(doc.state, "teacher_edited");
  assert.equal(doc.statements[0].origin, "teacher");
  doc = G.moveTo(doc, "reviewed");
  assert.equal(doc.state, "reviewed");
  doc = G.moveTo(doc, "approved");
  assert.equal(doc.state, "approved");
  assert.match(G.nextStateBlockers(doc, "shared").join(), /보내지 않습니다/);
  assert.equal(G.moveTo(doc, "shared").state, "approved");
  // 고친 문장에 금지 표현이 있으면 다시 막힌다
  const bad = G.editStatement(doc, "st-1", "또래보다 잘했다");
  assert.ok(bad.statements[0].flags.length);
  // AI 문장이 남아 있으면 승인할 수 없다
  let ai = { state: "reviewed", statements: run(scen("enough")).statements, demo: true };
  assert.match(G.nextStateBlockers(ai, "approved").join(), /확인하지 않은 AI 문장/);
  ai = G.confirmStatement(G.confirmStatement(ai, "st-1"), "st-2");
  assert.deepEqual(G.nextStateBlockers(ai, "approved"), []);
});

test("미리 준비 · 사전 제작 — 4 · 11 · 22 · 24주 견본 · 조각, 16주 사진 인화, 17주 세계지도 설치, 18~23주 깃발은 원문 조각 + 운영 제안", async () => {
  const { PREP_NOTES, hasFilming, FILMING_NOTE } = await import("../src/data/experience/lesson-engine/prep-notes.ts");
  assert.deepEqual(PREP_NOTES.filter((p) => p.when === "before").map((p) => p.weekNo).sort((a, b) => a - b), [4, 11, 16, 17, 22, 24]);
  assert.deepEqual(PREP_NOTES.filter((p) => p.when === "during").map((p) => p.weekNo), [18, 19, 20, 21, 22, 23]);
  for (const p of PREP_NOTES) {
    assert.equal(p.text.origin, "source");
    assert.equal(p.action.origin, "proposal");
    const src = sq(sourceText(p.weekNo));
    assert.ok(src.includes(sq(p.text.text)) || p.text.text.split(/\s+/).filter((w) => sq(w).length >= 2).every((w) => src.includes(sq(w))), `${p.weekNo}주 원문 ${p.text.text}`);
  }
  // 19주는 원문 그대로 아프리카 · 스페인 (캐스터네츠) — 21주 스페인과 겹쳐도 원문을 고치지 않는다
  assert.match(PREP_NOTES.find((p) => p.weekNo === 19).text.text, /아프리카 · 스페인/);
  assert.ok(hasFilming(16), "16주 영상편지");
  assert.equal(FILMING_NOTE.origin, "proposal");
});

test("수업 시간 — 운영 기준 45분(자료 CORE 45와 같음) · 30분 단축(교사용 편집안)을 섞지 않는다", async () => {
  const { LESSON_TIME, SHORT_TIME, SHORT_STAGE_MINUTES, PDF_DURATION_LABEL } = await import("../src/lib/weeks/lesson-time.ts");
  assert.equal(LESSON_TIME.totalMinutes, 45);
  assert.equal(SHORT_TIME.totalMinutes, 30);
  assert.equal(Object.keys(SHORT_STAGE_MINUTES).join(), "open,story,move,make,share");
  assert.match(PDF_DURATION_LABEL, /CORE 45분.*SHORT CLASS 30분/);
  const print = readFileSync(join(ROOT, "src/app/experience/weeks/[weekNo]/print/page.tsx"), "utf8");
  const dash = readFileSync(join(ROOT, "src/components/play/TeacherDashboard.tsx"), "utf8");
  for (const f of [print, dash]) assert.match(f, /SHORT_TIME\.label[\s\S]{0,200}origin="proposal"/, "30분 단축은 교사용 제안으로 표시");
});

test("교사 화면 단계 추가 정보 — 오늘의 목표 · PDF 활동 소개 · 정리 · 가정연계 · 촬영 주의", async () => {
  const { buildStageExtras } = await import("../src/data/experience/lesson-engine/stage-extras-build.ts");
  for (const w of EXPERIENCE_WEEKS) {
    const x = buildStageExtras(w);
    for (const k of ["open", "story", "move", "make", "share"]) assert.ok(x[k]?.goal?.text, `${w.weekNo}주 ${k} 목표`);
    assert.ok(x.move.leads.length >= 1 && x.move.leads.every((l) => l.lead.origin === "source"), `${w.weekNo}주 신체활동 소개`);
    assert.equal(x.move.leads.length, WEEK_DASHBOARDS.find((d) => d.weekNo === w.weekNo).physical2 ? 2 : 1, `${w.weekNo}주 신체활동 소개 개수`);
    assert.deepEqual(x.share.wrapUp.map((u) => u.label).slice(0, 2), ["정리", "가정연계"], `${w.weekNo}주 정리 · 가정연계`);
    // PDF 추출본이 단(column)대로 흩어진 주차가 있다 — 문장이 그대로 없으면 낱말이 모두 있어야 한다
    const src = sq(sourceText(w.weekNo));
    for (const u of ["move", "make", "share"].flatMap((k) => x[k].wrapUp)) if (u.item.origin === "source") assert.ok(src.includes(sq(u.item.text)) || u.item.text.split(/\s+/).filter((v) => sq(v).length >= 2).every((v) => src.includes(sq(v))), `${w.weekNo}주 ${u.label} 원문`);
  }
  assert.equal(buildStageExtras(EXPERIENCE_WEEKS[15]).move.extraCautions.length, 1, "16주 촬영 주의");
});

const inSource = (src, text) => src.includes(sq(text)) || text.split(/\s+/).filter((v) => sq(v).length >= 2).every((v) => src.includes(sq(v)));

test("PDF 추가 칸 — 미술 활용 · 예시 · TIP, 교구 안내 · 미션 · 활용, 가족연계 안내 · TIP, 가정용 교구 안내, 뮤직비디오 — 모두 원문", async () => {
  const { WEEK_PDF_EXTRA } = await import("../src/data/experience/teacher-dashboard/week-pdf-extra.ts");
  assert.equal(WEEK_PDF_EXTRA.length, 24);
  let n = 0;
  for (const w of WEEK_PDF_EXTRA) {
    const src = sq(sourceText(w.weekNo));
    for (const [k, v] of Object.entries(w)) {
      if (k === "weekNo") continue;
      for (const s of Array.isArray(v) ? v : v ? [v] : []) {
        assert.ok(inSource(src, s), `${w.weekNo}주 ${k} 원문: ${s}`);
        assert.doesNotMatch(s, /w\d+\.|physical\[|nuri\[|px|썸네일/,`${w.weekNo}주 ${k} 기계 표기 섞임`);
        n++;
      }
    }
    assert.ok(w.videoDesc, `${w.weekNo}주 뮤직비디오 설명`);
    assert.equal(w.videoUrl, null, "PDF 에 실제 영상 주소가 없다 — 주소처럼 보이게 하지 않는다");
  }
  assert.ok(n > 250, `추가 칸 ${n}개`);
  // 다른 영역 이름이 이어 붙지 않는다
  for (const w of WEEK_PDF_EXTRA) for (const s of [w.topicElements, w.makesKit, w.kitUse, w.familyNote, w.artTip]) if (s) assert.doesNotMatch(s, /교사가 기억할 핵심|키즈보드 메뉴|데이터 출처/, `${w.weekNo}주 ${s}`);
});

test("상세 수업 지도안 (인쇄) — 12개 영역을 모두 싣고 검색에서 뺀다 · 플레이어는 PDF 단계를 하나씩 넘긴다", () => {
  const guide = readFileSync(join(ROOT, "src/app/experience/weeks/[weekNo]/guide/page.tsx"), "utf8");
  for (const [i, title] of ["주차 기본 정보", "동화책", "대표 신체활동", "미술활동", "워크북", "교구 · 놀이자료 키트", "가족연계 활동", "가정용 교구 · 교사 지원자료", "누리과정 연계", "동화책 음원 · 캐릭터 뮤직비디오", "교사 운영 · 관찰 · 성장 기록", "주차 연계 산출물"].entries())
    assert.ok(guide.includes(`no={${i + 1}} title="${title}"`), `영역 ${i + 1} ${title}`);
  assert.ok(guide.includes("robots: { index: false"));
  for (const k of ["artUse", "artExamples", "artTip", "kitMissions", "kitUse", "familyNote", "familyTip", "homeKitNote", "videoDesc"]) assert.ok(guide.includes(`x?.${k}`), `지도안 ${k}`);
  const player = readFileSync(join(ROOT, "src/components/play/classroom/ClassroomPlayer.tsx"), "utf8");
  assert.ok(player.includes(`SUB_STEP_STAGES: readonly StageKey[] = ["move", "make"]`));
  assert.ok(player.includes(`aria-current={activeStep === i ? "step"`));
  assert.ok(player.includes("다음 활동 ▶"));
});

test("사진 자리 ID — 신체활동 단계 · 미술 예시 · 워크북 장 수와 PDF 그림 자리가 맞는다", () => {
  for (const d of WEEK_DASHBOARDS) {
    const ids = MEDIA_SLOT_IDS[d.weekNo];
    const count = (re) => ids.filter((x) => re.test(x)).length;
    assert.equal(count(/\.physical0\.step\./), d.physicalSteps.length, `${d.weekNo}주 신체 단계 사진 자리`);
    if (d.physical2) assert.equal(count(/\.physical1\.step\./), d.physical2.steps.length, `${d.weekNo}주 두 번째 활동 사진 자리`);
    assert.equal(count(/\.workbook\.worksheet\./), d.workbookSheets.length, `${d.weekNo}주 워크북 자리`);
  }
});

test("키즈보드 — 1~4주 세트 A · 5~8주 세트 B (자료 원문), 9~24주는 미정으로 두고 공유 · 사진은 기관용으로만", async () => {
  const { kidsboardSetFor, kidsboardRows, KIDSBOARD_SETS } = await import("../src/data/experience/kidsboard.ts");
  for (const w of EXPERIENCE_WEEKS) {
    const n = w.weekNo;
    assert.equal(kidsboardSetFor(n), n <= 4 ? "A" : n <= 8 ? "B" : null, `${n}주 세트`);
    if (n <= 8) assert.ok(sq(sourceText(n)).includes(sq(`키즈보드 메뉴 ${n <= 4 ? "1~4" : "5~8"}주차 구성 (세트 ${n <= 4 ? "A" : "B"})`)), `${n}주 PDF 세트 표기`);
    const rows = kidsboardRows(n);
    assert.equal(rows.length, KIDSBOARD_SETS.A.items.length + KIDSBOARD_SETS.B.items.length);
    for (const name of ["활동사진", "활동 영상", "활동 사진 공유"]) assert.equal(rows.find((r) => r.name === name).state, "saas", `${n}주 ${name} 는 공개 체험에서 하지 않는다`);
    assert.equal(rows.find((r) => r.name === "성장데이터").href, `/experience/growth-demo?week=${n}`);
  }
});

test("성장 분석 체험 — 주차를 고르면 그 주차 활동 · 관찰 문항으로만 시작한다 (다른 주차 기록 없음)", async () => {
  const { weekStarter } = await import("../src/lib/growth/week-starter.ts");
  for (const p of plans) {
    const acts = [...p.physicalActivities, ...(p.artActivity ? [p.artActivity] : [])];
    const w = { weekNo: p.weekNo, title: p.weekTitle, storybook: p.storybook.title, familyTitle: null, parentNotice: [], kidsnote: null, itemsOrigin: "source",
      activities: acts.map((a) => ({ id: a.id, title: a.title, kind: a.kind, stage: a.stage, items: a.observations.map((o) => ({ item: o.item, indicators: o.indicators })) })),
      items: p.growthIndicatorMappings.map((l) => ({ item: l.item, indicators: l.indicators })) };
    const s = weekStarter(w);
    assert.ok(s.observations.length >= 1, `${p.weekNo}주 기록`);
    for (const o of s.observations) {
      assert.equal(o.weekNo, p.weekNo);
      assert.ok(acts.some((a) => a.id === o.activityId), `${p.weekNo}주 활동 ${o.activityId}`);
      assert.ok(w.items.some((x) => x.item === o.item), `${p.weekNo}주 문항 ${o.item}`);
    }
  }
});
