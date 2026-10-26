import type { Sourced, TextOrigin } from "./types";

/**
 * 수업 확인 목록 · 미디어 상태의 라벨과 형태 — 교실 플레이어(클라이언트)가 자료 PDF 데이터 전체를
 * 싣지 않고 쓸 수 있게 따로 둔다. 목록을 만드는 함수는 lesson-support.ts.
 */

/**
 * 안전 안내의 출처.
 * 2026-10-26 측정 — 24주 자료 PDF 원문에 안전 유의사항 항목이 따로 없고, 화면의 안전 문장 50줄 가운데
 * 원문 그대로인 줄이 0이다 (17주차는 주제 자체가 물놀이 안전이지만 문장은 원문과 다르다).
 * 그래서 교사용 제안(본사 검수 전)으로 밝힌다.
 */
export const SAFETY_ORIGIN: TextOrigin = "proposal";

/** 교실 플레이어 「오늘의 준비물」 — 자료 구성품 · 준비물에서 35분 수업에 쓰는 것을 골라 줄인 목록 */
export const MATERIALS_ORIGIN: TextOrigin = "edited";

/** 체크 상태 안내 — 체크가 있는 모든 화면에 같은 문구 */
export const CHECK_STATE_NOTE = "체크 표시는 이 화면에서만 잠시 보이고, 새로고침하면 사라집니다. 어디에도 저장하지 않아요.";

export interface CheckGroup {
  key: string;
  label: string;
  items: readonly Sourced[];
}

export type MediaState = "ready" | "listed" | "pending";

export const MEDIA_STATE_LABEL: Record<MediaState, string> = {
  ready: "있음",
  listed: "목록만 · 파일 준비 중",
  pending: "자료 준비 중",
};

export interface MediaRow {
  key: string;
  label: string;
  state: MediaState;
  detail: string;
}
