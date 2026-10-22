/**
 * 주차별 원본 자료 대조표 — 읽기 전용.
 *
 * ── 이 파일이 하는 일 ─────────────────────────────────────────
 *
 * 받은 대시보드 자료와 지금 사이트의 내용을 맞대어 보고, **다른 점이 무엇인지만**
 * 적어 둔다. 사이트의 주차명 · 키워드 · 수업 내용을 이 파일이 바꾸지 않는다.
 *
 * ★ 원본 자료의 제목은 여기 담지 않는다. 두 가지 이유다.
 *   하나, 제목을 바꾸는 것은 승인 전까지 보류다.
 *   둘, 원본 제목 일부에 제목 글꼴이 그리지 못하는 글자가 있다. 화면에 넣으면
 *   한 줄이 두 글꼴로 갈라진다. 원문 그대로는 docs/curriculum 의 대조표에 있다.
 * ★ 자료에 적힌 시간(CORE 45분)과 이 사이트의 기본 수업 35분은 서로 다르다.
 *   둘 중 하나로 덮어쓰지 않고 다르다는 사실만 남긴다.
 * ★ 자료가 초안이므로 **공식 교안으로 확정된 내용이 아니다.**
 *
 * 생성 근거: docs/curriculum-upgrade/.../curriculum-source-01-20.json
 *           + 21~24주차 자료 (따로 전달받음)
 */

/** 자료 출처 상태 */
export type SourceState = "source_pdf" | "needs_review" | "awaiting_source";

export const SOURCE_STATE_LABEL: Record<SourceState, string> = {
  source_pdf: "원본 PDF 있음",
  needs_review: "검수 필요",
  awaiting_source: "원본 자료 없음",
};

export interface WeekSourceEntry {
  weekNo: number;
  state: SourceState;
  /** 개발 패키지 JSON 에 들어 있는 주차인지 (21~24 는 따로 받았다) */
  inDevPack: boolean;
  /** 자료에 그림 자리만 있고 실제 그림 파일은 없다 */
  assetSlotsOnly: boolean;
  /** 사이트와 자료가 다른 점 — 분류만 적는다 */
  conflicts: readonly string[];
}

