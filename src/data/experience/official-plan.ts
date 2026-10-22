/**
 * 공식 교사용 수업가이드(1~24주차 PDF)에서 뽑은 사실만 담는다.
 *
 * ── 이 파일이 있는 이유 ──────────────────────────────────────────
 *
 * 개편 전 화면의 단계별 분은 공식 값이 아니었다. 총시간을 고정 가중치로
 * 나눈 계산값이었다. 그래서 「공식 가이드에 이렇게 적혀 있다」와
 * 「체험용으로 이렇게 줄였다」를 구분할 수 없었다.
 *
 * ★ durationLabel · stages 는 가이드 원문 그대로다. 고치지 않는다.
 * ★ core 는 30~40분 기본 수업으로 **줄인 값**이다. 공식 시간이 아니다.
 * ★ 17~24주차는 가이드 5장이 「관찰 시간표」라 단계별 분이 원문에 없다.
 *   그래서 sourceStatus 가 pending_review 다 — 임시 편성이라는 뜻이다.
 *
 * 생성 근거: docs/curriculum/original-duration-baseline.md
 */

export type PlanSourceStatus = "verified" | "pending_review";

export interface OfficialStage {
  name: string;
  /** 가이드에 적힌 분. 범위면 min~max, 단일 값이면 둘이 같다 */
  min: number;
  max: number;
}

export interface OfficialExtensionSource {
  kind: "workbook" | "move_more" | "art_more";
  name: string;
  min: number;
  max: number;
}

export interface OfficialWeekPlan {
  weekNo: number;
  /** 공식 가이드 「권장 핵심수업 시간」 원문 */
  durationLabel: string;
  /** 공식 「권장 시간표」. 원문에 없으면 null */
  stages: OfficialStage[] | null;
  /** 30~40분 기본 수업으로 줄인 단계별 분 (합 35) */
  core: { open: number; story: number; move: number; make: number; share: number };
  /** 기본 수업에서 빠져 확장활동으로 가는 공식 단계 */
  extensionSources: OfficialExtensionSource[];
  /** 가이드에 도입 단계 제목이 있으면 그 문장 */
  introTitle: string | null;
  sourceStatus: PlanSourceStatus;
}

export const CORE_MIN_MINUTES = 30;
export const CORE_MAX_MINUTES = 40;
export const CORE_RECOMMENDED_MINUTES = 35;

