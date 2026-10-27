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
}

export type StageExtras = Partial<Record<StageKey, StageExtra>>;