export const WEEK_SOURCES: readonly WeekSourceEntry[] = [
  { weekNo: 1, state: "source_pdf", inDevPack: true, assetSlotsOnly: true, conflicts: ["관찰 문항이 아직 없습니다", "활동 목표가 아직 없습니다", "영상·음원 주소가 없습니다"] },
  { weekNo: 2, state: "source_pdf", inDevPack: true, assetSlotsOnly: true, conflicts: ["관찰 문항이 아직 없습니다", "활동 목표가 아직 없습니다", "영상·음원 주소가 없습니다"] },
  { weekNo: 3, state: "source_pdf", inDevPack: true, assetSlotsOnly: true, conflicts: ["활동 목표가 아직 없습니다", "영상·음원 주소가 없습니다"] },
  { weekNo: 4, state: "source_pdf", inDevPack: true, assetSlotsOnly: true, conflicts: ["제목이 다릅니다", "활동 목표가 아직 없습니다", "영상·음원 주소가 없습니다"] },
  { weekNo: 5, state: "source_pdf", inDevPack: true, assetSlotsOnly: true, conflicts: ["영상·음원 주소가 없습니다"] },
  { weekNo: 6, state: "source_pdf", inDevPack: true, assetSlotsOnly: true, conflicts: ["영상·음원 주소가 없습니다"] },
  { weekNo: 7, state: "source_pdf", inDevPack: true, assetSlotsOnly: true, conflicts: ["제목이 다릅니다", "영상·음원 주소가 없습니다"] },
  { weekNo: 8, state: "source_pdf", inDevPack: true, assetSlotsOnly: true, conflicts: ["제목이 다릅니다", "영상·음원 주소가 없습니다"] },
  { weekNo: 9, state: "needs_review", inDevPack: true, assetSlotsOnly: true, conflicts: ["수업 시간 표기가 다릅니다", "영상·음원 주소가 없습니다"] },
  { weekNo: 10, state: "needs_review", inDevPack: true, assetSlotsOnly: true, conflicts: ["수업 시간 표기가 다릅니다", "영상·음원 주소가 없습니다"] },
  { weekNo: 11, state: "needs_review", inDevPack: true, assetSlotsOnly: true, conflicts: ["수업 시간 표기가 다릅니다", "영상·음원 주소가 없습니다", "성장 키워드가 다릅니다"] },
  { weekNo: 12, state: "needs_review", inDevPack: true, assetSlotsOnly: true, conflicts: ["수업 시간 표기가 다릅니다", "영상·음원 주소가 없습니다"] },
  { weekNo: 13, state: "needs_review", inDevPack: true, assetSlotsOnly: true, conflicts: ["수업 시간 표기가 다릅니다", "영상·음원 주소가 없습니다"] },
  { weekNo: 14, state: "needs_review", inDevPack: true, assetSlotsOnly: true, conflicts: ["제목이 다릅니다", "수업 시간 표기가 다릅니다", "영상·음원 주소가 없습니다", "성장 키워드가 다릅니다"] },
  { weekNo: 15, state: "needs_review", inDevPack: true, assetSlotsOnly: true, conflicts: ["수업 시간 표기가 다릅니다", "영상·음원 주소가 없습니다"] },
  { weekNo: 16, state: "needs_review", inDevPack: true, assetSlotsOnly: true, conflicts: ["수업 시간 표기가 다릅니다", "영상·음원 주소가 없습니다"] },
  { weekNo: 17, state: "needs_review", inDevPack: true, assetSlotsOnly: true, conflicts: ["제목이 다릅니다", "PART 이름이 다릅니다", "수업 주제가 다릅니다", "수업 시간 표기가 다릅니다", "원본이 초안 상태입니다", "영상·음원 주소가 없습니다", "성장 키워드가 다릅니다"] },
  { weekNo: 18, state: "needs_review", inDevPack: true, assetSlotsOnly: true, conflicts: ["제목이 다릅니다", "PART 이름이 다릅니다", "수업 주제가 다릅니다", "수업 시간 표기가 다릅니다", "원본이 초안 상태입니다", "영상·음원 주소가 없습니다", "성장 키워드가 다릅니다"] },
  { weekNo: 19, state: "needs_review", inDevPack: true, assetSlotsOnly: true, conflicts: ["제목이 다릅니다", "PART 이름이 다릅니다", "수업 시간 표기가 다릅니다", "원본이 초안 상태입니다", "영상·음원 주소가 없습니다", "성장 키워드가 다릅니다"] },
  { weekNo: 20, state: "needs_review", inDevPack: true, assetSlotsOnly: true, conflicts: ["제목이 다릅니다", "PART 이름이 다릅니다", "수업 주제가 다릅니다", "수업 시간 표기가 다릅니다", "원본이 초안 상태입니다", "영상·음원 주소가 없습니다", "성장 키워드가 다릅니다"] },
  { weekNo: 21, state: "source_pdf", inDevPack: false, assetSlotsOnly: true, conflicts: ["제목이 다릅니다", "수업 시간 표기가 다릅니다", "PART 이름이 다릅니다", "영상·음원 주소가 없습니다", "원본이 초안 상태입니다", "성장 키워드가 다릅니다"] },
  { weekNo: 22, state: "source_pdf", inDevPack: false, assetSlotsOnly: true, conflicts: ["제목이 다릅니다", "수업 시간 표기가 다릅니다", "PART 이름이 다릅니다", "영상·음원 주소가 없습니다", "원본이 초안 상태입니다", "성장 키워드가 다릅니다"] },
  { weekNo: 23, state: "source_pdf", inDevPack: false, assetSlotsOnly: true, conflicts: ["제목이 다릅니다", "수업 시간 표기가 다릅니다", "PART 이름이 다릅니다", "영상·음원 주소가 없습니다", "원본이 초안 상태입니다", "성장 키워드가 다릅니다"] },
  { weekNo: 24, state: "source_pdf", inDevPack: false, assetSlotsOnly: true, conflicts: ["제목이 다릅니다", "수업 시간 표기가 다릅니다", "PART 이름이 다릅니다", "영상·음원 주소가 없습니다", "원본이 초안 상태입니다", "성장 키워드가 다릅니다"] },
];

export function weekSource(weekNo: number): WeekSourceEntry | null {
  return WEEK_SOURCES.find((w) => w.weekNo === weekNo) ?? null;
}

/** 자료를 대조한 주차 수와 다른 점이 있는 주차 수 */
export const SOURCE_SUMMARY = {
  reviewed: WEEK_SOURCES.length,
  withConflicts: WEEK_SOURCES.filter((w) => w.conflicts.length > 0).length,
} as const;
