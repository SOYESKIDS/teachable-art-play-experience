import type { StageKey, Sourced } from "../types";
import { isOfficialGuideWeek } from "../teacher-dashboard/week-dashboards";

/**
 * 35분 순서와 자료 PDF 활동 순서가 맞지 않는 주차 — 교사가 수업 중에 막히지 않게 미리 알린다.
 *
 * ★ 기본 수업은 「신체 · 감각(13분) → 예술 표현(7분)」 순서인데, 자료의 신체활동 단계가
 *   예술 표현에서 **만들 결과물을 이미 쓰는** 주차가 있다 (2026-10-27 24주 전수 확인 — 4 · 11 · 22 · 24주).
 * ★ 해결 방법은 교사용 제안이다 (본사 검수 전). 자료 PDF 의 활동 · 단계는 지우지도 바꾸지도 않는다.
 */
export interface SequenceNote {
  weekNo: number;
  stage: StageKey;
  /** 자료 PDF 원문 — 걸리는 단계 */
  conflict: Sourced;
  /** 어떻게 운영할지 — 교사용 제안 */
  resolution: Sourced;
}

export const SEQUENCE_NOTES: readonly SequenceNote[] = [
  {
    weekNo: 4,
    stage: "move",
    conflict: { text: "마라카스 꺼내기 — 내가 만든 마라카스를 꺼내요.", origin: "source" },
    resolution: {
      text: "마라카스는 4단계(예술 표현)에서 만들어요. 3단계에서는 씨앗을 살펴보고 빈 통 · 선생님 견본으로 소리를 비교하며 리듬을 익히고, 완성한 마라카스로 하는 합주는 5단계 나누기에서 짧게 해요. 지난 시간에 만든 마라카스가 있으면 3단계에서 바로 써요.",
      origin: "proposal",
    },
  },
  {
    weekNo: 11,
    stage: "move",
    conflict: { text: "여권을 보여주세요! — 내가 만든 여권을 들고 탑승 줄에 서요. · 찰칵! 여행 사진 — 꽃목걸이를 걸고 친구들과 포즈를 취해요.", origin: "source" },
    resolution: {
      text: "여권은 워크북 「나의 여권 & 탑승권」으로 미리 만들어 두거나, 없으면 선생님이 준비한 탑승권 카드로 대신해요. 꽃목걸이는 4단계에서 만들므로 ‘찰칵! 여행 사진’은 5단계 나누기에서 해요.",
      origin: "proposal",
    },
  },
  {
    weekNo: 22,
    stage: "move",
    conflict: { text: "변신하고 입장! — 직접 만든 가면을 쓰거나 들고 파티장에 들어가요.", origin: "source" },
    resolution: {
      text: "가면은 4단계 장식 만들기(가랜드 · 호박 랜턴 · 가면 중 고르기)에서 만들어요. 3단계 입장은 맨손으로 하고, 가면을 고른 친구는 5단계 나누기에서 가면을 들고 다시 인사해요. 가면을 쓰기 싫어하면 들고만 있어도 괜찮아요.",
      origin: "proposal",
    },
  },
  {
    weekNo: 24,
    stage: "move",
    conflict: { text: "내 조각을 들고 모여요 — 각자 꾸민 지구 조각을 들고 가운데로 모여요. · 우리 지구가 완성! — 조각을 맞춰 대형 지구를 완성하고, 다 함께 손을 잡고 둘러서요.", origin: "source" },
    resolution: {
      text: "지구 조각은 4단계(우리 지구 조각 꾸미기)에서 꾸며요. 3단계에서는 내 별 소개 · 같은 점 다른 점 찾기까지 하고, 빈 조각(꾸미기 전)을 들고 모이는 자리만 익혀요. 꾸민 조각을 맞춰 지구를 완성하고 손잡고 둘러서는 것은 5단계 나누기에서 해요.",
      origin: "proposal",
    },
  },
];

export function sequenceNotes(weekNo: number): readonly SequenceNote[] {
  // 14 · 17~24주는 공식 가이드 기준 수업이다 — 22 · 24주 메모는 자료 PDF(다른 주제) 활동 순서에 붙인 것이라 쓰지 않는다
  if (isOfficialGuideWeek(weekNo)) return [];
  return SEQUENCE_NOTES.filter((x) => x.weekNo === weekNo);
}
