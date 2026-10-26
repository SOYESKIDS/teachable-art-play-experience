/**
 * 공개 체험(/experience) 데이터 타입.
 *
 * ★ 이 폴더의 데이터는 **공개 데모 전용**이다. DB 를 읽지 않고, 어떤 서버 쿼리도
 *   부르지 않는다. 실제 기관 · 원아 · 보호자 정보는 여기에 들어오지 않는다.
 *
 * ★ 출처를 세 갈래로 나눈다. 화면은 이 값을 보고 안내 문구를 붙인다.
 *   official   — 공식 24주 지도에 이미 공개된 값 (주차명 · 성장 키워드 · 핵심 메시지 ·
 *                수업 시간 · 대표 활동 · 결과물). `src/lib/weeks/week-index.ts` 가 단일 출처다.
 *   adapted    — 공식 교사용 가이드의 수업 흐름을 체험용으로 짧게 재구성 (본사 검수 전)
 *   demo_draft — 체험용으로 새로 쓴 임시 구성. 정식 교안이 아니다.
 */
export type ExperienceContentStatus = "official" | "adapted" | "demo_draft";

export const CONTENT_STATUS_LABEL: Record<ExperienceContentStatus, string> = {
  official: "공식 교육과정",
  // 1~8 · 10~12 · 16주차는 이전 공식 가이드, 9 · 13~15 · 17~24주차는 자료 PDF 가 근거다 — 둘을 함께 부르는 말
  adapted: "근거 자료 기반 체험 구성 · 검수 전",
  demo_draft: "체험용 구성 · 정식 교안 확정 전",
};

/**
 * 수업 진행 단계.
 *
 * ★ `open` 은 30~40분 기본 수업을 만들며 더했다. 공식 가이드 1~16주차의
 *   「도입 5분」이 원래 있던 단계인데 화면에는 빠져 있었다.
 * ★ `explore` 는 기본 수업 순서에서 빠졌다. 내용은 버리지 않고 `move` 단계의
 *   안내에 함께 붙인다 — 몸과 감각으로 탐색하는 하나의 시간으로 묶는다.
 */
export type StageKey = "open" | "story" | "move" | "explore" | "make" | "share";

export const STAGE_LABEL: Record<StageKey, string> = {
  open: "이야기 열기",
  story: "그림책 만나기",
  // 「몸·감각으로 탐색」의 가운데 점과 「짧은」의 첫 글자는 제목 글꼴에 없다.
  // 한 제목이 두 글꼴로 갈라져 보이므로 뜻이 같은 다른 말을 쓴다.
  move: "몸과 감각으로 탐색",
  explore: "탐색하기",
  make: "예술로 표현하기",
  share: "나누고 정리",
};

/** 기본 수업에 실제로 쓰는 다섯 단계 (explore 는 move 안으로 들어간다) */
export const CORE_STAGE_ORDER: readonly StageKey[] = ["open", "story", "move", "make", "share"];

/**
 * 선택 확장활동 — 기본 수업을 마친 뒤 교사가 **골라서** 하는 것.
 *
 * ★ 기본 수업 완료를 막지 않는다. 하지 않아도 한 회차가 끝난다.
 * ★ 시간을 모르면 지어내지 않는다. estimatedMinutes 가 null 이면 화면은
 *   「검수 필요」라고 적는다.
 */
export interface OptionalExtension {
  key: string;
  title: string;
  activity: string;
  /** 공식 가이드에 분이 있으면 그 값, 없으면 null */
  estimatedMinutes: number | null;
  /** 그 분이 어디서 왔는지 (또는 왜 비어 있는지) */
  minutesNote: string;
  materials: string[];
  teacherPrompt: string | null;
  safetyNote: string | null;
  /** 기본 수업의 어느 단계에서 이어지는지 */
  linkToCore: string;
  /** 원본 출처 (이전 공식 가이드 또는 자료 PDF) */
  source: string;
  sourceStatus: "verified" | "pending_review";
}

/**
 * 교사용 문장의 출처 상태 — 대시보드가 항목마다 배지로 보인다.
 *
 *   source   — 자료 PDF 에 적힌 문장 그대로 (공식 원문)
 *   proposal — 자료가 비어 있어 교사용으로 새로 쓴 제안 (본사 검수 전)
 *   review   — 자료에도 제안에도 없어 검수가 필요한 자리
 */
export type TextOrigin = "source" | "proposal" | "review";

export const TEXT_ORIGIN_LABEL: Record<TextOrigin, string> = {
  source: "공식 원문",
  proposal: "교사용 제안",
  review: "검수 필요",
};

