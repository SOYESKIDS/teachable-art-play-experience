import { GROWTH_INDICATORS } from "../report";
import { SAFETY_ORIGIN } from "../lesson-labels";
import { gatherForWeek, pdfQuestions, weekDashboard } from "../teacher-dashboard/week-dashboards";
import { curriculumBadge } from "../teacher-dashboard/source-register";
import type { ExperienceWeek, Sourced, StageKey, TextOrigin } from "../types";
import { weekGoals } from "../lesson-support";
import { LESSON_TIME } from "@/lib/weeks/lesson-time";
import type { GrowthMetricCode } from "@/lib/curriculum/taxonomies";
import { physicalIndexOf, weekAssets, type LessonAsset } from "./assets";
import { activitySides, EVIDENCE_REQUIREMENTS, indicatorLinks, type IndicatorLink } from "./growth-mapping";
import { sequenceNotes, type SequenceNote } from "./sequence-notes";

/**
 * 24주 실행형 수업 데이터 — 「PDF 원문」과 「35분 수업 편집」을 나눠 담는다.
 *
 * ★ 새 내용을 만들지 않는다. 자료 PDF 데이터(week-dashboards) · 35분 단계(weeks) · 확인 목록(lesson-support) ·
 *   그림 자리(assets) · 지표 연결(growth-mapping)을 한 주차 단위로 모은다.
 * ★ 신체활동이 둘인 주차(7 · 9주)는 둘 다 담는다. 35분 밖 확장활동(워크북 · 작품 완성 · 가정연계)도 지우지 않는다.
 * ★ ID 규칙: 활동 `wN.physical0` · `wN.physical1` · `wN.art` · 단계 `wN.stage.open` … · 그림 자리는 PDF ID 그대로.
 */
export interface PlanActivity {
  id: string;
  kind: "physical" | "art";
  title: string;
  lead: string | null;
  /** PDF 원문 단계 */
  steps: readonly Sourced[];
  materials: readonly string[];
  tip: string | null;
  /** 35분 수업에서 이 활동을 하는 단계 */
  stage: StageKey;
  assetIds: readonly string[];
  /** 이 활동에서 볼 관찰 문항과 지표 (지표 연결은 교사용 제안) */
  observations: readonly IndicatorLink[];
  evidence: readonly { key: string; label: string; required: boolean }[];
  sequenceNote: SequenceNote | null;
}

export interface PlanStage {
  id: string;
  key: StageKey;
  title: string;
  minutes: number;
  /** 이 단계가 이어받는 PDF 활동 */
  activityIds: readonly string[];
  teacherSays: readonly Sourced[];
  teacherDoes: readonly Sourced[];
  childrenDo: readonly Sourced[];
  /** 교실 화면 — 아이들이 보는 큰 글씨 한 줄과 오늘 할 것 */
  classroom: { line: string; chips: readonly string[]; assetIds: readonly string[] };
  teacherAssetIds: readonly string[];
  materials: readonly string[];
  cautions: readonly Sourced[];
  observable: readonly IndicatorLink[];
  transition: Sourced | null;
  /** 이 단계 자료 가운데 파일이 실제로 있는 것 / 전체 */
  assetsReady: { ready: number; total: number };
  sequenceNote: SequenceNote | null;
}

export interface WeekLessonPlan {
  weekNo: number;
  weekTitle: string;
  storybook: { title: string; summary: string | null; message: string | null };
  learningGoals: readonly Sourced[];
  growthKeyword: string;
  lessonDuration: { coreMinutes: number; breakdown: string; pdfDurationLabel: string };
  lessonStages: readonly PlanStage[];
  physicalActivities: readonly PlanActivity[];
  artActivity: PlanActivity | null;
  workbookActivities: readonly { id: string; title: string; guide: string; origin: TextOrigin }[];
  kitAndMaterials: { kit: readonly string[]; org: readonly string[]; homeKit: readonly string[] };
  safetyGuidance: readonly Sourced[];
  teacherQuestions: readonly Sourced[];
  observationPoints: { items: readonly string[]; origin: TextOrigin };
  growthIndicatorMappings: readonly IndicatorLink[];
  familyActivity: { title: string | null; how: readonly string[]; talk: readonly string[] };
  crossWeekOutputs: { thisWeek: string | null; nextWeek: string | null; gather: readonly string[] };
  mediaAssets: readonly LessonAsset[];
  sourceReferences: readonly string[];
  reviewStatus: string;
  sequenceNotes: readonly SequenceNote[];
}

