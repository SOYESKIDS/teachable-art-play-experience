import type { ExperienceImage } from "./types";

/**
 * 체험 화면 사진 — 공개 체험 사이트에서는 쓰지 않는다 (2026-10-21).
 *
 * ★ 회사 제공 수업 장면 그림 · 사진은 외부 공개 사용권 증빙이 확인되지 않았다.
 *   그래서 이 저장소에는 사진 파일이 없고, 모든 그림은 자체 제작 SVG
 *   (HeroScene · WeekArt · Motif · Stickers · Doodles)로 그린다. 로고만 예외다.
 * ★ 사용권이 확인된 그림을 쓰게 되면 여기에 더하고 tests/public-security.test.mjs 의 허용 목록도 고친다.
 */
export const MEDIA: Record<string, ExperienceImage> = {};

/** 주차 전용 그림 — 없음. 24주 모두 주차 색 · 주제 그림(WeekArt)으로 그린다. */
export const WEEK_MEDIA: Partial<Record<number, ExperienceImage>> = {};
