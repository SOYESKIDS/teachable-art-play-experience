/**
 * 공개 체험(/experience) 콘텐츠 검사.
 *
 * ★ 24주 전부 존재 · PART 별 8주 · 번호 중복 없음 · 빈 필드 없음
 * ★ 공식 값(week-index.ts)을 체험 데이터가 바꾸지 않았는가
 * ★ 체험용 본문은 official 로 표시되지 않는가 (임시 내용을 확정 교안처럼 보이지 않게)
 * ★ 누리과정 5개 영역 공식 명칭 · SOYE KIDS 핵심경험 승인 목록만 쓰는가 (섞이지 않는가)
 * ★ 교사 검토(2026-10-15)에서 지적된 표현이 체험 문장에 들어가지 않았는가
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { EXPERIENCE_WEEKS, EXPERIENCE_PARTS, parseDurationMinutes, STAGE_ORDER } from "../src/data/experience/weeks.ts";
import { officialPlan } from "../src/data/experience/official-plan.ts";
import { LESSON_STAGE_MINUTES, LESSON_STAGE_MINUTES_STATUS, LESSON_TIME } from "../src/lib/weeks/lesson-time.ts";
import { WEEK_DASHBOARDS, gatherForWeek } from "../src/data/experience/teacher-dashboard/week-dashboards.ts";
import { WEEK_PROPOSALS } from "../src/data/experience/teacher-dashboard/proposals.ts";
import { PARTS } from "../src/lib/weeks/week-types.ts";
import { DEMO_LESSONS } from "../src/data/experience/demo-lessons.ts";
import { DEMO_REPORT } from "../src/data/experience/report.ts";
import { CHARACTERS_ENABLED, characterImage, characterGroupImage } from "../src/data/experience/characters.ts";
import { LICENSE_STATUS, MEDIA, WEEK_COVER_REGISTRY, WEEK_MEDIA } from "../src/data/experience/media.ts";
import { APPROVED_WEEK_TITLES, WEEK_INDEX } from "../src/lib/weeks/week-index.ts";
import { NURI_AREA_LABEL, APPROVED_SOYE_CORE_EXPERIENCES, GROWTH_METRIC_LABEL } from "../src/lib/curriculum/taxonomies.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
/** 자료 PDF 의 PART 이름 원문 (화면 이름은 2026-10-29 승인값 — src/lib/weeks/week-types.ts PARTS) */
const PDF_PART_NAME = { 1: "씨앗과 숲", 2: "우리 그리고 모두의 사계절", 3: "두근두근 세계여행" };
const NURI = new Set(Object.values(NURI_AREA_LABEL));
const SOYE = new Set(APPROVED_SOYE_CORE_EXPERIENCES);

test("24주가 모두 있고 번호가 1~24 로 한 번씩만 나온다", () => {
  assert.equal(EXPERIENCE_WEEKS.length, 24);
  assert.deepEqual(EXPERIENCE_WEEKS.map((w) => w.weekNo), Array.from({ length: 24 }, (_, i) => i + 1));
  assert.equal(new Set(DEMO_LESSONS.map((l) => l.weekNo)).size, 24);
});

test("PART 마다 정확히 8주", () => {
  assert.equal(EXPERIENCE_PARTS.length, 3);
  for (const p of EXPERIENCE_PARTS) {
    const weeks = EXPERIENCE_WEEKS.filter((w) => w.partNo === p.partNo);
    assert.equal(weeks.length, 8, `PART ${p.partNo}`);
    assert.ok(weeks.every((w) => w.weekNo >= p.weekFrom && w.weekNo <= p.weekTo));
  }
});

test("공식 지도 값을 체험 데이터가 바꾸지 않는다", () => {
  for (const w of EXPERIENCE_WEEKS) {
    const o = WEEK_INDEX.find((x) => x.weekNo === w.weekNo);
    for (const k of ["title", "storybook", "growthKeyword", "coreMessage", "activitySummary", "themeColor"]) {
      assert.equal(w[k], o[k], `${w.weekNo}주 ${k}`);
    }
    assert.equal(w.outcome, o.outcome && o.outcome.trim() ? o.outcome : null, `${w.weekNo}주 outcome`);
  }
});

test("체험용 본문은 official 로 표시되지 않는다 (adapted · demo_draft 만)", () => {
  for (const l of DEMO_LESSONS) assert.ok(["adapted", "demo_draft"].includes(l.status), `${l.weekNo}주 ${l.status}`);
  assert.equal(DEMO_LESSONS.find((l) => l.weekNo === 4).status, "adapted");
});

test("빈 제목 · 목표 · 준비물 · 발문 · 관찰 · 안전 · 가정연계가 없다", () => {
  for (const w of EXPERIENCE_WEEKS) {
    const b = w.body;
    const at = `${w.weekNo}주`;
    assert.ok(w.title.trim(), `${at} title`);
    assert.ok(w.growthKeyword.trim(), `${at} keyword`);
    for (const k of ["goal", "story", "movement", "music", "explore", "art", "homeConnection", "closingQuestion"]) assert.ok(b[k]?.trim(), `${at} ${k}`);
    assert.ok(b.materials.length >= 3, `${at} materials`);
    assert.ok(b.teacherQuestions.length >= 3, `${at} questions`);
    assert.ok(b.observationPoints.length >= 3, `${at} observation`);
    assert.ok(b.safety.length >= 1, `${at} safety`);
    assert.ok(b.coreExperiences.length >= 2, `${at} core experiences`);
    for (const k of STAGE_ORDER) {
      if (k === "open") continue; // 열기 단계의 큰 글씨는 데이터가 아니라 고정 문장이다
      assert.ok(b.childLines[k]?.trim(), `${at} childLine ${k}`);
    }
  }
});

test("누리과정은 공식 5개 영역 명칭만, SOYE KIDS 핵심경험은 승인 목록만 — 서로 섞이지 않는다", () => {
  for (const l of DEMO_LESSONS) {
    assert.ok(l.nuriAreas.length >= 1, `${l.weekNo}주 nuri`);
    for (const a of l.nuriAreas) assert.ok(NURI.has(a), `${l.weekNo}주 누리 영역 아님: ${a}`);
    for (const s of l.soyeCoreExperiences) {
      assert.ok(SOYE.has(s), `${l.weekNo}주 승인되지 않은 핵심경험: ${s}`);
      assert.ok(!NURI.has(s), `${l.weekNo}주 핵심경험이 누리 영역 이름과 같다: ${s}`);
    }
    assert.equal(new Set(l.nuriAreas).size, l.nuriAreas.length, `${l.weekNo}주 중복`);
  }
});