export const OFFICIAL_PLAN: readonly OfficialWeekPlan[] = [
  {
    weekNo: 1,
    durationLabel: "약 50~60분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "탐험", min: 15, max: 15 }, { name: "이름표", min: 10, max: 10 }, { name: "워크북", min: 10, max: 10 }, { name: "마무리", min: 5, max: 5 }],
    core: { open: 5, story: 7, move: 12, make: 8, share: 3 },
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "탐험", min: 15, max: 15 }, { kind: "art_more", name: "이름표", min: 10, max: 10 }],
    introTitle: "오늘 처음 만난 것은 무엇일까?",
    sourceStatus: "verified",
  },
  {
    weekNo: 2,
    durationLabel: "약 55~65분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "도전 미션", min: 25, max: 25 }, { name: "용기 메달", min: 10, max: 15 }, { name: "마무리", min: 5, max: 10 }],
    core: { open: 5, story: 7, move: 14, make: 6, share: 3 },
    extensionSources: [{ kind: "move_more", name: "도전 미션", min: 25, max: 25 }, { kind: "art_more", name: "용기 메달", min: 10, max: 15 }],
    introTitle: "마루의 도전 상황 만나기",
    sourceStatus: "verified",
  },
  {
    weekNo: 3,
    durationLabel: "약 55~65분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "마음배달", min: 15, max: 20 }, { name: "워크북", min: 10, max: 10 }, { name: "팔찌 만들기", min: 10, max: 15 }, { name: "마무리", min: 5, max: 5 }],
    core: { open: 5, story: 7, move: 12, make: 8, share: 3 },
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "마음배달", min: 15, max: 20 }, { kind: "art_more", name: "팔찌 만들기", min: 10, max: 15 }],
    introTitle: "오늘 내 마음은 어떤 얼굴일까?",
    sourceStatus: "verified",
  },
  {
    weekNo: 4,
    durationLabel: "약 55~65분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "씨앗 탐험", min: 10, max: 15 }, { name: "마라카스 연주", min: 10, max: 10 }, { name: "워크북", min: 10, max: 10 }, { name: "만들기", min: 10, max: 15 }, { name: "마무리", min: 5, max: 5 }],
    core: { open: 5, story: 7, move: 13, make: 7, share: 3 },
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "씨앗 탐험", min: 10, max: 15 }, { kind: "move_more", name: "마라카스 연주", min: 10, max: 10 }, { kind: "art_more", name: "만들기", min: 10, max: 15 }],
    introTitle: "이 작은 것 안에 무엇이 있을까?",
    sourceStatus: "verified",
  },
  {
    weekNo: 5,
    durationLabel: "약 55~65분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "꽃놀이", min: 15, max: 15 }, { name: "워크북", min: 10, max: 10 }, { name: "나만의 꽃", min: 10, max: 15 }, { name: "마무리", min: 5, max: 5 }],
    core: { open: 5, story: 7, move: 12, make: 8, share: 3 },
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "꽃놀이", min: 15, max: 15 }, { kind: "art_more", name: "나만의 꽃", min: 10, max: 15 }],
    introTitle: "꽃들은 왜 모두 다르게 생겼을까?",
    sourceStatus: "verified",
  },
  {
    weekNo: 6,
    durationLabel: "약 60~70분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "신체활동", min: 15, max: 15 }, { name: "워크북", min: 10, max: 10 }, { name: "비밀기지", min: 15, max: 20 }, { name: "마무리", min: 5, max: 5 }],
    core: { open: 5, story: 7, move: 10, make: 10, share: 3 },
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "신체활동", min: 15, max: 15 }, { kind: "art_more", name: "비밀기지", min: 15, max: 20 }],
    introTitle: "혼자 하기 어려운 일은 어떻게 할까?",
    sourceStatus: "verified",
  },
  {
    weekNo: 7,
    durationLabel: "약 55~65분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "신체활동", min: 15, max: 15 }, { name: "워크북", min: 10, max: 10 }, { name: "미술", min: 10, max: 15 }, { name: "마무리", min: 5, max: 5 }],
    core: { open: 5, story: 7, move: 12, make: 8, share: 3 },
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "신체활동", min: 15, max: 15 }, { kind: "art_more", name: "미술", min: 10, max: 15 }],
    introTitle: "잡으려고 하면 왜 멀어질까?",
    sourceStatus: "verified",
  },
  {
    weekNo: 8,
    durationLabel: "약 55~65분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "공동활동", min: 20, max: 20 }, { name: "워크북", min: 10, max: 10 }, { name: "숲 이야기", min: 5, max: 10 }, { name: "마무리", min: 5, max: 5 }],
    core: { open: 5, story: 7, move: 15, make: 5, share: 3 },
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "공동활동", min: 20, max: 20 }, { kind: "art_more", name: "숲 이야기", min: 5, max: 10 }],
    introTitle: "우리 숲에는 무엇이 있었지?",
    sourceStatus: "verified",
  },
  {
    weekNo: 9,
    durationLabel: "약 60~70분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "꽃비 놀이", min: 20, max: 25 }, { name: "워크북", min: 10, max: 10 }, { name: "꽃다발", min: 15, max: 20 }, { name: "마무리", min: 5, max: 5 }],
    core: { open: 5, story: 7, move: 11, make: 9, share: 3 },
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "꽃비 놀이", min: 20, max: 25 }, { kind: "art_more", name: "꽃다발", min: 15, max: 20 }],
    introTitle: "아직 봄일까?",
    sourceStatus: "verified",
  },
  {
    weekNo: 10,
    durationLabel: "약 55~65분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "곤충 채집", min: 20, max: 25 }, { name: "워크북", min: 10, max: 10 }, { name: "마무리", min: 5, max: 10 }],
    core: { open: 5, story: 7, move: 15, make: 5, share: 3 },
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "곤충 채집", min: 20, max: 25 }],
    introTitle: "“앗 뜨거!” 여름의 단서 만나기",
    sourceStatus: "verified",
  },
  {
    weekNo: 11,
    durationLabel: "약 60~70분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "여행 놀이", min: 15, max: 20 }, { name: "훌라댄스", min: 15, max: 20 }, { name: "워크북·미술", min: 10, max: 15 }, { name: "마무리", min: 5, max: 5 }],
    core: { open: 5, story: 7, move: 15, make: 5, share: 3 },
    extensionSources: [{ kind: "workbook", name: "워크북·미술", min: 10, max: 15 }, { kind: "move_more", name: "여행 놀이", min: 15, max: 20 }, { kind: "move_more", name: "훌라댄스", min: 15, max: 20 }],
    introTitle: "여행을 떠나려면 무엇이 필요할까?",
    sourceStatus: "verified",
  },
  {
    weekNo: 12,
    durationLabel: "약 60~70분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "촉감놀이", min: 20, max: 25 }, { name: "워크북", min: 10, max: 10 }, { name: "허수아비 미술", min: 15, max: 20 }, { name: "마무리", min: 5, max: 5 }],
    core: { open: 5, story: 7, move: 11, make: 9, share: 3 },
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "촉감놀이", min: 20, max: 25 }, { kind: "art_more", name: "허수아비 미술", min: 15, max: 20 }],
    introTitle: "숲의 색이 달라졌어!",
    sourceStatus: "verified",
  },
  {
    weekNo: 13,
    durationLabel: "약 60~70분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "달빛 신체놀이", min: 20, max: 25 }, { name: "워크북", min: 10, max: 10 }, { name: "미술활동", min: 15, max: 20 }, { name: "마무리", min: 5, max: 5 }],
    core: { open: 5, story: 7, move: 11, make: 9, share: 3 },
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "달빛 신체놀이", min: 20, max: 25 }, { kind: "art_more", name: "미술활동", min: 15, max: 20 }],
    introTitle: null,
    sourceStatus: "verified",
  },
  {
    weekNo: 14,
    durationLabel: "약 60~70분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "몸으로 말해요", min: 20, max: 25 }, { name: "워크북", min: 10, max: 10 }, { name: "미술활동", min: 15, max: 20 }, { name: "마무리", min: 5, max: 5 }],
    core: { open: 5, story: 7, move: 11, make: 9, share: 3 },
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "몸으로 말해요", min: 20, max: 25 }, { kind: "art_more", name: "미술활동", min: 15, max: 20 }],
    introTitle: "말하지 않아도 알 수 있을까?",
    sourceStatus: "verified",
  },
  {
    weekNo: 15,
    durationLabel: "약 60~70분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "마음벨 놀이", min: 15, max: 20 }, { name: "워크북", min: 10, max: 10 }, { name: "미술·전달", min: 20, max: 25 }, { name: "마무리", min: 5, max: 5 }],
    core: { open: 5, story: 7, move: 9, make: 11, share: 3 },
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "마음벨 놀이", min: 15, max: 20 }, { kind: "art_more", name: "미술·전달", min: 20, max: 25 }],
    introTitle: "따뜻한 마음은 어떤 모습일까?",
    sourceStatus: "verified",
  },
  {
    weekNo: 16,
    durationLabel: "약 55~65분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "사계절 사진 회상", min: 15, max: 20 }, { name: "영상편지", min: 10, max: 15 }, { name: "워크북", min: 10, max: 15 }, { name: "마무리", min: 5, max: 5 }],
    core: { open: 5, story: 7, move: 12, make: 8, share: 3 },
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 15 }, { kind: "move_more", name: "사계절 사진 회상", min: 15, max: 20 }, { kind: "art_more", name: "영상편지", min: 10, max: 15 }],
    introTitle: "이 사진, 기억나?",
    sourceStatus: "verified",
  },
  {
    weekNo: 17,
    durationLabel: "약 60~70분",
    stages: null,
    core: { open: 5, story: 7, move: 13, make: 7, share: 3 },
    extensionSources: [],
    introTitle: null,
    sourceStatus: "pending_review",
  },
  {
    weekNo: 18,
    durationLabel: "약 60~70분",
    stages: null,
    core: { open: 5, story: 7, move: 13, make: 7, share: 3 },
    extensionSources: [],
    introTitle: null,
    sourceStatus: "pending_review",
  },
  {
    weekNo: 19,
    durationLabel: "약 60~70분",
    stages: null,
    core: { open: 5, story: 7, move: 13, make: 7, share: 3 },
    extensionSources: [],
    introTitle: null,
    sourceStatus: "pending_review",
  },
  {
    weekNo: 20,
    durationLabel: "약 60~70분",
    stages: null,
    core: { open: 5, story: 7, move: 13, make: 7, share: 3 },
    extensionSources: [],
    introTitle: null,
    sourceStatus: "pending_review",
  },
  {
    weekNo: 21,
    durationLabel: "약 60~70분",
    stages: null,
    core: { open: 5, story: 7, move: 13, make: 7, share: 3 },
    extensionSources: [],
    introTitle: null,
    sourceStatus: "pending_review",
  },
  {
    weekNo: 22,
    durationLabel: "약 60~70분",
    stages: null,
    core: { open: 5, story: 7, move: 13, make: 7, share: 3 },
    extensionSources: [],
    introTitle: null,
    sourceStatus: "pending_review",
  },
  {
    weekNo: 23,
    durationLabel: "약 60~70분",
    stages: null,
    core: { open: 5, story: 7, move: 13, make: 7, share: 3 },
    extensionSources: [],
    introTitle: null,
    sourceStatus: "pending_review",
  },
  {
    weekNo: 24,
    durationLabel: "약 60~70분",
    stages: null,
    core: { open: 5, story: 7, move: 13, make: 7, share: 3 },
    extensionSources: [],
    introTitle: null,
    sourceStatus: "pending_review",
  },
];

export function officialPlan(weekNo: number): OfficialWeekPlan | null {
  return OFFICIAL_PLAN.find((p) => p.weekNo === weekNo) ?? null;
}
