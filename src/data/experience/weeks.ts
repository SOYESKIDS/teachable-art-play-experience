import { WEEK_INDEX } from "@/lib/weeks/week-index";
import { LESSON_STAGE_MINUTES, LESSON_TIME, PDF_DURATION_LABEL } from "@/lib/weeks/lesson-time";
import { PARTS } from "@/lib/weeks/week-types";
import { DEMO_LESSONS } from "./demo-lessons";
import { WEEK_MEDIA } from "./media";
import { officialPlan, type OfficialWeekPlan } from "./official-plan";
import { weekDashboard, type WeekDashboard } from "./teacher-dashboard/week-dashboards";
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
  type StageKey,
} from "./types";

/**
 * 공개 체험 24주 — 수업 지도 메타 + 체험용 본문.
 *
 * ★ 지도 값(주차 제목 · 그림책 · 성장 키워드 · 핵심 메시지 · 대표 활동 · 결과물 · 색)은
 *   week-index.ts 에서 읽기만 한다. 여기서 고치지 않는다.
 * ★ 수업 시간은 lesson-time.ts 의 기본 수업 35분(5 + 7 + 13 + 7 + 3) 하나다.
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
 * ★ 단계별 분은 24주 모두 lesson-time.ts 의 5 + 7 + 13 + 7 + 3분이다. 화면이 말하는
 *   시간과 단계 합이 어긋나면 교사가 수업 중에 시간을 잘못 잡는다.
 * ★ 「이야기 열기」 안내는 이전 공식 가이드의 도입 제목을 쓴다 — 그 가이드가 지금과
 *   같은 수업일 때만. 아니면 핵심 메시지로 대신하고 임시 문장이라고 밝힌다.
 */
function buildStages(body: DemoLessonBody, meta: OfficialWeekMeta, plan: OfficialWeekPlan): ClassStage[] {
  // 공식 도입 제목은 제목 글꼴 서브셋이 못 그리는 주차가 많아 큰 글씨로 쓰지 않는다.
  // 원문은 버리지 않고 바로 아래 교사 안내에 그대로 남긴다.
  const openLine = "오늘은 무엇을 만날까요?";
  const childLine: Record<StageKey, string> = { ...body.childLines, open: openLine };
  const guide: Record<StageKey, string> = {
    open: plan.matchesCurrentLesson && plan.introTitle
      ? `공식 가이드 도입 — ${plan.introTitle}`
      : `${meta.coreMessage} (도입 문장이 자료에 없어 핵심 메시지로 대신합니다)`,
    story: body.story,
    // explore 를 버리지 않는다 — 몸·감각 탐색 한 단계로 함께 묶는다
    move: `${body.movement} ${body.explore}`,
    explore: body.explore,
    make: body.art,
    share: body.homeConnection,
  };
  const question: Record<StageKey, string> = {
    open: body.teacherQuestions[0],
    story: body.teacherQuestions[0],
    move: body.teacherQuestions[1] ?? body.teacherQuestions[0],
    explore: body.teacherQuestions[1] ?? body.teacherQuestions[0],
    make: body.teacherQuestions[2] ?? body.teacherQuestions[0],
    share: body.closingQuestion,
  };
  const minutes: Record<StageKey, number> = { ...LESSON_STAGE_MINUTES, explore: 0 };
  const d = weekDashboard(body.weekNo);
  const detail = stageDetail(body, meta, d);
  return CORE_STAGE_ORDER.map((key) => ({
    key,
    title: STAGE_LABEL[key],
    childLine: childLine[key],
    guide: guide[key],
    teacherQuestion: question[key],
    minutes: minutes[key],
    ...detail[key],
  }));
}

type StageDetail = Pick<ClassStage, "steps" | "stepsOrigin" | "materials" | "safety" | "tip" | "transition" | "inclusion" | "levels">;

/**
 * 단계마다 교사가 실제로 보는 것 — 진행 순서 · 준비물 · 안전 · 전환 멘트 · 대체 참여 · 난이도.
 *
 * ★ 진행 순서 · 준비물 · 진행 팁은 자료 PDF 문장을 그대로 쓴다 (stepsOrigin = source).
 *   자료에 단계가 없으면 체험 구성 문장을 한 줄로 두고 교사용 제안으로 표시한다.
 * ★ 전환 멘트 · 대체 참여 · 연령별 조절은 자료에 없는 **교사용 제안**이다. 화면이 그렇게 표시한다.
 *   주차의 그림책 · 활동 이름만 끼워 넣고, 새 활동을 지어내지 않는다.
 */