/**
 * 수업 시간 — 운영 기준 하나 + 출처 기록.
 *
 * ★ 화면이 「오늘 수업 시간」으로 말하는 값은 coreMinutes 하나다 (lesson-time.ts).
 * ★ 원본 표기 두 가지는 지우지 않고 출처 기록으로만 들고 있다.
 */
export interface LessonDuration {
  /** 기본 수업 단계 합 — 24주 모두 LESSON_TIME.totalMinutes (35) */
  coreMinutes: number;
  /** 자료 PDF 의 시간 원문 (예: CORE 45분) */
  pdfDurationLabel: string;
  /** 이전 공식 가이드의 권장 시간 원문. 그 가이드가 지금과 다른 수업이면 null */
  legacyGuideDurationLabel: string | null;
}

export type MotifKey =
  | "school" | "medal" | "heart" | "seed" | "flower" | "house" | "butterfly" | "forest"
  | "blossom" | "bug" | "plane" | "leaf" | "moon" | "chat" | "bell" | "seasons"
  | "paint" | "water" | "drum" | "tomato" | "balloon" | "pumpkin" | "gift" | "globe"
  | "snow" | "feast";

export type CharacterKey = "pupu" | "bukgeuki" | "cat" | "maru" | "ubi" | "ella";

export interface ExperienceImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ClassStage {
  key: StageKey;
  title: string;
  /** 교실 화면에 크게 띄우는 한 줄 (아이들이 보는 글) */
  childLine: string;
  /** 교사용 한 문장 활동 안내 */
  guide: string;
  /** 교사 발문 */
  teacherQuestion: string;
  minutes: number;
}

/** 공식 지도 메타 — week-index.ts 에서 그대로 가져온다 */
export interface OfficialWeekMeta {
  weekNo: number;
  partNo: 1 | 2 | 3;
  /** 주차 제목 */
  title: string;
  /** 그림책 제목 — 주차 제목과 다를 수 있다 */
  storybook: string;
  growthKeyword: string;
  coreMessage: string;
  activitySummary: string;
  /** 공식 지도에 비어 있으면 null — 화면은 대체하지 않고 "정리 중"으로 둔다 */
  outcome: string | null;
  themeColor: string;
}

/** 체험용 본문 — 손으로 쓴 데이터 (demo-lessons.ts) */
export interface DemoLessonBody {
  weekNo: number;
  status: Exclude<ExperienceContentStatus, "official">;
  motif: MotifKey;
  character: CharacterKey;
  goal: string;
  coreExperiences: string[];
  /** 누리과정 5개 영역 공식 명칭만 (taxonomies.ts NURI_AREA_LABEL) */
  nuriAreas: string[];
  /** 승인된 SOYE KIDS 핵심경험만 (taxonomies.ts APPROVED_SOYE_CORE_EXPERIENCES) */
  soyeCoreExperiences: string[];
  materials: string[];
  story: string;
  movement: string;
  music: string;
  explore: string;
  art: string;
  teacherQuestions: string[];
  observationPoints: string[];
  homeConnection: string;
  safety: string[];
  /**
   * 각 단계의 교실 화면 문장.
   *
   * ★ `open` 은 여기 없다. 「이야기 열기」의 문장은 공식 가이드의 도입 제목에서
   *   가져온다 (official-plan.ts introTitle). 손으로 지어내지 않는다.
   */
  childLines: Record<Exclude<StageKey, "open">, string>;
  /** 마무리 질문 */
  closingQuestion: string;
}

export interface ExperienceWeek extends OfficialWeekMeta {
  body: DemoLessonBody;
  /** 기본 수업 다섯 단계 (합 = duration.coreMinutes) */
  stages: ClassStage[];
  /** 선택 확장활동 — 기본 수업 뒤에 고르는 것 */
  extensions: OptionalExtension[];
  duration: LessonDuration;
  image: ExperienceImage | null;
  /**
   * 교사용 관찰 문항 — 대시보드 · 주차 상세 · 교실 플레이어가 같은 목록을 쓴다.
   * 자료 원문이 있으면 원문(source), 자료가 「미작성」이면 교사용 제안(proposal).
   */
  teacherObservations: { items: readonly string[]; origin: TextOrigin };
  /** 기본 수업 합계. duration.coreMinutes 와 같다 */
  totalMinutes: number;
}

export interface ExperiencePart {
  partNo: 1 | 2 | 3;
  title: string;
  nameProvisional: boolean;
  tagline: string;
  description: string;
  weekFrom: number;
  weekTo: number;
  tone: "mint" | "sky" | "pink";
  character: CharacterKey;
}
