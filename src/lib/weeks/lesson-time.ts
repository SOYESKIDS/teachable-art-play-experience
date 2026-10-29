/**
 * 공개 서비스 운영 시간 — 화면이 말하는 수업 시간은 이 파일 한 곳에서만 정한다.
 *
 * ── 왜 한 곳인가 ─────────────────────────────────────────────────
 *
 * 전에는 주차 상세 「약 55~65분」, 플레이어 「약 60분」, 자료 「CORE 45분」,
 * 대시보드 「기본 35분」이 화면마다 달랐다. 교사는 어느 것이 오늘 수업 시간인지
 * 알 수 없었다. 이제 모든 화면이 아래 LESSON_TIME 을 읽는다.
 *
 * ★ 운영 기준은 기본 수업 45분이다 (2026-10-29 수정 지시 · 24주 모두 같다). 자료 PDF 의 「CORE 45분」과 같다.
 * ★ 단계별 분 배분은 수정 지시에 확정 값이 없다. 화면에는 단계 **순서만** 보이고 분 숫자는 보이지 않는다.
 *   아래 LESSON_STAGE_MINUTES 는 단계 합을 맞추는 내부 값이며 **임시 편집 배분 · 대표 승인 전**이다.
 * ★ 원본 표기(자료 PDF 「CORE 45분」, 이전 가이드 「약 50~70분」)는 지우지 않는다. 출처 기록으로 남긴다.
 */

/** 단계별 분 — 내부 값 · 임시 편집 배분 (대표 승인 전). 화면에 숫자로 보이지 않는다. 합 = 45 */
export const LESSON_STAGE_MINUTES = {
  open: 5,
  story: 10,
  move: 15,
  make: 10,
  share: 5,
} as const;

/** 단계 배분이 확정 값이 아님을 기록한다 (화면 · 문서가 확정처럼 쓰지 않게) */
export const LESSON_STAGE_MINUTES_STATUS = "임시 편집 배분 · 대표 승인 전" as const;

export type LessonStageKey = keyof typeof LESSON_STAGE_MINUTES;

export const LESSON_TOTAL_MINUTES = Object.values(LESSON_STAGE_MINUTES).reduce((sum, m) => sum + m, 0);

export const LESSON_TIME = {
  totalMinutes: LESSON_TOTAL_MINUTES,
  stages: LESSON_STAGE_MINUTES,
  /** 화면 문구 — 「기본 수업 45분」 */
  label: `기본 수업 ${LESSON_TOTAL_MINUTES}분`,
  /** 짧은 표기 — 「기본 45분」 */
  shortLabel: `기본 ${LESSON_TOTAL_MINUTES}분`,
  /** 운영 안내 — 매주 무엇을 잇는지 (단계 순서는 types.ts CORE_STAGE_FLOW) */
  connectNote: "동화책, 신체활동, 만들기, 관찰을 매주 연결합니다.",
} as const;

/** 자료 PDF 의 수업시간 원문 (24주 공통 표기) */
export const PDF_DURATION_LABEL = "CORE 45분 (단축 운영 시 SHORT CLASS 30분)";

/** 자료 PDF 시간 표기 옆에 붙이는 말 — 운영 기준과 같다 */
export const PDF_TIME_NOTE = "자료 PDF 원문 표기 · 운영 기준 기본 45분과 같습니다";

/** 이전 가이드 시간 표기를 화면에 적을 때 함께 붙이는 말 */
export const SOURCE_TIME_NOTE = "출처 기록 · 현재 운영 시간이 아닙니다";

/**
 * 30분 단축 운영 — 교사용 편집안 (본사 검수 전).
 * ★ 자료 PDF 의 「SHORT CLASS 30분」에는 단계별 시간이 없다. 아래 배분도 내부 값이며 화면에 분 숫자로 보이지 않는다.
 * ★ 줄어든 미술 마무리 · 워크북 · 가정연계는 지우지 않고 다음 시간으로 넘긴다.
 */
export const SHORT_STAGE_MINUTES = {
  open: 4,
  story: 6,
  move: 11,
  make: 6,
  share: 3,
} as const;

export const SHORT_TOTAL_MINUTES = Object.values(SHORT_STAGE_MINUTES).reduce((sum, m) => sum + m, 0);

export const SHORT_TIME = {
  totalMinutes: SHORT_TOTAL_MINUTES,
  label: `${SHORT_TOTAL_MINUTES}분 단축 운영`,
  note: "미술 작품 마무리 · 워크북 · 가정연계는 다음 시간으로 넘겨요.",
} as const;
