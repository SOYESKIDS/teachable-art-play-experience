import type { ExperienceWeek } from "../types";
import { buildLessonPlan, indicatorName } from "./plan";
import type { StageExtras } from "./stage-extras";

/** 실행형 수업 데이터(plan)에서 플레이어 단계별 추가 정보만 골라 낸다 */
export function buildStageExtras(week: ExperienceWeek): StageExtras {
  const plan = buildLessonPlan(week);
  const byId = new Map(plan.mediaAssets.map((a) => [a.id, a]));
  const out: StageExtras = {};
  for (const s of plan.lessonStages) {
    out[s.key] = {
      chips: s.key === "open" ? s.classroom.chips : [],
      assets: s.teacherAssetIds.map((id) => {
        const a = byId.get(id)!;
        return { id: a.id, label: a.label, state: a.state, fallback: a.fallback?.text ?? null };
      }),
      observable: s.observable.filter((o) => o.indicators.length).map((o) => ({ item: o.item, indicators: o.indicators.map(indicatorName) })),
      sequence: s.sequenceNote ? { conflict: s.sequenceNote.conflict, resolution: s.sequenceNote.resolution } : null,
    };
  }
  return out;
}
