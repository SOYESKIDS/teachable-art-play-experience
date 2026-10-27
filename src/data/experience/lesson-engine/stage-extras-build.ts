import type { ExperienceWeek } from "../types";
import { buildLessonPlan, indicatorName } from "./plan";
import { FILMING_NOTE, hasFilming } from "./prep-notes";
import { weekDashboard } from "../teacher-dashboard/week-dashboards";
import type { StageExtras } from "./stage-extras";

/** 실행형 수업 데이터(plan)에서 플레이어 단계별 추가 정보만 골라 낸다 */
export function buildStageExtras(week: ExperienceWeek): StageExtras {
  const plan = buildLessonPlan(week);
  const byId = new Map(plan.mediaAssets.map((a) => [a.id, a]));
  const out: StageExtras = {};
  const d = weekDashboard(week.weekNo);
  const goal = plan.learningGoals[0] ?? null;
  const filming = hasFilming(week.weekNo);
  for (const s of plan.lessonStages) {
    out[s.key] = {
      chips: s.key === "open" ? s.classroom.chips : [],
      assets: s.teacherAssetIds.map((id) => {
        const a = byId.get(id)!;
        return { id: a.id, label: a.label, state: a.state, fallback: a.fallback?.text ?? null };
      }),
      observable: s.observable.filter((o) => o.indicators.length).map((o) => ({ item: o.item, indicators: o.indicators.map(indicatorName) })),
      sequence: s.sequenceNote ? { conflict: s.sequenceNote.conflict, resolution: s.sequenceNote.resolution } : null,
      goal,
      leads:
        s.key === "move"
          ? plan.physicalActivities.filter((a) => a.lead).map((a) => ({ title: a.title, lead: { text: a.lead!, origin: "source" as const } }))
          : s.key === "make" && plan.artActivity?.lead
            ? [{ title: plan.artActivity.title, lead: { text: plan.artActivity.lead, origin: "source" as const } }]
            : [],
      wrapUp:
        s.key === "share"
          ? [
              { label: "정리", item: week.prep.cleanup },
              ...(d?.familyTitle ? [{ label: "가정연계", item: { text: d.familyTitle, origin: "source" as const } }] : []),
              ...(d?.parentNotice[0] ? [{ label: "부모 안내", item: { text: d.parentNotice[0], origin: "source" as const } }] : []),
            ]
          : [],
      extraCautions: s.key === "move" && filming ? [FILMING_NOTE] : [],
    };
  }
  return out;
}