const src = (text: string): Sourced => ({ text, origin: "source" });
const INDICATOR_NAME = Object.fromEntries(GROWTH_INDICATORS.map((g) => [g.code, g.name])) as Record<GrowthMetricCode, string>;
export const indicatorName = (c: GrowthMetricCode) => INDICATOR_NAME[c];

export function buildLessonPlan(week: ExperienceWeek): WeekLessonPlan {
  const n = week.weekNo;
  const d = weekDashboard(n);
  const assets = weekAssets(n);
  const notes = sequenceNotes(n);
  const links = indicatorLinks(week.teacherObservations.items);
  const bodyLinks = links.filter((l) => activitySides(l.item).body);
  const makeLinks = links.filter((l) => activitySides(l.item).make);
  const assetIdsWhere = (f: (a: LessonAsset) => boolean) => assets.filter(f).map((a) => a.id);

  const physical: PlanActivity[] = [];
  if (d?.physicalTitle) {
    physical.push({
      id: `w${n}.physical0`, kind: "physical", title: d.physicalTitle, lead: d.physicalLead,
      steps: d.physicalSteps.map((s) => src(s.guide ? `${s.title} — ${s.guide}` : s.title)),
      materials: d.physicalMaterials, tip: d.activityTip, stage: "move",
      assetIds: assetIdsWhere((a) => physicalIndexOf(a.id) === 0),
      observations: bodyLinks, evidence: EVIDENCE_REQUIREMENTS.physical,
      sequenceNote: notes.find((x) => x.stage === "move") ?? null,
    });
  }
  if (d?.physical2) {
    physical.push({
      id: `w${n}.physical1`, kind: "physical", title: d.physical2.title, lead: d.physical2.lead,
      steps: d.physical2.steps.map((s) => src(`${s.title} — ${s.guide}`)),
      materials: d.physical2.materials, tip: d.physical2.tip, stage: "move",
      assetIds: assetIdsWhere((a) => physicalIndexOf(a.id) === 1),
      observations: bodyLinks, evidence: EVIDENCE_REQUIREMENTS.physical, sequenceNote: null,
    });
  }
  const art: PlanActivity | null = d?.artTitle
    ? {
        id: `w${n}.art`, kind: "art", title: d.artTitle, lead: d.artLead,
        steps: d.artSteps.map(src), materials: [...d.kitItems, ...d.orgItems], tip: null, stage: "make",
        assetIds: assetIdsWhere((a) => a.kind === "artExample"),
        observations: makeLinks, evidence: EVIDENCE_REQUIREMENTS.art, sequenceNote: null,
      }
    : null;

  const activitiesFor = (key: StageKey) => [...physical, ...(art ? [art] : [])].filter((a) => a.stage === key);
  const stageAssets = (key: StageKey) => assets.filter((a) => a.usedIn.includes(key));
  const stages: PlanStage[] = week.stages.map((s) => {
    const acts = activitiesFor(s.key);
    const sa = stageAssets(s.key);
    const chips =
      s.key === "open"
        ? [`그림책 《${week.storybook}》`, ...physical.map((p) => `몸놀이 「${p.title}」`), ...(art ? [`만들기 「${art.title}」`] : [])]
        : acts.map((a) => a.title);
    const observable =
      s.key === "move" ? bodyLinks : s.key === "make" ? makeLinks : s.key === "share" ? links.filter((l) => l.indicators.includes("self_explanation")) : [];
    return {
      id: `w${n}.stage.${s.key}`, key: s.key, title: s.title, minutes: s.minutes,
      activityIds: acts.map((a) => a.id),
      teacherSays: [{ text: s.teacherQuestion, origin: s.teacherQuestionOrigin }, ...(s.key === "open" ? [{ text: week.body.openLine, origin: "proposal" as const }] : [])],
      teacherDoes: [{ text: s.guide, origin: s.guideOrigin }, ...(s.tip ? [src(s.tip)] : [])],
      childrenDo: s.steps,
      classroom: { line: s.childLine, chips, assetIds: sa.filter((a) => a.kind === "storybookCover" || a.kind === "weekHero").map((a) => a.id) },
      teacherAssetIds: sa.map((a) => a.id),
      materials: s.materials,
      cautions: s.safety.map((text) => ({ text, origin: SAFETY_ORIGIN })),
      observable,
      transition: s.transition ? { text: s.transition, origin: "proposal" } : null,
      assetsReady: { ready: sa.filter((a) => a.state === "ready").length, total: sa.length },
      sequenceNote: notes.find((x) => x.stage === s.key) ?? null,
    };
  });

  return {
    weekNo: n,
    weekTitle: week.title,
    storybook: { title: week.storybook, summary: d?.storySummary ?? null, message: d?.storyMessage ?? null },
    learningGoals: weekGoals(week),
    growthKeyword: week.growthKeyword,
    lessonDuration: { coreMinutes: week.totalMinutes, breakdown: LESSON_TIME.breakdown, pdfDurationLabel: week.duration.pdfDurationLabel },
    lessonStages: stages,
    physicalActivities: physical,
    artActivity: art,
    workbookActivities: (d?.workbookSheets ?? []).map((w, i) => ({ id: `w${n}.workbook.worksheet.${i}`, title: w.title, guide: w.guide, origin: "source" as const })),
    kitAndMaterials: { kit: d?.kitItems ?? [], org: d?.orgItems ?? [], homeKit: d?.homeKitItems ?? [] },
    safetyGuidance: week.body.safety.map((text) => ({ text, origin: SAFETY_ORIGIN })),
    teacherQuestions: [...week.stages.map((s) => ({ text: s.teacherQuestion, origin: s.teacherQuestionOrigin })), ...pdfQuestions(n).map(src)],
    observationPoints: week.teacherObservations,
    growthIndicatorMappings: links,
    familyActivity: { title: d?.familyTitle ?? null, how: d?.familyHow ?? [], talk: d?.familyTalk ?? [] },
    crossWeekOutputs: { thisWeek: d?.artTitle ?? null, nextWeek: d?.crossWeek ?? null, gather: gatherForWeek(n) },
    mediaAssets: assets,
    sourceReferences: [`대쉬보드 구성안 ${String(n).padStart(2, "0")}주차 PDF`, n <= 20 ? `docs/curriculum-upgrade/TAP_Curriculum_Development_Pack/TeachAble_24Week_Dashboard_DevPack/source_text/week-${String(n).padStart(2, "0")}.txt` : `docs/curriculum-upgrade/dashboard-source-21-24/week-${n}.txt`],
    reviewStatus: curriculumBadge(n),
    sequenceNotes: notes,
  };
}

