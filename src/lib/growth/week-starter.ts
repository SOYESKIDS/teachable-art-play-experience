import type { GrowthMetricCode, SupportLevelCode } from "@/lib/curriculum/taxonomies";
import type { DemoEvidence, DemoObservation } from "@/lib/growth/demo-analysis";

/** 성장 분석 체험이 받는 주차 자료 — 페이지(서버)가 lesson-engine 에서 만들어 넘긴다 */
export interface DemoWeek {
  weekNo: number;
  title: string;
  storybook: string;
  familyTitle: string | null;
  /** 대표활동 — items 는 그 활동에 연결된 관찰 문항 (lesson-engine) */
  activities: readonly { id: string; title: string; kind: "physical" | "art"; stage: string; items: readonly { item: string; indicators: readonly GrowthMetricCode[] }[] }[];
  items: readonly { item: string; indicators: readonly GrowthMetricCode[] }[];
  /** 관찰 문항 출처 — PDF 원문 · 교사용 제안 */
  itemsOrigin: "source" | "edited" | "proposal" | "review";
  /** PDF 부모님께 드리는 안내 · 성장기록 예시 (원문) */
  parentNotice: readonly string[];
  kidsnote: string | null;
}

/** 가상 원아 기록이 이어지는 단계 — 같은 원아가 활동마다 조금씩 다른 도움 방식으로 참여한 가상 장면 */
const STARTER_SUPPORT: readonly SupportLevelCode[] = ["with_teacher", "after_modeling", "independent"];

/**
 * 주차를 고르면 그 주차의 대표활동 · 관찰 문항으로만 만든 가상 기록에서 시작한다.
 * ★ 다른 주차의 기록이 남지 않는다. 문장은 「가상 문장」이며 사실 기록이 아니다.
 */
export function weekStarter(w: DemoWeek): { observations: DemoObservation[]; evidence: DemoEvidence[] } {
  const evidence: DemoEvidence[] = [];
  const observations = w.activities.slice(0, 3).map((a, i) => {
    const pool = a.items.length ? a.items : w.items;
    const it = pool.find((x) => x.indicators.length) ?? pool[0];
    const evId = `ev-${w.weekNo}-${i + 1}`;
    if (a.kind === "art") evidence.push({ id: evId, kind: "artwork", caption: `가상 작품 설명 — 「${a.title}」 완성 작품 (실제 사진 아님)` });
    return {
      id: `obs-${w.weekNo}-${i + 1}`, weekNo: w.weekNo, activityId: a.id, activityTitle: a.title, stageKey: a.stage,
      item: it?.item ?? "", indicator: it?.indicators[0] ?? null,
      teacherNote: i === 0 ? `「${a.title}」에서 친구를 본 뒤 따라 해 보았다.` : `「${a.title}」을 처음부터 끝까지 이어 갔다.`,
      support: STARTER_SUPPORT[i % STARTER_SUPPORT.length], evidenceIds: a.kind === "art" ? [evId] : [],
      observedAt: "가상 수업 중", observer: "가상 담임교사",
    };
  });
  return { observations, evidence };
}
