import type { MediaState } from "../lesson-labels";
import type { Sourced, StageKey } from "../types";

/**
 * 교실 플레이어가 단계마다 더 보여 주는 것 — 페이지(서버)가 만들어 넘긴다.
 * ★ 타입만 둔다. 만드는 함수(buildStageExtras)는 자료 PDF 데이터 전체를 읽으므로 서버 쪽 파일(stage-extras-build.ts)에 있다.
 */
export interface StageExtra {
  /** 교실 화면 「오늘 할 것」 — 이야기 열기에서만 */
  chips: readonly string[];
  assets: readonly { id: string; label: string; state: MediaState; fallback: string | null }[];
  observable: readonly { item: string; indicators: readonly string[] }[];
  sequence: { conflict: Sourced; resolution: Sourced } | null;
  /** 오늘의 수업 목표 (자료 원문 → 교사용 제안 → 주차 핵심 문장) */
  goal: Sourced | null;
  /** 이 단계 PDF 활동 설명 — 신체활동 · 미술활동 소개 문장 */
  leads: readonly { title: string; lead: Sourced }[];
  /** 단계 메모 (PDF 원문 칸) — 몸으로 놀기: 교구 활용 · 만들기: 활용 방법 · 예시 · TIP · 나누고 정리: 정리 방법 · 가정연계 · 안내 */
  wrapUp: readonly { label: string; item: Sourced }[];
  /** 이 단계에서 더 지킬 것 (촬영 등) — 교사용 제안 */
  extraCautions: readonly Sourced[];
}

export type StageExtras = Partial<Record<StageKey, StageExtra>>;
