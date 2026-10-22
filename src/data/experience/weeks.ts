import { WEEK_INDEX } from "@/lib/weeks/week-index";
import { PARTS } from "@/lib/weeks/week-types";
import { DEMO_LESSONS } from "./demo-lessons";
import { WEEK_MEDIA } from "./media";
import { officialPlan, type OfficialWeekPlan } from "./official-plan";
import {
  CORE_MIN_MINUTES,
  CORE_MAX_MINUTES,
} from "./official-plan";
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
 * 공개 체험 24주 — 공식 지도 메타 + 체험용 본문.
 *
 * ★ 공식 값(주차명 · 성장 키워드 · 핵심 메시지 · 수업 시간 · 대표 활동 · 결과물 · 색)은
 *   week-index.ts 에서 읽기만 한다. 여기서 고치지 않는다.
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
 * ── 무엇이 달라졌나 ──────────────────────────────────────────────
 *
 * 전에는 총시간을 고정 가중치로 나눠 단계별 분을 **계산**했다. 공식 가이드의
 * 분이 아니었다. 이제는 official-plan.ts 가 주차마다 정한 값을 그대로 쓴다.
 * 그 값은 공식 시간표에서 어느 활동이 길었는지를 보고 줄인 것이다.
 *
 * ★ 합은 언제나 30~40분 안이다 (권장 35분). 화면이 말하는 시간과 단계 합이
 *   어긋나면 교사가 수업 중에 시간을 잘못 잡는다.
 * ★ 「이야기 열기」 문장은 공식 가이드의 도입 제목을 쓴다. 가이드에 도입이
 *   없는 17~24주차는 공식 지도의 핵심 메시지로 대신하고 임시 편성으로 적는다.
 */
function buildStages(body: DemoLessonBody, meta: OfficialWeekMeta, plan: OfficialWeekPlan): ClassStage[] {
  // 공식 도입 제목은 제목 글꼴 서브셋이 못 그리는 주차가 많아 큰 글씨로 쓰지 않는다.
  // 원문은 버리지 않고 바로 아래 교사 안내에 그대로 남긴다.
  const openLine = "오늘은 무엇을 만날까요?";
  const childLine: Record<StageKey, string> = { ...body.childLines, open: openLine };
  const guide: Record<StageKey, string> = {
    open: plan.introTitle
      ? `공식 가이드 도입 — ${plan.introTitle}`
      : `${meta.coreMessage} (도입이 공식 가이드에 없어 임시로 만든 문장입니다)`,
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
  const minutes: Record<StageKey, number> = { ...plan.core, explore: 0 };
  return CORE_STAGE_ORDER.map((key) => ({
    key,
    title: STAGE_LABEL[key],
    childLine: childLine[key],
    guide: guide[key],
    teacherQuestion: question[key],
    minutes: minutes[key],
  }));
}

/**
 * 선택 확장활동을 만든다.
 *
 * ★ 공식 시간표에서 기본 수업 밖으로 나간 단계를 그대로 쓴다. 시간도 가이드의
 *   분이다. 공식 시간표가 없는 17~24주차는 분을 비우고 「검수 필요」로 둔다 —
 *   모르는 시간을 숫자로 적지 않는다.
 * ★ 가정연계는 어느 주차에나 있지만 원에서 쓰는 시간이 가이드에 없다. 그래서
 *   분을 비운다.
 */
function buildExtensions(body: DemoLessonBody, plan: OfficialWeekPlan): OptionalExtension[] {
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
    growthKeyword: w.growthKeyword,
    coreMessage: w.coreMessage,
    durationLabel: w.durationLabel,
    activitySummary: w.activitySummary,
    outcome: w.outcome && w.outcome.trim() !== "" ? w.outcome : null,
    themeColor: w.themeColor,
  };
}

export const EXPERIENCE_WEEKS: ExperienceWeek[] = DEMO_LESSONS.map((body) => {
  const meta = officialMeta(body.weekNo);
  const plan = officialPlan(body.weekNo);
  if (!plan) throw new Error(`official-plan 에 ${body.weekNo}주차가 없다`);

  const stages = buildStages(body, meta, plan);
  // 화면이 말하는 시간과 단계 합이 어긋나면 교사가 수업 중에 시간을 잘못 잡는다
  const totalMinutes = stages.reduce((sum, st) => sum + st.minutes, 0);
  const duration: LessonDuration = {
    coreMin: CORE_MIN_MINUTES,
    coreMax: CORE_MAX_MINUTES,
    coreRecommended: totalMinutes,
    originalDurationLabel: meta.durationLabel,
    sourceStatus: plan.sourceStatus,
  };

  return {
    ...meta,
    body,
    stages,
    extensions: buildExtensions(body, plan),
    duration,
    image: WEEK_MEDIA[body.weekNo] ?? null,
    totalMinutes,
  };
}).sort((a, b) => a.weekNo - b.weekNo);

export function experienceWeek(weekNo: number): ExperienceWeek | null {
  return EXPERIENCE_WEEKS.find((w) => w.weekNo === weekNo) ?? null;
}

export function weeksInPart(partNo: number): ExperienceWeek[] {
  return EXPERIENCE_WEEKS.filter((w) => w.partNo === partNo);
}

/** 대표 체험 주차 — 4주차 《소예의 씨앗》 */
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
    description: "색 · 물 · 소리 · 하늘, 그리고 세계의 축제로 넓어지는 마지막 여덟 번의 탐험.",
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
