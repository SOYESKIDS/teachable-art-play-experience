import { WEEK_INDEX } from "@/lib/weeks/week-index";
import { LESSON_STAGE_MINUTES, LESSON_TIME, PDF_DURATION_LABEL } from "@/lib/weeks/lesson-time";
import { PARTS } from "@/lib/weeks/week-types";
import { DEMO_LESSONS } from "./demo-lessons";
import { WEEK_MEDIA } from "./media";
import { OPEN_CHILD_LINES } from "./lesson-engine/classroom-lines";
import { officialPlan, type OfficialWeekPlan } from "./official-plan";
import { gatherForWeek, weekDashboard, type WeekDashboard } from "./teacher-dashboard/week-dashboards";
import { weekProposal } from "./teacher-dashboard/proposals";
import {
  CORE_STAGE_ORDER,
  STAGE_LABEL,
  type ClassStage,
  type LessonDuration,
  type OptionalExtension,
  type DemoLessonBody,
  type ExperiencePart,
  type ExperienceWeek,
  type OfficialWeekMeta,
  type Sourced,
  type StageKey,
  type TextOrigin,
} from "./types";

/**
 * 공개 체험 24주 — 수업 지도 메타 + 체험용 본문.
 *
 * ★ 지도 값(주차 제목 · 그림책 · 성장 키워드 · 핵심 메시지 · 대표 활동 · 결과물 · 색)은
 *   week-index.ts 에서 읽기만 한다. 여기서 고치지 않는다.
 * ★ 수업 시간은 lesson-time.ts 의 기본 수업 45분 하나다 (단계별 분은 내부 임시 배분 · 화면에 숫자로 보이지 않는다).
 * ★ week-index.ts 는 정적 데이터 파일이다 — DB · Supabase 를 부르지 않는다.
 *   (tests/experience-isolation.test.mjs 가 이 폴더의 import 를 검사한다)
 */

/** 기본 수업 순서 — explore 는 move 안으로 들어가 따로 서지 않는다 */
export const STAGE_ORDER: readonly StageKey[] = CORE_STAGE_ORDER;

/** "약 55~65분" → 60 (가운데 값). 읽지 못하면 60 */
export function parseDurationMinutes(label: string): number {
  const m = label.match(/(\d+)\s*~\s*(\d+)/);
  if (m) return Math.round((Number(m[1]) + Number(m[2])) / 2);
  const one = label.match(/(\d+)/);
  return one ? Number(one[1]) : 60;
}

/**
 * 기본 수업 다섯 단계를 만든다.
 *
 * ★ 단계별 분은 24주 모두 lesson-time.ts 의 내부 배분(임시 · 대표 승인 전)이다. 화면에는 숫자로 보이지 않지만
 *   단계 합은 화면이 말하는 기본 수업 시간과 같아야 한다.
 * ★ 발문은 단계마다 다르다 — 도입은 아이의 경험 · 감정 · 호기심을 여는 발문(openQuestion),
 *   그림책은 그림책 장면 · 인물 행동을 묻는 발문(teacherQuestions[0]). 같은 발문을 두 번 쓰지 않는다.
 * ★ 발문 · 안내 · 진행 순서마다 출처(TextOrigin)를 붙인다. 화면 세 곳이 이 값을 그대로 쓴다.
 */
