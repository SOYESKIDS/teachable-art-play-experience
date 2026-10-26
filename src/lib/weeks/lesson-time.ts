/**
 * 공개 서비스 운영 시간 — 화면이 말하는 수업 시간은 이 파일 한 곳에서만 정한다.
 *
 * ── 왜 한 곳인가 ─────────────────────────────────────────────────
 *
 * 전에는 주차 상세 「약 55~65분」, 플레이어 「약 60분」, 자료 「CORE 45분」,
 * 대시보드 「기본 35분」이 화면마다 달랐다. 교사는 어느 것이 오늘 수업 시간인지
 * 알 수 없었다. 이제 모든 화면이 아래 LESSON_TIME 을 읽는다.
 *
 * ★ 운영 기준은 기본 수업 35분 = 5 + 7 + 13 + 7 + 3 (24주 모두 같다).
 * ★ 워크북 · 작품 완성 · 가정연계는 35분 밖의 선택 확장활동이다.
 * ★ 원본 표기(자료 PDF 「CORE 45분」, 이전 가이드 「약 50~70분」)는 지우지 않는다.
 *   SOURCE_TIME_NOTE 로 출처 기록에만 남기고, 화면은 「현재 운영 시간 아님」을 함께 적는다.
 */

export const LESSON_STAGE_MINUTES = {
  open: 5,
  story: 7,
  move: 13,
  make: 7,
  share: 3,
} as const;

export type LessonStageKey = keyof typeof LESSON_STAGE_MINUTES;

export const LESSON_TOTAL_MINUTES = Object.values(LESSON_STAGE_MINUTES).reduce((sum, m) => sum + m, 0);

export const LESSON_TIME = {
  totalMinutes: LESSON_TOTAL_MINUTES,
  stages: LESSON_STAGE_MINUTES,
  /** 화면 문구 — 「기본 수업 35분」 */
  label: `기본 수업 ${LESSON_TOTAL_MINUTES}분`,
  /** 「5 + 7 + 13 + 7 + 3분」 */
  breakdown: `${Object.values(LESSON_STAGE_MINUTES).join(" + ")}분`,
  extensionNote: "워크북 · 작품 완성 · 가정연계는 기본 수업 밖의 선택 확장활동입니다.",
} as const;

/** 자료 PDF 의 수업시간 원문 (24주 공통 표기) */
export const PDF_DURATION_LABEL = "CORE 45분 (단축 운영 시 SHORT CLASS 30분)";

/** 원본 시간 표기를 화면에 적을 때 함께 붙이는 말 */
export const SOURCE_TIME_NOTE = "출처 기록 · 현재 운영 시간이 아닙니다";