/* ── 연결 검사 — PDF 대표활동 → 플레이어 단계 → 자료 → 관찰 문항 → 성장지표 → 리포트 근거 ── */

export type ChainLink = "pdf" | "player" | "assets" | "observation" | "indicator" | "report";
export const CHAIN_LABEL: Record<ChainLink, string> = {
  pdf: "PDF 대표활동", player: "플레이어 단계", assets: "자료 자리", observation: "관찰 문항", indicator: "성장지표", report: "리포트 근거",
};

export interface ChainResult {
  activityId: string;
  title: string;
  links: Record<ChainLink, boolean>;
  complete: boolean;
  note: string | null;
}

export function connectionCheck(plan: WeekLessonPlan): readonly ChainResult[] {
  const squash = (s: string) => s.replace(/[\s·.,!?“”"'‘’()]/g, "");
  return [...plan.physicalActivities, ...(plan.artActivity ? [plan.artActivity] : [])].map((a) => {
    const stage = plan.lessonStages.find((s) => s.key === a.stage);
    const stageText = squash(JSON.stringify(stage?.childrenDo ?? []));
    // PDF 단계가 있으면 그 단계가 모두 플레이어에 있어야 한다. PDF 에 단계가 없으면(1주 미술) 단계가 있기만 하면 된다
    const playerOk = !!stage && (a.steps.length ? a.steps.every((x) => stageText.includes(squash(x.text))) : stage.childrenDo.length > 0);
    const mapped = a.observations.filter((o) => o.indicators.length > 0);
    const links: Record<ChainLink, boolean> = {
      pdf: !!a.title,
      player: playerOk,
      assets: a.assetIds.length > 0,
      observation: a.observations.length > 0,
      indicator: mapped.length > 0,
      report: mapped.length > 0 && a.evidence.some((e) => e.required),
    };
    return {
      activityId: a.id,
      title: a.title,
      links,
      complete: Object.values(links).every(Boolean),
      note: a.steps.length ? null : "PDF 에 만드는 순서가 없어 35분 체험 편집 문장으로 진행",
    };
  });
}