test("24주 모두 기본 수업 45분 (2026-10-29) — 시간은 한 곳(lesson-time.ts)에서만 오고, 단계별 분은 임시 내부 값이다", () => {
  assert.equal(LESSON_TIME.totalMinutes, 45);
  assert.equal(LESSON_TIME.label, "기본 수업 45분");
  // 단계별 분은 확정 값이 아니다 — 임시 · 대표 승인 전으로 기록되어 있어야 한다
  assert.match(LESSON_STAGE_MINUTES_STATUS, /임시.*대표 승인 전/);
  assert.equal(Object.values(LESSON_STAGE_MINUTES).reduce((a, b) => a + b, 0), 45);
  for (const w of EXPERIENCE_WEEKS) {
    assert.deepEqual(w.stages.map((s) => s.key), STAGE_ORDER);
    // 단계 합이 화면이 말하는 시간과 정확히 같아야 한다. 어긋나면 교사가 수업 중에 시간을 잘못 잡는다.
    assert.deepEqual(Object.fromEntries(w.stages.map((s) => [s.key, s.minutes])), LESSON_STAGE_MINUTES, `${w.weekNo}주 단계별 분`);
    const sum = w.stages.reduce((n, s) => n + s.minutes, 0);
    assert.equal(sum, 45, `${w.weekNo}주 단계 합`);
    assert.equal(w.totalMinutes, 45, `${w.weekNo}주 totalMinutes`);
    assert.equal(w.duration.coreMinutes, 45, `${w.weekNo}주 기본 수업 시간`);
    // 원본 표기는 지우지 않고 출처 기록으로 들고 있어야 한다
    assert.match(w.duration.pdfDurationLabel, /CORE 45분/, `${w.weekNo}주 자료 시간 표기 보존`);
    const plan = officialPlan(w.weekNo);
    assert.equal(w.duration.legacyGuideDurationLabel, plan.matchesCurrentLesson ? plan.durationLabel : null, `${w.weekNo}주 이전 가이드 시간`);
    assert.ok(plan.durationLabel.trim(), `${w.weekNo}주 이전 가이드 시간 원문 보존`);
    assert.ok(w.stages.every((s) => s.minutes >= 3 && s.childLine && s.guide && s.teacherQuestion));
  }
  assert.equal(parseDurationMinutes("약 55~65분"), 60);
});

