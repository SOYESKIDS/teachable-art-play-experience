/**
 * 주차별 원본 자료 대조표 — 읽기 전용.
 *
 * ── 이 파일이 하는 일 ─────────────────────────────────────────
 *
 * 받은 대시보드 자료 PDF 와 지금 사이트를 맞대어 본 결과를 적는다.
 * 2026-10-26 에 24주 모두 자료 PDF 기준으로 맞췄다. 그래서 두 가지로 나눠 적는다.
 *   open     — 아직 남은 확인 사항 (자료가 초안, 파일 없음 등)
 *   resolved — 그날 자료 기준으로 맞춘 것 (무엇이 바뀌었는지 교사가 알 수 있게)
 *
 * ★ 바꾸기 전 사이트 값은 docs/curriculum/snapshots/2026-10-26-before-pdf-sync/ 에 있다.
 * ★ 운영 시간(기본 수업 35분)과 자료의 「CORE 45분」은 일부러 다르다. 출처 기록으로
 *   남기고 운영 시간으로 오해하지 않게 적는다.
 * ★ 자료가 초안인 주차는 **공식 교안으로 확정된 내용이 아니다.**
 *
 * 생성 근거: 대시보드 자료 PDF 24개 (D:\소예키즈\마케팅\2026 유치원 영업전략\프로그램\대쉬보드 구성안)
 */

/** 자료 PDF 의 확정 정도 — 자료의 「데이터 출처」 칸을 그대로 따른다 */
export type SourceState = "confirmed" | "mixed" | "draft";

export const SOURCE_STATE_LABEL: Record<SourceState, string> = {
  confirmed: "자료 확정본",
  mixed: "확정 · 초안 혼재",
  draft: "초안 · 개편 후보",
};

export interface WeekSourceEntry {
  weekNo: number;
  state: SourceState;
  /** 개발 패키지 JSON 에 들어 있는 주차인지 (21~24 는 따로 받았다) */
  inDevPack: boolean;
  /** 자료에 그림 자리만 있고 실제 그림 파일은 없다 */
  assetSlotsOnly: boolean;
  /** 아직 남은 확인 사항 */
  open: readonly string[];
  /** 2026-10-26 자료 기준으로 맞춘 것 */
  resolved: readonly string[];
}

const MEDIA = "영상 · 음원 파일이 아직 없습니다";
const DRAFT = "자료가 초안이라 본사 검수가 필요합니다";
const PROPOSAL = "자료에 「미작성」으로 비어 있는 관찰 문항 · 목표를 교사용 제안으로 채웠습니다 (검수 전)";
const SOURCE_FILLED = "추출에서 빠졌던 관찰 문항 · 활동 목표 원문을 자료에서 다시 옮겼습니다";
const MEDIA_FILLED = "추출에서 빠졌던 음원 목록을 자료에서 다시 옮겼습니다";
const TIME = "수업 시간을 기본 수업 35분 하나로 통일했습니다 (자료 표기는 출처로 보존)";
const SPLIT = "주차 제목과 그림책 제목을 나눠 적었습니다";
const BOOK = "그림책 이름을 자료 기준으로 맞췄습니다";
const TOPIC = "수업 주제 · 제목 · 키워드 · 그림책 · 활동을 자료 기준으로 바꿨습니다";
const PART3 = "PART 이름을 자료 기준 「두근두근 세계여행」(개편 후보)으로 맞췄습니다";