function buildStages(body: DemoLessonBody, meta: OfficialWeekMeta, plan: OfficialWeekPlan): ClassStage[] {
  // 큰 글씨 한 줄 — 「이야기 열기」는 주차 주제가 보이는 문장(교사용 제안 · lesson-engine/classroom-lines.ts).
  //   24주 모두 같던 「오늘은 무엇을 만날까요?」를 바꿨다. 교사용 도입 멘트는 바로 아래 안내에 둔다.
  const childLine: Record<StageKey, string> = { ...body.childLines, open: OPEN_CHILD_LINES[body.weekNo] ?? "오늘은 무엇을 만날까요?" };
  const d = weekDashboard(body.weekNo);
  const inPdf = pdfText(d);
  const ask = (q: string, fallback: TextOrigin): TextOrigin => (inPdf(q) ? "source" : fallback);
  const guide: Record<StageKey, Sourced> = {
    open: { text: body.openLine, origin: "proposal" },
    story: { text: body.story, origin: "edited" },
    // explore 를 버리지 않는다 — 몸·감각 탐색 한 단계로 함께 묶는다
    move: { text: `${body.movement} ${body.explore}`, origin: "edited" },
    explore: { text: body.explore, origin: "edited" },
    make: { text: body.art, origin: "edited" },
    share: { text: body.homeConnection, origin: "edited" },
  };
  const question: Record<StageKey, Sourced> = {
    open: { text: body.openQuestion, origin: "proposal" },
    story: { text: body.teacherQuestions[0], origin: ask(body.teacherQuestions[0], body.storyQuestionProposed ? "proposal" : "edited") },
    move: { text: body.teacherQuestions[1] ?? body.teacherQuestions[0], origin: ask(body.teacherQuestions[1] ?? "", "edited") },
    explore: { text: body.teacherQuestions[1] ?? body.teacherQuestions[0], origin: "edited" },
    make: { text: body.teacherQuestions[2] ?? body.teacherQuestions[0], origin: ask(body.teacherQuestions[2] ?? "", "edited") },
    share: { text: body.closingQuestion, origin: ask(body.closingQuestion, "edited") },
  };
  const minutes: Record<StageKey, number> = { ...LESSON_STAGE_MINUTES, explore: 0 };
  const detail = stageDetail(body, meta, plan, d);
  return CORE_STAGE_ORDER.map((key) => ({
    key,
    title: STAGE_LABEL[key],
    childLine: childLine[key],
    guide: guide[key].text,
    guideOrigin: guide[key].origin,
    teacherQuestion: question[key].text,
    teacherQuestionOrigin: question[key].origin,
    minutes: minutes[key],
    ...detail[key],
  }));
}

/** 을/를 — 마지막 한글 글자의 받침으로 고른다 (문장부호 · 괄호는 건너뛴다) */
function objectParticle(word: string): string {
  const last = [...word.replace(/\([^)]*\)/g, "")].reverse().find((c) => c >= "가" && c <= "힣");
  if (!last) return "을(를)";
  return (last.charCodeAt(0) - 0xac00) % 28 === 0 ? "를" : "을";
}