function stageDetail(body: DemoLessonBody, meta: OfficialWeekMeta, d: WeekDashboard | null): Record<StageKey, StageDetail> {
  const book = `《${meta.storybook}》`;
  const moveSteps = [
    ...(d?.physicalSteps ?? []).map((s) => (s.guide ? `${s.title} — ${s.guide}` : s.title)),
    ...(d?.physical2 ? [`이어서 「${d.physical2.title}」`, ...d.physical2.steps.map((s) => `${s.title} — ${s.guide}`)] : []),
  ];
  const moveMaterials = [...(d?.physicalMaterials ?? []), ...(d?.physical2?.materials ?? [])];
  const near = (a: string, b: string) => a.split(/[\s·,/()]+/).some((w) => w.length >= 2 && b.includes(w));
  const makeMaterials = [...(d?.kitItems ?? []).filter((k) => !moveMaterials.some((m) => near(k, m))), ...(d?.orgItems ?? [])];
  const artName = d?.artTitle ?? meta.outcome ?? "오늘의 작품";
  const physName = d?.physicalTitle ?? "오늘의 놀이";
  return {
    open: {
      steps: [`그림책 표지를 함께 보며 오늘의 주제 「${meta.coreMessage}」를 떠올려요.`, `“${body.teacherQuestions[0]}”에 생각을 말하거나 손짓으로 답해요.`],
      stepsOrigin: "proposal",
      materials: [body.materials[0]],
      safety: [],
      tip: null,
      transition: `이제 ${book} 그림책 속으로 들어가 볼까요?`,
      inclusion: "말로 답하기 어려운 친구는 손짓 · 표정 · 그림 카드로 고르게 해요.",
      levels: null,
    },
    story: {
      steps: [
        `${book} 함께 보기${d?.storySummary ? ` — ${d.storySummary}` : ""}`,
        `핵심 메시지 — ${d?.storyMessage ?? meta.coreMessage}`,
      ],
      stepsOrigin: d?.storySummary ? "source" : "proposal",
      materials: [body.materials[0]],
      safety: [],
      tip: null,
      transition: `그림책 속 친구처럼 이제 우리 몸으로 해 볼까요? 「${physName}」!`,
      inclusion: "소리 · 화면 자극이 큰 친구는 편한 자리에서 보게 하고, 책장을 넘기는 역할을 맡길 수 있어요.",
      levels: null,
    },
    move: {
      steps: moveSteps.length ? moveSteps : [body.movement],
      stepsOrigin: moveSteps.length ? "source" : "proposal",
      materials: moveMaterials.length ? moveMaterials : body.materials.slice(1),
      safety: body.safety,
      tip: d?.activityTip ?? d?.physical2?.tip ?? null,
      transition: `몸으로 느낀 것을 이제 손으로 표현해 볼까요? 「${artName}」`,
      inclusion: "움직임이 어렵거나 감각이 예민한 친구는 자리에서 손 · 상체로 함께하거나, 신호를 주는 역할로 참여해요.",
      levels: "만 4세: 선생님이 한 단계씩 먼저 보여 주고 따라 해요 · 만 6~7세: 규칙과 순서를 아이들이 함께 정해요.",
    },
    explore: { steps: [], stepsOrigin: "proposal", materials: [], safety: [], tip: null, transition: null, inclusion: "", levels: null },
    make: {
      steps: d?.artSteps.length ? [...d.artSteps] : [body.art],
      stepsOrigin: d?.artSteps.length ? "source" : "proposal",
      materials: makeMaterials.length ? makeMaterials : body.materials.slice(1),
      safety: body.safety.slice(-1),
      tip: null,
      transition: "만든 것을 친구들에게 보여 주며 이야기 나눠 볼까요?",
      inclusion: "소근육이 어려운 친구는 큰 재료를 쓰고 선생님과 함께 붙이거나, 색 · 자리를 고르는 것으로 참여해요.",
      levels: "만 4세: 자르기 · 붙이기 재료를 미리 준비해 두어요 · 만 6~7세: 재료와 방법을 스스로 골라요.",
    },
    share: {
      steps: [`마무리 질문 — “${body.closingQuestion}”`, d?.familyTitle ? `가정연계 안내 — ${d.familyTitle}` : body.homeConnection],
      stepsOrigin: d?.familyTitle ? "source" : "proposal",
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
    description: "물놀이 안전 약속에서 출발해 색 · 소리 · 명절 · 축제를 지나, 서로 다른 우리가 하나의 지구가 되는 마지막 여덟 번의 세계여행.",
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