test("화면 소스에 수업 시간 숫자를 직접 적지 않는다 (35분 · 55~65분 · 60분 등)", () => {
  // 시간 문구는 LESSON_TIME 에서 읽는다. 출처 기록(official-plan · week-dashboards · lesson-time)은 예외다.
  const dirs = ["src/app", "src/components"];
  const offenders = [];
  for (const d of dirs) {
    for (const f of readdirSync(join(ROOT, d), { recursive: true })) {
      if (!/\.(ts|tsx)$/.test(f)) continue;
      const s = readFileSync(join(ROOT, d, f), "utf8");
      for (const m of s.matchAll(/(?:약\s*)?\d{2}\s*(?:~\s*\d{2}\s*)?분(?![가-힣])/g)) offenders.push(`${d}/${f}: ${m[0]}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test("2026-10-29 수정 — 단계별 분 · 「개편 후보」 · 이전 PART 이름이 화면 소스에 없고, PART · 연락처 · 도메인이 승인값이다", () => {
  const offenders = [];
  for (const d of ["src/app", "src/components"]) {
    for (const f of readdirSync(join(ROOT, d), { recursive: true })) {
      if (!/\.(ts|tsx)$/.test(f)) continue;
      const s = readFileSync(join(ROOT, d, f), "utf8");
      // 단계별 분 숫자를 그리는 자리 (s.minutes · stage.minutes · estimatedMinutes · breakdown)
      for (const m of s.matchAll(/\.minutes\s*\}\s*분|estimatedMinutes\}?분|\.breakdown\b|약 \$\{x\.estimatedMinutes\}|PART_NAME_CANDIDATE_LABEL|개편 후보|씨앗과 숲|우리 그리고 모두의 사계절/g)) offenders.push(`${d}/${f}: ${m[0]}`);
    }
  }
  assert.deepEqual(offenders, []);
  assert.deepEqual(PARTS.map((p) => [p.title, p.nameProvisional]), [["씨앗에서 숲까지", false], ["우리 모두의 사계절", false], ["두근두근 세계여행", false]]);
  const site = readFileSync(join(ROOT, "src/data/site.ts"), "utf8");
  assert.match(site, /SITE_URL = "https:\/\/teachableartplay-class\.soyes\.kr"/);
  assert.match(site, /phoneHref: "tel:01048140998"/);
  assert.match(site, /백향은 대표/);
  assert.match(site, /https:\/\/teachableartplay-pr\.soyes\.kr\//);
});

test("교사 검토에서 지적된 표현이 체험 문장에 없다", () => {
  const text = JSON.stringify(DEMO_LESSONS) + JSON.stringify(DEMO_REPORT) + JSON.stringify(WEEK_PROPOSALS);
  for (const bad of ["몰래", "촬영하는 것처럼", "키즈노트", "엄마"]) assert.ok(!text.includes(bad), bad);
  // 대시보드 자료 문장도 공개 화면에 실린다 — 보호자 몰래 촬영 · 성별을 고정한 가족 표현을 쓰지 않는다
  const dash = JSON.stringify(WEEK_DASHBOARDS);
  for (const bad of ["몰래", "촬영하는 것처럼", "엄마", "아빠"]) assert.ok(!dash.includes(bad), `대시보드 ${bad}`);
});

const norm = (s) => (s ?? "").normalize("NFC").replace(/[\s·!?,.《》()&~'"‘’“”]/g, "");
const GENERIC = new Set(["만들기", "꾸미기", "나만의", "우리", "우리의", "친구들과", "함께"]);
const tokens = (s) => (s ?? "").split(/[\s·!?,.()/&→《》~]+/).map((x) => x.trim()).filter((x) => x.length >= 2 && !GENERIC.has(x));

test("1~24주 — 목록 · 상세 · 교실 플레이어 · 교사 대시보드가 같은 수업을 가리킨다 (자료 PDF 기준)", () => {
  assert.equal(WEEK_DASHBOARDS.length, 24);
  for (const w of EXPERIENCE_WEEKS) {
    const d = WEEK_DASHBOARDS.find((x) => x.weekNo === w.weekNo);
    const at = `${w.weekNo}주`;
    assert.ok(d, `${at} 대시보드 없음`);
    // 수업 내용의 출처 제목(sourceTitle)은 그 주차 자료의 제목이다 — 14 · 17~24주는 공식 교사용 수업가이드,
    // 나머지는 자료 PDF. 2026-10-29 승인 제목은 가이드 제목과 같은 수업이라 「업데이트 교안 확인 필요」가 없다.
    assert.equal(norm(w.sourceTitle), norm(d.pdfTitle), `${at} 자료 제목: 사이트 「${w.sourceTitle}」 · 자료 「${d.pdfTitle}」`);
    if (APPROVED_WEEK_TITLES[w.weekNo]) {
      assert.equal(w.title, APPROVED_WEEK_TITLES[w.weekNo], `${at} 승인 제목`);
      assert.equal(d.sourceKind, "officialGuide", `${at} 공식 가이드 기준 수업`);
      // 승인 제목과 가이드 제목은 띄어쓰기 · 문장부호만 다를 수 있다
      assert.equal(norm(w.title).replace(/[.!]/g, ""), norm(d.pdfTitle).replace(/[.!]/g, ""), `${at} 승인 제목 = 가이드 제목`);
      assert.equal(w.lessonUpdatePending, false, `${at} 교안이 제목과 맞다`);
    } else {
      assert.equal(norm(w.title), norm(d.pdfTitle), `${at} 주차 제목: 사이트 「${w.title}」 · 자료 「${d.pdfTitle}」`);
      assert.equal(w.lessonUpdatePending, false, `${at} 제목이 그대로인 주차`);
    }
    assert.equal(norm(w.storybook), norm(d.storybookTitle), `${at} 그림책: 사이트 《${w.storybook}》 · 자료 《${d.storybookTitle}》`);
    assert.equal(w.growthKeyword, d.keyword, `${at} 성장 키워드`);
    // 그림책 활동 · 준비물이 같은 그림책을 쓴다 (교실 플레이어와 대시보드가 같은 책)
    assert.ok(w.body.story.includes(`《${w.storybook}》`), `${at} 그림책 활동이 다른 책을 가리킨다`);
    assert.ok(w.body.materials[0].includes(`《${w.storybook}》`), `${at} 준비물 그림책`);
    // 대표 활동 · 미술이 자료의 활동과 같은 활동이다
    const site = `${w.activitySummary} ${w.body.movement} ${w.outcome ?? ""} ${w.body.art}`;
    assert.ok(tokens(d.physicalTitle).some((t) => site.includes(t)), `${at} 대표 활동: 자료 「${d.physicalTitle}」 · 사이트 「${w.activitySummary}」`);
    if (d.artTitle) {
      const tk = tokens(d.artTitle);
      // 일반어만 남는 제목(「나만의 꽃 만들기」)은 「만들기」를 뺀 제목 전체로 비교한다
      assert.ok(tk.length ? tk.some((t) => site.includes(t)) : site.includes(d.artTitle.replace(/\s*만들기$/, "")), `${at} 미술: 자료 「${d.artTitle}」`);
    }
    // 두 번째 대표활동(7 · 9주차)도 수업 본문에 있다
    if (d.physical2) assert.ok(tokens(d.physical2.title).some((t) => site.includes(t)) || site.includes("자리를 바꿔") || site.includes("꿀"), `${at} 두 번째 활동: 「${d.physical2.title}」`);
    // PART — 자료 PDF 원문은 PDF 이름 그대로 남고(출처 기록), 화면은 2026-10-29 승인 이름을 쓴다 (가이드에는 PART 칸이 없다)
    if (d.sourceKind !== "officialGuide") assert.ok(d.part.endsWith(PDF_PART_NAME[w.partNo]), `${at} PART 자료 원문: 「${d.part}」`);
  }
});

test("14 · 17~24주 — 공식 가이드 수업만 화면 데이터에 있고, 같은 주차 자료 PDF(다른 주제) 수업이 섞이지 않는다", () => {
  // ★ 2026-10-29: 승인 제목 = 공식 가이드 제목이라 그 주차 수업을 가이드 전사본 기준으로 맞췄다.
  //   그 주차의 자료 PDF 수업(물놀이 안전 · 색 섞기 · 젬베 · 명절 밥상 · 토마토 축제 · 호박 마을 · 산타의 긴 여행 · 어디 별에서 · 눈 결정)은
  //   보관만 하고 화면 데이터(주차 지도 · 수업 본문 · 대시보드 · PART 소개 · 리포트)에 들어오지 않는다.
  const PDF_TOPICS = { 14: ["하얀 도화지", "눈 결정", "하얀 눈밭"], 17: ["첨벙", "안전 튜브"], 18: ["색이 섞이", "색 카드"], 19: ["리듬탐험대", "젬베", "소리를 따라가면"], 20: ["복을 전해요", "명절"], 21: ["동글동글 토마토", "토마토 축제", "토마토 도장"], 22: ["호박 마을", "할로윈 파티를 열어요"], 23: ["산타는 어디서", "산타의 긴 여행"], 24: ["어디 별에서", "지구 조각"] };
  for (const [n, topics] of Object.entries(PDF_TOPICS)) {
    const w = EXPERIENCE_WEEKS.find((x) => x.weekNo === Number(n));
    const d = WEEK_DASHBOARDS.find((x) => x.weekNo === Number(n));
    const text = JSON.stringify([WEEK_INDEX.find((x) => x.weekNo === Number(n)), DEMO_LESSONS.find((x) => x.weekNo === Number(n)), d, w.stages, w.extensions]);
    for (const t of topics) assert.ok(!text.includes(t), `${n}주 화면 데이터에 자료 PDF(다른 주제) 「${t}」`);
    assert.equal(d.sourceKind, "officialGuide", `${n}주 공식 가이드`);
  }
  const shared = JSON.stringify(EXPERIENCE_PARTS) + JSON.stringify(DEMO_REPORT);
  for (const old of ["세계의 축제 (가칭)"]) assert.ok(!shared.includes(old), old);
  assert.equal(PARTS.find((p) => p.partNo === 3).title, "두근두근 세계여행");
});

test("교사 발문 · 교실 문장은 정답을 묻지 않는다 (보이는 변화를 말하게 한다)", () => {
  for (const l of DEMO_LESSONS) {
    const asked = JSON.stringify([l.teacherQuestions, l.closingQuestion, l.childLines]);
    assert.doesNotMatch(asked, /무슨 색이 될|무슨 색이 됐|만나면 무슨 색|무슨 색일까|무슨 색\?|정답은|정답을/, `${l.weekNo}주`);
  }
});

test("관찰 문항 · 활동 목표 · 음원 — 저장소의 자료 원문 텍스트와 대조한다 (원문 우선 · 「미작성」 칸만 제안)", () => {
  const DEV = join(ROOT, "docs/curriculum-upgrade/TAP_Curriculum_Development_Pack/TeachAble_24Week_Dashboard_DevPack/source_text");
  const EXTRA = join(ROOT, "docs/curriculum-upgrade/dashboard-source-21-24");
  const squash = (s) => s.normalize("NFC").replace(/[\s?.!,·ˮ”“"'‘’ʼ]/g, "");
  for (const d of WEEK_DASHBOARDS) {
    const guide = d.sourceKind === "officialGuide";
    // 14 · 17~24주는 공식 가이드 공개 요약이 원문이다 (PDF 의 「미작성」 · 곡 수 표기는 가이드 형식에 없다)
    const file = guide ? join(ROOT, "src/data/experience/teacher-dashboard/guide-summaries.ts") : d.weekNo <= 20 ? join(DEV, `week-${String(d.weekNo).padStart(2, "0")}.txt`) : join(EXTRA, `week-${d.weekNo}.txt`);
    const raw = readFileSync(file, "utf8");
    const src = squash(raw);
    const at = `${d.weekNo}주`;
    // 대시보드 문장은 원문에 그대로 있다
    for (const o of [...d.observations, ...d.goals]) assert.ok(src.includes(squash(o)), `${at} 원문에 없는 문장: ${o}`);
    for (const m of d.media) assert.ok(src.includes(squash(m.split(" — ")[0])), `${at} 원문에 없는 음원: ${m}`);
    if (guide) {
      assert.ok(d.observations.length > 0 && d.goals.length > 0, `${at} 가이드 관찰 · 목표`);
      continue;
    }
    // 자료가 「미작성」이라고 적지 않은 칸은 비어 있으면 안 된다 (추출 누락)
    const obsMissing = /관찰\s*문항\s*미작성/.test(raw), goalMissing = /활동\s*목표\s*미작성/.test(raw);
    assert.equal(d.observations.length === 0, obsMissing, `${at} 관찰: 원문 ${obsMissing ? "미작성" : "있음"} · 대시보드 ${d.observations.length}개`);
    assert.equal(d.goals.length === 0, goalMissing, `${at} 목표: 원문 ${goalMissing ? "미작성" : "있음"} · 대시보드 ${d.goals.length}개`);
    const p = WEEK_PROPOSALS.find((x) => x.weekNo === d.weekNo);
    assert.equal((p?.observations.length ?? 0) > 0, obsMissing, `${at} 관찰 제안은 「미작성」 칸에만`);
    assert.equal((p?.goals.length ?? 0) > 0, goalMissing, `${at} 목표 제안은 「미작성」 칸에만`);
    // 음원 곡 수가 자료와 같다
    const songs = raw.match(/동화책\s*음원\s*\(\s*(\d)\s*곡\s*\)/)?.[1];
    if (songs) assert.equal(d.media.length, Number(songs), `${at} 음원 곡 수`);
    // PDF 추출 찌꺼기가 없다
    assert.doesNotMatch(JSON.stringify(d), /\d+px|w\d+\.[a-z]+\.[a-z]+\.\d|kidsnoteExample|observation\[\]|goals\[\]|support\[|＋|미작성 —| (LS|MD|WK|PR|CW|FM|OB|RP) [가-힣]/, `${at} 추출 찌꺼기`);
  }
});

test("관찰 문항 · 활동 목표 — 자료가 비면 교사용 제안으로 채우고, 원문이 있으면 제안을 두지 않는다", () => {
  for (const d of WEEK_DASHBOARDS) {
    const p = WEEK_PROPOSALS.find((x) => x.weekNo === d.weekNo);
    const at = `${d.weekNo}주`;
    for (const key of ["observations", "goals"]) {
      const src = d[key];
      const prop = p?.[key] ?? [];
      if (src.length > 0) assert.equal(prop.length, 0, `${at} ${key}: 원문이 있는데 제안도 있다`);
      else assert.ok(prop.length >= 3, `${at} ${key}: 자료가 비었는데 제안이 없다`);
    }
  }
  // 제안은 행동 관찰이다 — 진단 · 평가 · 비교 표현을 쓰지 않는다
  const text = JSON.stringify(WEEK_PROPOSALS);
  assert.doesNotMatch(text, /진단|평가|점수|등급|순위|또래|부족|우수|뒤처|발달 지연|잘하는가|못하는가/);
  for (const p of WEEK_PROPOSALS) for (const o of p.observations) assert.match(o, /\?$/, `${p.weekNo}주 관찰은 「~하는가?」로 쓴다: ${o}`);
});

test("가상 리포트는 다섯 관점을 모두 쓰고 점수 · 순위 · 등급 · 진단 표현이 없다", () => {
  const metrics = new Set(DEMO_REPORT.moments.map((m) => m.metric));
  assert.deepEqual([...metrics].sort(), Object.keys(GROWTH_METRIC_LABEL).sort());
  const text = JSON.stringify(DEMO_REPORT);
  assert.ok(!/\d+\s*점|점수|순위|등급|진단|상위|하위\s*\d/.test(text));
  assert.match(DEMO_REPORT.childLabel, /가상/);
});

test("24주 모두 근거 자료 기반(adapted), 2주 핵심 교정 유지", () => {
  for (const l of DEMO_LESSONS) assert.equal(l.status, "adapted", `${l.weekNo}주`);
  const w2 = DEMO_LESSONS.find((l) => l.weekNo === 2);
  assert.match(w2.movement, /젓가락/);
  assert.doesNotMatch(JSON.stringify(w2), /콩주머니|선 따라 걷기/);
  // (자료 PDF 18주 「색 섞기」 발문 검사는 18주가 공식 가이드 「반짝이는 물길 놀이터」로 바뀌어 뺐다 —
  //  정답 색을 묻지 않는 규칙은 바로 위 「교사 발문 · 교실 문장은 정답을 묻지 않는다」가 24주 모두에 건다)
  // 성별을 고정한 가족 표현을 공개 체험에 쓰지 않는다
  for (const l of DEMO_LESSONS) assert.doesNotMatch(JSON.stringify(l), /아빠/, `${l.weekNo}주`);
});

test("성장 리포트 예시는 교정된 주차 활동과 맞는다 (지난 임시 활동 이름을 쓰지 않는다)", () => {
  const text = JSON.stringify(DEMO_REPORT);
  for (const old of ["콩주머니", "선 따라 걷기", "좁쌀"]) assert.ok(!text.includes(old), old);
  for (const m of DEMO_REPORT.moments) {
    // 긴 한 문장 대신 짧은 문장으로 — 모바일 카드에서 읽기 쉽게
    for (const sentence of m.observed.split(/(?<=[.요])\s/)) assert.ok(sentence.length <= 60, `${m.week}주 ${sentence.length}자: ${sentence}`);
  }
});

test("캐릭터 사진은 그대로 없고, 주차 표지는 사용권이 확인된 1~8주차만 쓴다", () => {
  assert.equal(CHARACTERS_ENABLED, false);
  const published = LICENSE_STATUS === "confirmed";
  for (const w of EXPERIENCE_WEEKS) {
    assert.equal(characterImage(w.body.character), null, `${w.weekNo}주 캐릭터`);
    if (w.weekNo <= 8) {
      // 1~8주차 등록부 — 그림 속 내용이 확인된 표지 (그림책 표지라 storybook 과 맞는다)
      const cover = WEEK_COVER_REGISTRY[w.weekNo];
      assert.ok(cover, `${w.weekNo}주 표지 등록 없음`);
      assert.match(cover.src, /^\/images\//, `${w.weekNo}주 표지 주소`);
      assert.ok(cover.width > 0 && cover.height > 0, `${w.weekNo}주 표지 크기`);
      assert.ok(cover.alt.includes(`${w.weekNo}주차`), `${w.weekNo}주 대체 텍스트`);
      // 사용권 확인 전에는 화면에 싣지 않고 자체 제작 SVG 로 그린다
      assert.equal(w.image, published ? cover : null, `${w.weekNo}주 표지 공개 여부`);
    } else {
      // 9~24주차는 표지를 등록하지 않는다 — 잘못된 표지를 다시 걸지 않는다
      assert.equal(w.image, null, `${w.weekNo}주는 표지를 등록하지 않는다`);
      assert.equal(WEEK_COVER_REGISTRY[w.weekNo], undefined, `${w.weekNo}주 표지 등록`);
    }
  }
  assert.equal(characterGroupImage(), null);
  assert.deepEqual(Object.keys(MEDIA), []);
  assert.deepEqual(Object.keys(WEEK_COVER_REGISTRY).map(Number).sort((a, b) => a - b),
    Array.from({ length: 8 }, (_, i) => i + 1));
  assert.deepEqual(Object.keys(WEEK_MEDIA).length, published ? 8 : 0);
  for (const p of EXPERIENCE_PARTS) assert.equal("image" in p, false, `PART ${p.partNo}`);
});

test("35분 단계마다 진행 순서 · 준비물 · 전환 멘트 · 대체 참여가 있고, 자료 단계가 있으면 원문이다", () => {
  for (const w of EXPERIENCE_WEEKS) {
    const d = WEEK_DASHBOARDS.find((x) => x.weekNo === w.weekNo);
    for (const s of w.stages) {
      const at = `${w.weekNo}주 ${s.title}`;
      assert.ok(s.steps.length >= 1 && s.steps.every((x) => x.text.trim()), `${at} 진행 순서`);
      assert.ok(s.inclusion.trim(), `${at} 대체 참여`);
      assert.equal(s.transition === null, s.key === "share", `${at} 전환 멘트는 마지막 단계만 없다`);
      if (s.transition) assert.doesNotMatch(s.transition, /정답|무슨 색/, at);
    }
    const move = w.stages.find((s) => s.key === "move"), make = w.stages.find((s) => s.key === "make");
    for (const p of d.physicalSteps) assert.ok(move.steps.some((x) => x.origin === "source" && x.text.startsWith(p.title)), `${w.weekNo}주 신체 단계 원문 ${p.title}`);
    if (d.artSteps.length) assert.ok(make.steps.every((x) => x.origin === "source"), `${w.weekNo}주 예술 단계 원문`);
    assert.ok(move.materials.length >= 1, `${w.weekNo}주 신체 단계 준비물`);
  }
});

test("2차 원문 대조 — 두 번째 대표활동(7 · 9주) · 미술 제목(4~8주) · 지원자료 유형(7 · 8주) · 통합 주차 모으기", () => {
  const D = (n) => WEEK_DASHBOARDS.find((x) => x.weekNo === n);
  assert.match(D(7).physical2?.title ?? "", /꿀을 모아요/);
  assert.match(D(9).physical2?.title ?? "", /봄바람이 불어옵니다/);
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) assert.ok(D(n).artTitle, `${n}주 미술 제목`);
  assert.equal(D(7).supportType, "teacherPrint");
  assert.equal(D(8).supportType, "teacherPrep");
  assert.equal(D(8).homeKitHow.length, 4, "8주 교사 사전 준비 4단계");
  const weeksOf = (n) => gatherForWeek(n).map((x) => Number(x.split("주차")[0]));
  assert.deepEqual(weeksOf(8), [4, 5, 6, 7], "8주차는 4~7주차 결과물을 모은다");
  // 14주는 공식 가이드 수업이라 자료 PDF 의 「→ 16주차 회고 사진」 연계가 없다 (가이드에 16주 연계 없음)
  assert.deepEqual(weeksOf(16), [9, 10, 11, 12, 13, 15]);
  // 24주(공식 가이드)는 앞 주차 「주차 연계」 칸이 아니라 가이드 준비물 「17~23주 실제 활동사진」으로 모은다
  assert.deepEqual(weeksOf(24), []);
  assert.match(D(24).orgItems.join(" "), /17~23주 실제 활동사진/);
});

const SRC_DIR = join(ROOT, "docs/curriculum-upgrade/TAP_Curriculum_Development_Pack/TeachAble_24Week_Dashboard_DevPack/source_text");
// 원문 텍스트 — 14 · 17~24주는 공식 교사용 수업가이드의 공개 요약(guide-summaries.ts · 원문 전사본은 비공개), 나머지는 자료 PDF 추출본
const GUIDE_WEEKS = [14, 17, 18, 19, 20, 21, 22, 23, 24];
const sourceText = (n) => GUIDE_WEEKS.includes(n)
  ? readFileSync(join(ROOT, "src/data/experience/teacher-dashboard/guide-summaries.ts"), "utf8")
  : readFileSync(n <= 20 ? join(SRC_DIR, `week-${String(n).padStart(2, "0")}.txt`) : join(ROOT, `docs/curriculum-upgrade/dashboard-source-21-24/week-${n}.txt`), "utf8");
const squashAll = (s) => s.normalize("NFC").replace(/[\s?.!,·ˮ”“"'‘’()~\-–]/g, "");

test("「PDF 원문」으로 표시한 문장은 저장소의 PDF 원문 텍스트에 그대로 있다 (단계 · 수업 전 준비)", () => {
  for (const w of EXPERIENCE_WEEKS) {
    const srcWeek = squashAll(sourceText(w.weekNo));
    const items = [...w.stages.flatMap((s) => s.steps), ...w.prep.before, w.prep.space, w.prep.cleanup];
    for (const it of items) {
      if (it.origin !== "source") continue;
      // 「제목 — 안내」 · 「N주차 — 주차 연계」는 각 조각이 원문에 있어야 한다
      // 「N주차 — …」(통합 주차의 모아 올 것)은 N주차 원문에서 온 문장이다
      const from = it.text.match(/^(\d+)주차 — /)?.[1];
      const src = from ? squashAll(sourceText(Number(from))) : srcWeek;
      for (const part of it.text.split(" — ")) {
        if (/^\d+주차$/.test(part)) continue;
        // 원문 텍스트가 단(column) 나눔대로 뽑혀 한 문장이 여러 줄에 흩어진 주차가 있다 — 문장의 낱말이 모두 원문에 있어야 한다
        const words = part.split(/\s+/).map(squashAll).filter((x) => x.length >= 2);
        assert.ok(src.includes(squashAll(part)) || words.every((x) => src.includes(x)), `${w.weekNo}주 원문에 없는데 「PDF 원문」: ${part}`);
      }
    }
    for (const s of w.stages) {
      if (s.teacherQuestionOrigin === "source") assert.ok(srcWeek.includes(squashAll(s.teacherQuestion)), `${w.weekNo}주 발문 출처`);
      assert.notEqual(s.guideOrigin, "source", `${w.weekNo}주 ${s.title} 안내는 편집 문장이다`);
    }
  }
});

test("35분 단계 발문 — 단계마다 다르고(도입 ≠ 그림책), 정답 유도 · 평가 질문이 없다", () => {
  for (const w of EXPERIENCE_WEEKS) {
    const qs = w.stages.map((s) => s.teacherQuestion);
    assert.equal(new Set(qs).size, qs.length, `${w.weekNo}주 발문 중복: ${qs.join(" | ")}`);
    const open = w.stages.find((s) => s.key === "open"), story = w.stages.find((s) => s.key === "story");
    assert.equal(open.teacherQuestion, w.body.openQuestion);
    assert.equal(open.teacherQuestionOrigin, "proposal", `${w.weekNo}주 도입 발문은 교사용 제안`);
    assert.equal(open.guide, w.body.openLine);
    assert.equal(story.teacherQuestionOrigin, w.body.storyQuestionProposed ? "proposal" : "edited", `${w.weekNo}주 그림책 발문 출처`);
    for (const q of qs) assert.doesNotMatch(q, /정답|맞혀|맞춰 보|잘했|잘하는|못하는|누가 더|누가 제일|몇 점|무슨 색이 될|무슨 색일까/, `${w.weekNo}주: ${q}`);
  }
  // 도입 멘트 · 도입 발문이 주차마다 다르다 (모든 주차에 같은 틀 문장을 쓰지 않는다)
  assert.equal(new Set(EXPERIENCE_WEEKS.map((w) => w.body.openLine)).size, 24);
  assert.equal(new Set(EXPERIENCE_WEEKS.map((w) => w.body.openQuestion)).size, 24);
});

test("교사용 전체 흐름 — 수업 전 준비 → 다섯 단계 → 확장활동 → 관찰 · 가정연계가 24주 모두 이어진다", () => {
  for (const w of EXPERIENCE_WEEKS) {
    const at = `${w.weekNo}주`;
    assert.ok(w.prep.before.length >= 2 && w.prep.space.text && w.prep.cleanup.text, `${at} 수업 전 준비 · 공간 · 정리`);
    assert.deepEqual(w.stages.map((s) => s.key), STAGE_ORDER, `${at} 단계`);
    assert.ok(w.extensions.length >= 1, `${at} 확장활동`);
    assert.ok(w.teacherObservations.items.length >= 3, `${at} 관찰`);
    assert.ok(w.body.homeConnection.trim(), `${at} 가정연계`);
    for (const x of [...w.prep.before, w.prep.space, w.prep.cleanup, ...w.stages.flatMap((s) => s.steps)]) assert.ok(["source", "edited", "proposal", "review"].includes(x.origin), at);
  }
  // 통합 주차는 앞 주차 결과물 모으기가 수업 전 준비에 원문으로 들어간다
  // (14주 · 24주는 공식 가이드 수업 — 14주는 16주 연계가 없고, 24주는 가이드 준비물 「17~23주 실제 활동사진」으로 모은다)
  for (const [n, from] of [[8, [4, 5, 6, 7]], [16, [9, 10, 11, 12, 13, 15]], [24, []]]) {
    const w = EXPERIENCE_WEEKS.find((x) => x.weekNo === n);
    const got = w.prep.before.filter((x) => x.origin === "source" && /^\d+주차 — /.test(x.text)).map((x) => Number(x.text.split("주차")[0]));
    assert.deepEqual(got, from, `${n}주 모아 올 것`);
  }
  // 8주 교사 사전 준비 4단계 (원문)
  assert.ok(EXPERIENCE_WEEKS.find((x) => x.weekNo === 8).prep.before.some((x) => x.text === "4~7주차 완성품을 종류별로 정리하기" && x.origin === "source"));
});

test("자료에 적힌 발문(진행 팁 · 운영 포인트 속 따옴표 문장)은 PDF 원문 그대로 보존된다", async () => {
  const { pdfQuestions } = await import("../src/data/experience/teacher-dashboard/week-dashboards.ts");
  let total = 0;
  for (let n = 1; n <= 24; n++) {
    const src = squashAll(sourceText(n));
    for (const q of pdfQuestions(n)) {
      total++;
      assert.ok(src.includes(squashAll(q)), `${n}주 자료 발문이 원문에 없다: ${q}`);
    }
  }
  // 14 · 17~24주는 공식 가이드 수업 — 공개 요약에는 가이드의 발문 목록을 싣지 않는다 (2026-10-29)
  assert.ok(total >= 4, `자료 발문 ${total}개`);
});

test("단계 · 수업 전 준비 문장에 「을(를)」 같은 기계적 조사가 없다", () => {
  for (const w of EXPERIENCE_WEEKS) {
    const all = [...w.stages.flatMap((s) => s.steps.map((x) => x.text)), ...w.prep.before.map((x) => x.text), w.prep.space.text, w.prep.cleanup.text];
    for (const s of all) assert.doesNotMatch(s, /을\(를\)|이\(가\)|은\(는\)/, `${w.weekNo}주: ${s}`);
  }
});

test("교사 대시보드 업무 메뉴 여덟 가지가 모두 있고, 가는 자리가 화면에 있다", () => {
  const dash = readFileSync(join(ROOT, "src/components/play/TeacherDashboard.tsx"), "utf8");
  const page = readFileSync(join(ROOT, "src/app/experience/weeks/[weekNo]/page.tsx"), "utf8");
  for (const code of ["WK", "LS", "PR", "OB", "RP", "FM", "MD", "CW"]) assert.match(dash, new RegExp(`code: "${code}"`), code);
  for (const id of ["dash-prep", "dash-cw"]) assert.match(dash, new RegExp(`id="${id}"`), id);
  assert.match(page, /id="lesson-plan"/);
});

test("표지 글씨가 자료의 그림책 제목과 다른 주차(3 · 7 · 8)는 두 제목을 나눠 적는다", () => {
  const differ = EXPERIENCE_WEEKS.filter((w) => w.image?.coverTitle && w.image.coverTitle !== w.storybook).map((w) => w.weekNo);
  assert.deepEqual(differ, [3, 7, 8]);
  for (const w of EXPERIENCE_WEEKS) if (w.image) assert.ok(w.image.alt.includes(`《${w.image.coverTitle}》`), `${w.weekNo}주 대체 텍스트`);
  // 9~16주차 이름의 영상 썸네일(그림 속 내용은 1~8주차)은 어느 주차에도 걸지 않는다
  for (const w of EXPERIENCE_WEEKS) if (w.image) assert.match(w.image.src, /^\/images\/week-covers-web\/week-0[1-8]\.webp$/);
});

test("수업 전 · 마무리 확인 목록 — 24주 모두 빠진 묶음이 없고, 「PDF 원문」 항목은 원문에 있다", async () => {
  const { preLessonChecks, closingChecks, SAFETY_ORIGIN } = await import("../src/data/experience/lesson-support.ts");
  for (const w of EXPERIENCE_WEEKS) {
    const next = EXPERIENCE_WEEKS.find((x) => x.weekNo === w.weekNo + 1) ?? null;
    const pre = preLessonChecks(w);
    const keys = pre.map((g) => g.key);
    for (const k of ["goal", "materials", "space", "safety", "script", "media"]) assert.ok(keys.includes(k), `${w.weekNo}주 수업 전 ${k}`);
    // 24주(공식 가이드)는 「주차 연계」 모으기가 아니라 준비물의 「17~23주 실제 활동사진」으로 모은다
    assert.equal(keys.includes("gather"), [8, 16].includes(w.weekNo), `${w.weekNo}주 앞 주차 결과물`);
    const close = closingChecks(w, next);
    for (const k of ["share", "cleanup", "observe"]) assert.ok(close.some((g) => g.key === k), `${w.weekNo}주 마무리 ${k}`);
    // 24주는 다음 주차가 없다 — 주차 연계 원문은 「다음 주차로」가 아니라 따로 묶는다 (이번 주 → 다음 · 앞 주차 → 이번 주가 함께 적힌 칸)
    assert.equal(close.some((g) => g.key === "next"), w.weekNo < 24, `${w.weekNo}주 다음 주차 준비`);
    assert.equal(close.some((g) => g.key === "crossweek"), Boolean(WEEK_DASHBOARDS.find((d) => d.weekNo === w.weekNo).crossWeek), `${w.weekNo}주 주차 연계 원문`);
    // 17 · 22 · 24주 사전 제작 · 18~23주 세계지도 깃발은 자료 PDF 수업의 것이라, 공식 가이드 기준이 된 그 주차에는 없다
    assert.equal(keys.includes("premake"), [4, 11, 16].includes(w.weekNo), `${w.weekNo}주 미리 준비 · 사전 제작`);
    assert.equal(close.some((g) => g.key === "worldmap"), false, `${w.weekNo}주 세계지도 깃발`);
    for (const g of [...pre, ...close]) {
      assert.ok(g.items.length > 0 && g.items.every((x) => x.text.trim()), `${w.weekNo}주 ${g.key} 비어 있음`);
      for (const it of g.items) {
        if (it.origin !== "source") continue;
        // 「N주차 교구 · …」(다음 주차) · 「N주차 — …」(통합 주차 모으기)는 그 주차 원문에서 온 문장이다
        const from = it.text.match(/^(\d+)주차 (?:교구 · |— )/)?.[1];
        const body = it.text.replace(/^\d+주차 (?:교구 · |— )/, "");
        const src = squashAll(sourceText(from ? Number(from) : w.weekNo));
        const words = body.split(/\s+/).map(squashAll).filter((x) => x.length >= 2);
        assert.ok(src.includes(squashAll(body)) || words.every((x) => src.includes(x)), `${w.weekNo}주 ${g.key} 「PDF 원문」인데 원문에 없다: ${it.text}`);
      }
    }
    // 안전 문장을 원문으로 올리려면 모든 줄이 원문에 있어야 한다
    if (SAFETY_ORIGIN === "source") for (const s of w.body.safety) assert.ok(squashAll(sourceText(w.weekNo)).includes(squashAll(s)), `${w.weekNo}주 안전 ${s}`);
  }
  assert.equal(SAFETY_ORIGIN, "proposal", "자료 PDF 에 안전 항목이 없다 — 교사용 제안으로 밝힌다");
});

test("미디어 보유 상태 — 실제 공개 파일(1~8주 표지)만 「있음」이고 음원 · 영상 · 워크북 · 사진은 있음이 아니다", async () => {
  const { mediaStatus } = await import("../src/data/experience/lesson-support.ts");
  for (const w of EXPERIENCE_WEEKS) {
    const rows = mediaStatus(w);
    assert.deepEqual(rows.map((r) => r.key), ["cover", "ebook", "audio", "video", "workbook", "kitPhoto", "example"]);
    for (const r of rows) assert.equal(r.state === "ready", r.key === "cover" && w.image !== null, `${w.weekNo}주 ${r.key}`);
  }
});

test("가상 성장 리포트 — 5대 지표는 공식 명칭이고, 장면마다 그 주차 PDF 의 활동 이름을 근거로 단다", async () => {
  const { DEMO_REPORT, GROWTH_INDICATORS, SUPPORT_LEGEND } = await import("../src/data/experience/report.ts");
  const { GROWTH_METRIC_CODES, GROWTH_METRIC_LABEL, SUPPORT_LEVEL_CODES } = await import("../src/lib/curriculum/taxonomies.ts");
  const nospace = (s) => s.replace(/\s/g, "");
  assert.deepEqual(GROWTH_INDICATORS.map((g) => g.code), [...GROWTH_METRIC_CODES]);
  for (const g of GROWTH_INDICATORS) assert.equal(nospace(g.name), nospace(GROWTH_METRIC_LABEL[g.code]), g.code);
  assert.deepEqual(SUPPORT_LEGEND.map((s) => s.code), [...SUPPORT_LEVEL_CODES]);
  for (const m of DEMO_REPORT.moments) {
    assert.ok(SUPPORT_LEVEL_CODES.includes(m.support), m.title);
    assert.ok(m.evidence.startsWith(`${m.week}주차 `), `${m.title} 근거 주차`);
    const name = m.evidence.match(/「(.+)」/)?.[1];
    assert.ok(name, `${m.title} 근거 활동 이름`);
    for (const part of name.split(" · ")) assert.ok(squashAll(sourceText(m.week)).includes(squashAll(part)), `${m.week}주 PDF 에 없는 활동: ${part}`);
  }
});

test("인쇄용 수업 요약은 24주 모두 생성되고 검색 색인에서 뺀다", () => {
  const page = readFileSync(join(ROOT, "src/app/experience/weeks/[weekNo]/print/page.tsx"), "utf8");
  assert.match(page, /robots: \{ index: false/);
  assert.match(page, /generateStaticParams/);
  for (const part of ["preLessonChecks", "closingChecks", "familyTitle", "OriginTag"]) assert.ok(page.includes(part), part);
});

test("교사 대시보드 12개 영역의 자료 문장은 모두 그 주차 PDF 원문에 있다 (고쳐 쓴 문장이 원문으로 남지 않는다)", async () => {
  const { EDITED_LINES, isEditedLine } = await import("../src/data/experience/teacher-dashboard/week-dashboards.ts");
  // PDF 추출본은 작은따옴표를 ʼ(U+02BC)로 적은 곳이 있다
  const sq = (s) => squashAll(s).replace(/ʼ/g, "");
  for (const d of WEEK_DASHBOARDS) {
    const src = sq(sourceText(d.weekNo));
    const fields = {
      story: [d.storybookTitle, d.storySummary, d.storyMessage], physical: [d.physicalTitle, ...d.physicalSteps.flatMap((s) => [s.title, s.guide])],
      art: [d.artTitle, ...d.artSteps], workbook: d.workbookSheets.flatMap((s) => [s.title, s.guide]), kit: [...d.kitItems, ...d.orgItems],
      family: [d.familyTitle, ...d.familyHow, ...d.familyTalk], homeKit: [d.homeKitName, ...d.homeKitItems], nuri: d.nuri.flatMap((x) => x.items),
      media: d.media, point: [d.teacherPoint], observe: [...d.observations, ...d.goals], record: [d.kidsnote, ...d.parentNotice, d.crossWeek],
    };
    for (const [k, list] of Object.entries(fields)) {
      for (const t of list.filter(Boolean)) {
        if (isEditedLine(d.weekNo, t)) continue; // 고쳐 쓴 문장 — 아래에서 원문을 따로 확인한다
        const words = t.split(/\s+/).map(sq).filter((x) => x.length >= 2);
        assert.ok(src.includes(sq(t)) || (words.length > 0 && words.every((x) => src.includes(x))), `${d.weekNo}주 ${k} 원문에 없음: ${t}`);
      }
    }
  }
  // 고쳐 쓴 문장 — 고치기 전 원문은 PDF 에 있고, 고친 문장은 원문이 아니다 (EDITED_LINES 는 자료 PDF 문장에만 붙는다)
  const pdfText = (n) => readFileSync(n <= 20 ? join(SRC_DIR, `week-${String(n).padStart(2, "0")}.txt`) : join(ROOT, `docs/curriculum-upgrade/dashboard-source-21-24/week-${n}.txt`), "utf8");
  for (const e of EDITED_LINES) {
    assert.ok(sq(pdfText(e.weekNo)).includes(sq(e.original)), `${e.weekNo}주 고치기 전 원문이 PDF 에 없다`);
    assert.ok(!sq(pdfText(e.weekNo)).includes(sq(e.text)), `${e.weekNo}주 원문 그대로인데 편집으로 표시`);
    assert.ok(e.reason.trim(), `${e.weekNo}주 고친 까닭`);
  }
});

test("접근성 회귀 — 주차 번호 단추의 보이는 숫자가 접근 이름에 낱말로 들어가고, 주차 색 위 흰 글자를 흐리게 하지 않는다", () => {
  const explorer = readFileSync(join(ROOT, "src/components/play/WeekExplorer.tsx"), "utf8");
  assert.match(explorer, /aria-label=\{`\$\{w\.weekNo\} 주차 /, "WCAG 2.5.3 Label in Name");
  const dash = readFileSync(join(ROOT, "src/components/play/TeacherDashboard.tsx"), "utf8");
  // 주차 색 배경 + 흰 글자 블록 안에서 opacity 를 쓰면 대비가 4.5:1 아래로 떨어진다 (2026-10-27 axe 4.06:1)
  const block = dash.slice(dash.indexOf("학부모 안내 카드 미리보기"), dash.indexOf("학부모 안내 카드 미리보기") + 900);
  assert.doesNotMatch(block, /opacity-\d+/);
});

test("원문 「미작성」 칸과 자료에서 찾지 못한 칸을 화면에서 다른 말로 적는다", () => {
  const dash = readFileSync(join(ROOT, "src/components/play/TeacherDashboard.tsx"), "utf8");
  assert.match(dash, /BLANK_IN_SOURCE = "자료 원문에 「미작성」으로 적혀 있습니다/);
  assert.match(dash, /missingInSource\.includes\("준비물"\) \? BLANK_IN_SOURCE : NONE/);
  assert.match(dash, /missingInSource\.includes\("성장기록 예시"\) \? BLANK_IN_SOURCE : NONE/);
  for (const n of [1, 2, 3, 4]) assert.ok(WEEK_DASHBOARDS.find((d) => d.weekNo === n).missingInSource.includes("준비물"), `${n}주 준비물 미작성`);
});