/** 이 주차 자료 PDF 문장에 그대로 있는가 (공백 · 문장부호를 빼고 비교) */
function pdfText(d: WeekDashboard | null): (s: string) => boolean {
  const squash = (s: string) => s.normalize("NFC").replace(/[\s?.!,·“”"'‘’()]/g, "");
  const all = squash(JSON.stringify(d ?? {}));
  return (s) => s.trim().length >= 6 && all.includes(squash(s));
}

type StageDetail = Pick<ClassStage, "steps" | "materials" | "safety" | "tip" | "transition" | "inclusion" | "levels">;

/**
 * 단계마다 교사가 실제로 보는 것 — 진행 순서 · 준비물 · 안전 · 전환 멘트 · 대체 참여 · 난이도.
 *
 * ★ 진행 순서는 문장마다 출처를 붙인다. PDF 문장 **그대로**인 것만 source 다
 *   (「《책》 함께 봐요」 같은 연결 문장 · 마무리 질문은 edited, 도입 멘트는 proposal).
 *   tests 가 source 문장을 저장소의 PDF 원문 텍스트와 대조한다.
 * ★ 전환 멘트 · 대체 참여 · 연령별 조절은 자료에 없는 **교사용 제안**이다. 화면이 그렇게 표시한다.
 *   주차의 그림책 · 활동 이름만 끼워 넣고, 새 활동을 지어내지 않는다.
 */
function stageDetail(body: DemoLessonBody, meta: OfficialWeekMeta, plan: OfficialWeekPlan, d: WeekDashboard | null): Record<StageKey, StageDetail> {
  const book = `《${meta.storybook}》`;
  const src = (text: string): Sourced => ({ text, origin: "source" });
  const moveSteps: Sourced[] = [
    ...(d?.physicalSteps ?? []).map((s) => src(s.guide ? `${s.title} — ${s.guide}` : s.title)),
    ...(d?.physical2 ? [src(d.physical2.title), ...d.physical2.steps.map((s) => src(`${s.title} — ${s.guide}`))] : []),
  ];
  const moveMaterials = [...(d?.physicalMaterials ?? []), ...(d?.physical2?.materials ?? [])];
  const near = (a: string, b: string) => a.split(/[\s·,/()]+/).some((w) => w.length >= 2 && b.includes(w));
  const makeMaterials = [...(d?.kitItems ?? []).filter((k) => !moveMaterials.some((m) => near(k, m))), ...(d?.orgItems ?? [])];
  const artName = d?.artTitle ?? meta.outcome ?? "오늘의 작품";
  const physName = d?.physicalTitle ?? "오늘의 놀이";
  const openSteps: Sourced[] = [
    { text: body.openLine, origin: "proposal" },
    { text: `“${body.openQuestion}” — 말 · 손짓 · 그림 카드 가운데 편한 방법으로 자유롭게 답해요.`, origin: "proposal" },
    ...(plan.matchesCurrentLesson && plan.introTitle ? [{ text: `이전 공식 가이드의 도입 — ${plan.introTitle}`, origin: "edited" as const }] : []),
  ];
  return {
    open: {
      steps: openSteps,
      materials: [body.materials[0]],
      safety: [],
      tip: null,
      transition: `이제 ${book} 그림책 속으로 들어가 볼까요?`,
      inclusion: "말로 답하기 어려운 친구는 손짓 · 표정 · 그림 카드로 고르게 해요.",
      levels: null,
    },
    story: {
      steps: [
        { text: `${book}${objectParticle(meta.storybook)} 함께 봐요.`, origin: "edited" },
        ...(d?.storySummary ? [src(d.storySummary)] : []),
        d?.storyMessage ? src(d.storyMessage) : { text: `핵심 메시지 — ${meta.coreMessage}`, origin: "edited" },
      ],
      materials: [body.materials[0]],
      safety: [],
      tip: null,
      transition: `그림책 속 친구처럼 이제 우리 몸으로 해 볼까요? 「${physName}」!`,
      inclusion: "소리 · 화면 자극이 큰 친구는 편한 자리에서 보게 하고, 책장을 넘기는 역할을 맡길 수 있어요.",
      levels: null,
    },
    move: {
      steps: moveSteps.length ? moveSteps : [{ text: body.movement, origin: "edited" }],
      materials: moveMaterials.length ? moveMaterials : body.materials.slice(1),
      safety: body.safety,
      tip: d?.activityTip ?? d?.physical2?.tip ?? null,
      transition: `몸으로 느낀 것을 이제 손으로 표현해 볼까요? 「${artName}」`,
      inclusion: "움직임이 어렵거나 감각이 예민한 친구는 자리에서 손 · 상체로 함께하거나, 신호를 주는 역할로 참여해요.",
      levels: "만 4세: 선생님이 한 단계씩 먼저 보여 주고 따라 해요 · 만 6~7세: 규칙과 순서를 아이들이 함께 정해요.",
    },
    explore: { steps: [], materials: [], safety: [], tip: null, transition: null, inclusion: "", levels: null },
    make: {
      steps: d?.artSteps.length ? d.artSteps.map(src) : [{ text: body.art, origin: "edited" }],
      materials: makeMaterials.length ? makeMaterials : body.materials.slice(1),
      safety: body.safety.slice(-1),
      tip: null,
      transition: "만든 것을 친구들에게 보여 주며 이야기 나눠 볼까요?",
      inclusion: "소근육이 어려운 친구는 큰 재료를 쓰고 선생님과 함께 붙이거나, 색 · 자리를 고르는 것으로 참여해요.",
      levels: "만 4세: 자르기 · 붙이기 재료를 미리 준비해 두어요 · 만 6~7세: 재료와 방법을 스스로 골라요.",
    },
    share: {
      steps: [
        { text: `마무리 질문 — “${body.closingQuestion}”`, origin: "edited" },
        d?.familyTitle ? src(d.familyTitle) : { text: body.homeConnection, origin: "edited" },
      ],
      materials: [],
      safety: [],
      tip: null,
      transition: null,
      inclusion: "발표가 부담스러운 친구는 작품을 들어 보이거나 한 낱말로 말해도 충분해요.",
      levels: null,
    },
  };
}

/**
 * 수업 전 준비 · 공간 배치 · 정리 — 교사가 혼자 운영할 때.
 *
 * ★ 앞 주차에서 모아 올 것(통합 주차) · 교사 사전 준비(8주차)는 PDF 원문이다.
 * ★ 공간 배치 · 정리는 자료에 없으면 교사용 제안이다. 진행 팁에 정리 방법이 있으면 원문을 쓴다.
 */
function buildPrep(body: DemoLessonBody, meta: OfficialWeekMeta, stages: ClassStage[]): ExperienceWeek["prep"] {
  const d = weekDashboard(body.weekNo);
  const move = stages.find((s) => s.key === "move");
  const make = stages.find((s) => s.key === "make");
  const before: Sourced[] = [
    ...gatherForWeek(body.weekNo).map((text) => ({ text, origin: "source" as const })),
    ...(d?.supportType === "teacherPrep" ? d.homeKitHow.map((text) => ({ text, origin: "source" as const })) : []),
    { text: `그림책 《${meta.storybook}》(또는 E-BOOK)을 펼칠 자리에 준비해요.`, origin: "edited" },
    { text: `신체 놀이 준비물 ${move?.materials.length ?? 0}가지 · 만들기 재료 ${make?.materials.length ?? 0}가지를 단계별로 나눠 둬요.`, origin: "edited" },
  ];
  const tipWithCleanup = [d?.activityTip, d?.physical2?.tip].find((x) => x && x.includes("정리"));
  return {
    before,
    space: {
      text: `둥글게 앉는 이야기 자리, ${move?.materials[0] ? `「${move.materials[0]}」${objectParticle(move.materials[0])} 쓰는 ` : ""}신체 놀이 공간, 만들기 책상을 나눠 두고 이동 길에 걸리는 물건을 치워요.`,
      origin: "proposal",
    },
    cleanup: tipWithCleanup
      ? { text: tipWithCleanup, origin: "source" }
      : { text: "신체 놀이 교구는 아이들과 함께 바구니에 모으고, 작품은 이름을 붙여 말릴 자리에 둬요. 쓰고 남은 재료는 다음 주를 위해 상자에 정리해요.", origin: "proposal" },
  };
}

/**
 * 자료 PDF 로 바뀐 주차의 선택 확장활동 — 워크북 · 작품 완성 · 가정연계.
 *
 * ★ 자료에 단계별 시간이 없다. 모르는 시간을 숫자로 적지 않고 「검수 필요」로 둔다.
 * ★ 활동 이름은 자료의 워크북 · 미술 · 가족연계 제목을 그대로 쓴다.
 */
function buildPdfExtensions(body: DemoLessonBody, d: WeekDashboard): OptionalExtension[] {
  const src = `주차 대시보드 자료 PDF ${d.weekNo}주차`;
  const note = "자료에 단계별 시간이 없습니다 · 검수 필요";
  const base = {
    estimatedMinutes: null,
    minutesNote: note,
    materials: body.materials,
    safetyNote: body.safety[0] ?? null,
    source: src,
    sourceStatus: "pending_review" as const,
  };
  const out: OptionalExtension[] = [];
  if (d.workbookSheets.length > 0) {
    out.push({
      ...base,
      key: "workbook-pdf",
      title: "워크북 심화",
      activity: `${d.workbookTitle ? `「${d.workbookTitle}」 ` : ""}${d.workbookSheets.length}장 — ${d.workbookSheets.map((s) => s.title).join(" · ")}`,
      teacherPrompt: body.teacherQuestions[1] ?? null,
      linkToCore: STAGE_LABEL.share,
    });
  }
  if (d.physical2) {
    out.push({
      ...base,
      key: "move-pdf-2",
      title: "추가 신체놀이",
      activity: `${d.physical2.title} — ${d.physical2.steps.map((s) => s.guide).join(" ")}`,
      materials: d.physical2.materials.length ? [...d.physical2.materials] : body.materials,
      teacherPrompt: body.teacherQuestions[1] ?? null,
      linkToCore: STAGE_LABEL.move,
    });
  }
  if (d.artTitle && d.artSteps.length > 0) {
    out.push({
      ...base,
      key: "art-pdf",
      title: "작품 세부 완성",
      activity: `${d.artTitle} — ${d.artSteps.join(" ")}`,
      teacherPrompt: body.teacherQuestions[2] ?? null,
      linkToCore: STAGE_LABEL.make,
    });
  }
  out.push({
    ...base,
    key: "home",
    title: "가정연계",
    activity: d.familyTitle ? `${d.familyTitle} — ${body.homeConnection}` : body.homeConnection,
    minutesNote: "원에서 쓰는 시간은 자료에 없습니다 · 검수 필요",
    teacherPrompt: body.closingQuestion,
    linkToCore: STAGE_LABEL.share,
  });
  return out;
}

/**
 * 선택 확장활동을 만든다.
 *
 * ★ 이전 공식 가이드가 지금과 같은 수업이면 그 시간표에서 기본 수업 밖으로 나간
 *   단계를 그대로 쓴다. 시간도 가이드의 분이다.
 * ★ 자료 PDF 로 수업이 바뀐 주차(matchesCurrentLesson = false)는 자료의 워크북 ·
 *   미술 · 가족연계로 만든다 (buildPdfExtensions).
 * ★ 가정연계는 어느 주차에나 있지만 원에서 쓰는 시간이 가이드에 없다. 그래서
 *   분을 비운다.
 */
function buildExtensions(body: DemoLessonBody, plan: OfficialWeekPlan): OptionalExtension[] {
  if (!plan.matchesCurrentLesson) {
    const d = weekDashboard(plan.weekNo);
    if (!d) throw new Error(`week-dashboards 에 ${plan.weekNo}주차가 없다`);
    return buildPdfExtensions(body, d);
  }
  const verified = plan.sourceStatus === "verified";
  const src = `공식 교사용 수업가이드 ${plan.weekNo}주차`;
  const out: OptionalExtension[] = plan.extensionSources.map((e) => ({
    key: `${e.kind}-${e.name}`,
    title:
      e.kind === "workbook" ? "워크북 심화"
      : e.kind === "art_more" ? "작품 세부 완성"
      : "추가 신체놀이",
    activity: e.kind === "workbook" ? `${e.name} — 수업에서 본 것을 종이 위에서 다시 떠올려요.`
      : e.kind === "art_more" ? `${e.name} — 기본 수업에서 시작한 작품을 더 완성해요.`
      : `${e.name} — 기본 수업에서 줄인 놀이를 더 길게 해요.`,
    estimatedMinutes: e.min,
    minutesNote: `공식 가이드 권장 시간표 기준 ${e.min}${e.max !== e.min ? `~${e.max}` : ""}분`,
    materials: body.materials,
    teacherPrompt: body.teacherQuestions[1] ?? null,
    safetyNote: body.safety[0] ?? null,
    linkToCore: e.kind === "art_more" ? STAGE_LABEL.make : e.kind === "workbook" ? STAGE_LABEL.share : STAGE_LABEL.move,
    source: src,
    sourceStatus: "verified",
  }));

  out.push({
    key: "home",
    title: "가정연계",
    activity: body.homeConnection,
    estimatedMinutes: null,
    minutesNote: "원에서 쓰는 시간은 가이드에 없습니다 · 검수 필요",
    materials: body.materials,
    teacherPrompt: body.closingQuestion,
    safetyNote: body.safety[0] ?? null,
    linkToCore: STAGE_LABEL.share,
    source: src,
    sourceStatus: verified ? "verified" : "pending_review",
  });

  if (!verified) {
    out.unshift({
      key: "workbook-pending",
      title: "워크북 심화",
      activity: "워크북으로 오늘 활동을 다시 떠올려요.",
      estimatedMinutes: null,
      minutesNote: "이 주차는 공식 가이드에 단계별 시간이 없습니다 · 검수 필요",
      materials: body.materials,
      teacherPrompt: body.teacherQuestions[1] ?? null,
      safetyNote: body.safety[0] ?? null,
      linkToCore: STAGE_LABEL.share,
      source: `${src} (단계별 시간 미기재)`,
      sourceStatus: "pending_review",
    });
  }
  return out;
}

function officialMeta(weekNo: number): OfficialWeekMeta {
  const w = WEEK_INDEX.find((x) => x.weekNo === weekNo);
  if (!w) throw new Error(`week-index 에 ${weekNo}주차가 없다`);
  return {
    weekNo: w.weekNo,
    partNo: w.partNo as 1 | 2 | 3,
    title: w.title,
    sourceTitle: w.sourceTitle,
    lessonUpdatePending: w.lessonUpdatePending,
    storybook: w.storybook,
    growthKeyword: w.growthKeyword,
    coreMessage: w.coreMessage,
    activitySummary: w.activitySummary,
    outcome: w.outcome && w.outcome.trim() !== "" ? w.outcome : null,
    themeColor: w.themeColor,
  };
}

/**
 * 교사용 관찰 문항 — 자료 원문 우선, 자료가 「미작성」인 칸만 교사용 제안.
 * ★ 화면 세 곳(대시보드 · 주차 상세 · 교실 플레이어)이 이 하나를 쓴다. 같은 주차에 관찰 목록이
 *   두 가지로 보이면 교사는 어느 것을 기록해야 할지 모른다.
 */
function teacherObservations(weekNo: number): ExperienceWeek["teacherObservations"] {
  const source = weekDashboard(weekNo)?.observations ?? [];
  if (source.length > 0) return { items: source, origin: "source" };
  const proposal = weekProposal(weekNo)?.observations ?? [];
  if (proposal.length > 0) return { items: proposal, origin: "proposal" };
  return { items: [], origin: "review" };
}

export const EXPERIENCE_WEEKS: ExperienceWeek[] = DEMO_LESSONS.map((body) => {
  const meta = officialMeta(body.weekNo);
  const plan = officialPlan(body.weekNo);
  if (!plan) throw new Error(`official-plan 에 ${body.weekNo}주차가 없다`);

  const stages = buildStages(body, meta, plan);
  // 화면이 말하는 시간과 단계 합이 어긋나면 교사가 수업 중에 시간을 잘못 잡는다
  const totalMinutes = stages.reduce((sum, st) => sum + st.minutes, 0);
  if (totalMinutes !== LESSON_TIME.totalMinutes) {
    throw new Error(`${body.weekNo}주차 단계 합 ${totalMinutes}분이 ${LESSON_TIME.label}과 다르다`);
  }
  const duration: LessonDuration = {
    coreMinutes: totalMinutes,
    pdfDurationLabel: weekDashboard(body.weekNo)?.pdfDuration ?? PDF_DURATION_LABEL,
    legacyGuideDurationLabel: plan.matchesCurrentLesson ? plan.durationLabel : null,
  };

  return {
    ...meta,
    body,
    stages,
    extensions: buildExtensions(body, plan),
    duration,
    image: WEEK_MEDIA[body.weekNo] ?? null,
    teacherObservations: teacherObservations(body.weekNo),
    prep: buildPrep(body, meta, stages),
    totalMinutes,
  };
}).sort((a, b) => a.weekNo - b.weekNo);

export function experienceWeek(weekNo: number): ExperienceWeek | null {
  return EXPERIENCE_WEEKS.find((w) => w.weekNo === weekNo) ?? null;
}

export function weeksInPart(partNo: number): ExperienceWeek[] {
  return EXPERIENCE_WEEKS.filter((w) => w.partNo === partNo);
}

/** 대표 체험 주차 — 4주차 「씨앗과 새싹」 · 그림책 《소예의 씨앗》 */
export const FEATURED_WEEK_NO = 4;

const PART_COPY: Record<1 | 2 | 3, Omit<ExperiencePart, "partNo" | "title" | "nameProvisional" | "weekFrom" | "weekTo">> = {
  1: {
    tagline: "나를 알고, 친구를 만나요",
    description: "작은 씨앗이 숲이 되듯, 새 교실에서 나와 친구를 알아 가는 여덟 번의 모험.",
    tone: "mint",
    character: "pupu",
  },
  2: {
    tagline: "계절과 함께 자라요",
    description: "봄 꽃비부터 겨울 영상편지까지, 사계절의 색과 마음을 몸으로 느끼는 여덟 번의 여행.",
    tone: "sky",
    character: "bukgeuki",
  },
  3: {
    tagline: "세상과 어울려요",
    // 2026-10-29 수정 지시 문장
    description: "세계 여러 문화의 놀이와 장면을 경험하며, 더 넓은 세상으로 자라나는 마지막 여덟 번의 세계여행.",
    tone: "pink",
    character: "ella",
  },
};

export const EXPERIENCE_PARTS: ExperiencePart[] = PARTS.map((p) => ({
  partNo: p.partNo as 1 | 2 | 3,
  title: p.title,
  nameProvisional: p.nameProvisional,
  weekFrom: p.weekFrom,
  weekTo: p.weekTo,
  ...PART_COPY[p.partNo as 1 | 2 | 3],
}));

export function experiencePart(partNo: number): ExperiencePart | null {
  return EXPERIENCE_PARTS.find((p) => p.partNo === partNo) ?? null;
}