export const WEEK_SOURCES: readonly WeekSourceEntry[] = [
  { weekNo: 1, state: "confirmed", inDevPack: true, assetSlotsOnly: true, open: [MEDIA, PROPOSAL], resolved: [TIME] },
  { weekNo: 2, state: "confirmed", inDevPack: true, assetSlotsOnly: true, open: [MEDIA, PROPOSAL], resolved: [TIME] },
  { weekNo: 3, state: "confirmed", inDevPack: true, assetSlotsOnly: true, open: [MEDIA, PROPOSAL], resolved: [SOURCE_FILLED, TIME] },
  { weekNo: 4, state: "confirmed", inDevPack: true, assetSlotsOnly: true, open: [MEDIA, PROPOSAL], resolved: [SPLIT, TIME] },
  { weekNo: 5, state: "confirmed", inDevPack: true, assetSlotsOnly: true, open: [MEDIA, "자료의 음원 목록이 4주차와 같습니다 — 곡 목록 확인 필요"], resolved: [MEDIA_FILLED, TIME] },
  { weekNo: 6, state: "confirmed", inDevPack: true, assetSlotsOnly: true, open: [MEDIA], resolved: [MEDIA_FILLED, TIME] },
  { weekNo: 7, state: "confirmed", inDevPack: true, assetSlotsOnly: true, open: [MEDIA], resolved: [SPLIT, SOURCE_FILLED, MEDIA_FILLED, TIME] },
  { weekNo: 8, state: "confirmed", inDevPack: true, assetSlotsOnly: true, open: [MEDIA], resolved: [SPLIT, MEDIA_FILLED, TIME] },
  { weekNo: 9, state: "mixed", inDevPack: true, assetSlotsOnly: true, open: [MEDIA, DRAFT], resolved: [BOOK, "대표 활동(봄바람 스카프) · 미술을 자료 기준으로 맞췄습니다", TIME] },
  { weekNo: 10, state: "mixed", inDevPack: true, assetSlotsOnly: true, open: [MEDIA, DRAFT], resolved: [BOOK, TIME] },
  { weekNo: 11, state: "mixed", inDevPack: true, assetSlotsOnly: true, open: [MEDIA, DRAFT], resolved: [BOOK, "성장 키워드를 자료 기준 「새로운 경험」으로 맞췄습니다", TIME] },
  { weekNo: 12, state: "mixed", inDevPack: true, assetSlotsOnly: true, open: [MEDIA, DRAFT], resolved: [BOOK, SOURCE_FILLED, TIME] },
  { weekNo: 13, state: "mixed", inDevPack: true, assetSlotsOnly: true, open: [MEDIA, DRAFT, "미술활동 제목이 자료에서 깨져 있어 설명 문장 「복을 담은 복주머니」로 적었습니다"], resolved: [BOOK, "대표 활동을 자료 기준 「달빛 강강술래」로 맞췄습니다", SOURCE_FILLED, TIME] },
  { weekNo: 14, state: "mixed", inDevPack: true, assetSlotsOnly: true, open: [MEDIA, DRAFT], resolved: [TOPIC, TIME] },
  { weekNo: 15, state: "mixed", inDevPack: true, assetSlotsOnly: true, open: [MEDIA, DRAFT], resolved: [SOURCE_FILLED, BOOK, "대표 활동(마음배지) · 결과물(온기벨)을 자료 기준으로 맞췄습니다", TIME] },
  { weekNo: 16, state: "mixed", inDevPack: true, assetSlotsOnly: true, open: [MEDIA, DRAFT], resolved: [BOOK, SOURCE_FILLED, TIME] },
  { weekNo: 17, state: "draft", inDevPack: true, assetSlotsOnly: true, open: [MEDIA, DRAFT], resolved: [TOPIC, PART3, TIME] },
  { weekNo: 18, state: "draft", inDevPack: true, assetSlotsOnly: true, open: [MEDIA, DRAFT], resolved: [TOPIC, PART3, "자료 제목은 그대로 두고 발문을 정답 없이 보이는 변화를 말하게 다듬었습니다", TIME] },
  { weekNo: 19, state: "draft", inDevPack: true, assetSlotsOnly: true, open: [MEDIA, DRAFT], resolved: [TOPIC, PART3, TIME] },
  { weekNo: 20, state: "draft", inDevPack: true, assetSlotsOnly: true, open: [MEDIA, DRAFT], resolved: [TOPIC, PART3, TIME] },
  { weekNo: 21, state: "draft", inDevPack: false, assetSlotsOnly: true, open: [MEDIA, DRAFT], resolved: [TOPIC, PART3, TIME] },
  { weekNo: 22, state: "draft", inDevPack: false, assetSlotsOnly: true, open: [MEDIA, DRAFT], resolved: [TOPIC, PART3, TIME] },
  { weekNo: 23, state: "draft", inDevPack: false, assetSlotsOnly: true, open: [MEDIA, DRAFT], resolved: [TOPIC, PART3, TIME] },
  { weekNo: 24, state: "draft", inDevPack: false, assetSlotsOnly: true, open: [MEDIA, DRAFT], resolved: [TOPIC, PART3, TIME] },
];

export function weekSource(weekNo: number): WeekSourceEntry | null {
  return WEEK_SOURCES.find((w) => w.weekNo === weekNo) ?? null;
}

/**
 * 주차 상세 맨 위 배지 — 자료 확정본(1~8주차)만 「공식 교육과정」.
 * 나머지는 개편 후보다. 확정되지 않은 내용을 확정 교안처럼 보이게 하지 않는다.
 */
export function curriculumBadge(weekNo: number): string {
  return weekSource(weekNo)?.state === "confirmed" ? "공식 교육과정" : "개편 후보 · 검수 전";
}

/** 자료를 대조한 주차 수와 남은 확인 사항이 있는 주차 수 */
export const SOURCE_SUMMARY = {
  reviewed: WEEK_SOURCES.length,
  withOpenItems: WEEK_SOURCES.filter((w) => w.open.length > 0).length,
} as const;
