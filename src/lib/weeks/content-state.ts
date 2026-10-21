/**
 * 주차 콘텐츠 상태 — 공식 지도(week-index.ts)가 쓰는 타입만 남긴 공개 사이트용 사본.
 *
 * ★ 원본(teachable-art-play3)의 발행 판정 · 환경 판단 로직은 운영 SaaS 기능이라 가져오지 않는다.
 */
export type TranscriptionState = "pending" | "done";
export type PublicationState = "draft" | "in_review" | "published";

export interface ContentStatus {
  transcription: TranscriptionState;
  publication: PublicationState;
}
