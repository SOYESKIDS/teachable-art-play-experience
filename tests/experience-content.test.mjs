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
import { LESSON_STAGE_MINUTES, LESSON_TIME } from "../src/lib/weeks/lesson-time.ts";
import { WEEK_DASHBOARDS } from "../src/data/experience/teacher-dashboard/week-dashboards.ts";
import { WEEK_PROPOSALS } from "../src/data/experience/teacher-dashboard/proposals.ts";
import { PARTS } from "../src/lib/weeks/week-types.ts";
import { DEMO_LESSONS } from "../src/data/experience/demo-lessons.ts";
import { DEMO_REPORT } from "../src/data/experience/report.ts";
import { CHARACTERS_ENABLED, characterImage, characterGroupImage } from "../src/data/experience/characters.ts";
import { LICENSE_STATUS, MEDIA, WEEK_COVER_REGISTRY, WEEK_MEDIA } from "../src/data/experience/media.ts";
import { WEEK_INDEX } from "../src/lib/weeks/week-index.ts";
import { NURI_AREA_LABEL, APPROVED_SOYE_CORE_EXPERIENCES, GROWTH_METRIC_LABEL } from "../src/lib/curriculum/taxonomies.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
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

test("24주 모두 기본 수업 35분 = 5 + 7 + 13 + 7 + 3 — 시간은 한 곳(lesson-time.ts)에서만 온다", () => {
  assert.deepEqual(LESSON_STAGE_MINUTES, { open: 5, story: 7, move: 13, make: 7, share: 3 });
  assert.equal(LESSON_TIME.totalMinutes, 35);
  assert.equal(LESSON_TIME.label, "기본 수업 35분");
  for (const w of EXPERIENCE_WEEKS) {
    assert.deepEqual(w.stages.map((s) => s.key), STAGE_ORDER);
    // 단계 합이 화면이 말하는 시간과 정확히 같아야 한다. 어긋나면 교사가 수업 중에 시간을 잘못 잡는다.
    assert.deepEqual(Object.fromEntries(w.stages.map((s) => [s.key, s.minutes])), LESSON_STAGE_MINUTES, `${w.weekNo}주 단계별 분`);
    const sum = w.stages.reduce((n, s) => n + s.minutes, 0);
    assert.equal(sum, 35, `${w.weekNo}주 단계 합`);
    assert.equal(w.totalMinutes, 35, `${w.weekNo}주 totalMinutes`);
    assert.equal(w.duration.coreMinutes, 35, `${w.weekNo}주 기본 수업 시간`);
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
    assert.equal(norm(w.title), norm(d.pdfTitle), `${at} 주차 제목: 사이트 「${w.title}」 · 자료 「${d.pdfTitle}」`);
    assert.equal(norm(w.storybook), norm(d.storybookTitle), `${at} 그림책: 사이트 《${w.storybook}》 · 자료 《${d.storybookTitle}》`);
    assert.equal(w.growthKeyword, d.keyword, `${at} 성장 키워드`);
    // 그림책 활동 · 준비물이 같은 그림책을 쓴다 (교실 플레이어와 대시보드가 같은 책)
    assert.ok(w.body.story.includes(`《${w.storybook}》`), `${at} 그림책 활동이 다른 책을 가리킨다`);
    assert.ok(w.body.materials[0].includes(`《${w.storybook}》`), `${at} 준비물 그림책`);
    // 대표 활동 · 미술이 자료의 활동과 같은 활동이다
    const site = `${w.activitySummary} ${w.body.movement} ${w.outcome ?? ""} ${w.body.art}`;
    assert.ok(tokens(d.physicalTitle).some((t) => site.includes(t)), `${at} 대표 활동: 자료 「${d.physicalTitle}」 · 사이트 「${w.activitySummary}」`);
    if (d.artTitle) assert.ok(tokens(d.artTitle).some((t) => site.includes(t)), `${at} 미술: 자료 「${d.artTitle}」`);
    // PART 이름도 자료와 같다
    const part = PARTS.find((p) => p.partNo === w.partNo);
    assert.ok(d.part.endsWith(part.title), `${at} PART: 자료 「${d.part}」 · 사이트 「${part.title}」`);
  }
});

test("바꾸기 전 17~24주 · 14주 주제가 화면 데이터에 남아 있지 않다", () => {
  const text = JSON.stringify(WEEK_INDEX) + JSON.stringify(DEMO_LESSONS) + JSON.stringify(EXPERIENCE_PARTS) + JSON.stringify(DEMO_REPORT);
  for (const old of ["짝! 우리들의 색", "반짝이는 물길", "숲 속 작은 연주회", "주렁주렁", "두근두근 하늘여행", "오늘 밤, 무슨 일", "별빛이 찾아온", "서로 다른 하루", "말하지 않아도 괜찮아", "세계의 축제 (가칭)", "열기구", "태극기", "마음을 담은 비누", "반쪽 토마토"]) {
    assert.ok(!text.includes(old), old);
  }
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
    const file = d.weekNo <= 20 ? join(DEV, `week-${String(d.weekNo).padStart(2, "0")}.txt`) : join(EXTRA, `week-${d.weekNo}.txt`);
    const raw = readFileSync(file, "utf8");
    const src = squash(raw);
    const at = `${d.weekNo}주`;
    // 대시보드 문장은 원문에 그대로 있다
    for (const o of [...d.observations, ...d.goals]) assert.ok(src.includes(squash(o)), `${at} 원문에 없는 문장: ${o}`);
    for (const m of d.media) assert.ok(src.includes(squash(m.split(" — ")[0])), `${at} 원문에 없는 음원: ${m}`);
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
  // 18주(색 섞기) — 제목은 자료 그대로지만 발문은 보이는 변화를 말하게 한다
  const w18 = DEMO_LESSONS.find((l) => l.weekNo === 18);
  assert.match(w18.teacherQuestions.join(" "), /무엇이 보여|이름을 붙여/);
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
