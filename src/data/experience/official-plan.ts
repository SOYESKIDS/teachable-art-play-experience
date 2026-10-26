/**
 * 이전 공식 교사용 수업가이드(1~24주차 PDF)의 시간 · 시간표 — 출처 기록.
 *
 * ── 이 파일이 있는 이유 ──────────────────────────────────────────
 *
 * 이전 가이드의 「권장 핵심수업 시간」과 단계별 시간표를 지우지 않고 보존한다.
 * 화면이 말하는 운영 시간은 이 파일이 아니라 lesson-time.ts 의 기본 수업 35분이다.
 *
 * ★ durationLabel · stages 는 가이드 원문 그대로다. 고치지 않는다.
 *   화면에 적을 때는 「출처 기록 · 현재 운영 시간이 아닙니다」를 함께 붙인다.
 * ★ matchesCurrentLesson — 2026-10-26 자료 PDF 기준으로 수업이 바뀐 주차
 *   (9 · 14 · 15 · 17~24)는 이 가이드가 **다른 수업**의 기록이다. 그 주차는 시간표 ·
 *   도입 제목 · 확장활동을 지금 수업에 쓰지 않는다.
 * ★ 17~24주차는 가이드 5장이 「관찰 시간표」라 단계별 분이 원문에 없다.
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
  /** 기본 수업에서 빠져 확장활동으로 가는 공식 단계 */
  extensionSources: OfficialExtensionSource[];
  /** 가이드에 도입 단계 제목이 있으면 그 문장 */
  introTitle: string | null;
  sourceStatus: PlanSourceStatus;
  /** 이 가이드가 지금 사이트의 수업과 같은 수업인가 (false 면 출처 기록으로만 남긴다) */
  matchesCurrentLesson: boolean;
}

export const OFFICIAL_PLAN: readonly OfficialWeekPlan[] = [
  {
    weekNo: 1,
    durationLabel: "약 50~60분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "탐험", min: 15, max: 15 }, { name: "이름표", min: 10, max: 10 }, { name: "워크북", min: 10, max: 10 }, { name: "마무리", min: 5, max: 5 }],
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "탐험", min: 15, max: 15 }, { kind: "art_more", name: "이름표", min: 10, max: 10 }],
    introTitle: "오늘 처음 만난 것은 무엇일까?",
    sourceStatus: "verified",
    matchesCurrentLesson: true,
  },
  {
    weekNo: 2,
    durationLabel: "약 55~65분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "도전 미션", min: 25, max: 25 }, { name: "용기 메달", min: 10, max: 15 }, { name: "마무리", min: 5, max: 10 }],
    extensionSources: [{ kind: "move_more", name: "도전 미션", min: 25, max: 25 }, { kind: "art_more", name: "용기 메달", min: 10, max: 15 }],
    introTitle: "마루의 도전 상황 만나기",
    sourceStatus: "verified",
    matchesCurrentLesson: true,
  },
  {
    weekNo: 3,
    durationLabel: "약 55~65분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "마음배달", min: 15, max: 20 }, { name: "워크북", min: 10, max: 10 }, { name: "팔찌 만들기", min: 10, max: 15 }, { name: "마무리", min: 5, max: 5 }],
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "마음배달", min: 15, max: 20 }, { kind: "art_more", name: "팔찌 만들기", min: 10, max: 15 }],
    introTitle: "오늘 내 마음은 어떤 얼굴일까?",
    sourceStatus: "verified",
    matchesCurrentLesson: true,
  },
  {
    weekNo: 4,
    durationLabel: "약 55~65분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "씨앗 탐험", min: 10, max: 15 }, { name: "마라카스 연주", min: 10, max: 10 }, { name: "워크북", min: 10, max: 10 }, { name: "만들기", min: 10, max: 15 }, { name: "마무리", min: 5, max: 5 }],
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "씨앗 탐험", min: 10, max: 15 }, { kind: "move_more", name: "마라카스 연주", min: 10, max: 10 }, { kind: "art_more", name: "만들기", min: 10, max: 15 }],
    introTitle: "이 작은 것 안에 무엇이 있을까?",
    sourceStatus: "verified",
    matchesCurrentLesson: true,
  },
  {
    weekNo: 5,
    durationLabel: "약 55~65분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "꽃놀이", min: 15, max: 15 }, { name: "워크북", min: 10, max: 10 }, { name: "나만의 꽃", min: 10, max: 15 }, { name: "마무리", min: 5, max: 5 }],
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "꽃놀이", min: 15, max: 15 }, { kind: "art_more", name: "나만의 꽃", min: 10, max: 15 }],
    introTitle: "꽃들은 왜 모두 다르게 생겼을까?",
    sourceStatus: "verified",
    matchesCurrentLesson: true,
  },
  {
    weekNo: 6,
    durationLabel: "약 60~70분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "신체활동", min: 15, max: 15 }, { name: "워크북", min: 10, max: 10 }, { name: "비밀기지", min: 15, max: 20 }, { name: "마무리", min: 5, max: 5 }],
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "신체활동", min: 15, max: 15 }, { kind: "art_more", name: "비밀기지", min: 15, max: 20 }],
    introTitle: "혼자 하기 어려운 일은 어떻게 할까?",
    sourceStatus: "verified",
    matchesCurrentLesson: true,
  },
  {
    weekNo: 7,
    durationLabel: "약 55~65분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "신체활동", min: 15, max: 15 }, { name: "워크북", min: 10, max: 10 }, { name: "미술", min: 10, max: 15 }, { name: "마무리", min: 5, max: 5 }],
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "신체활동", min: 15, max: 15 }, { kind: "art_more", name: "미술", min: 10, max: 15 }],
    introTitle: "잡으려고 하면 왜 멀어질까?",
    sourceStatus: "verified",
    matchesCurrentLesson: true,
  },
  {
    weekNo: 8,
    durationLabel: "약 55~65분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "공동활동", min: 20, max: 20 }, { name: "워크북", min: 10, max: 10 }, { name: "숲 이야기", min: 5, max: 10 }, { name: "마무리", min: 5, max: 5 }],
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "공동활동", min: 20, max: 20 }, { kind: "art_more", name: "숲 이야기", min: 5, max: 10 }],
    introTitle: "우리 숲에는 무엇이 있었지?",
    sourceStatus: "verified",
    matchesCurrentLesson: true,
  },
  {
    weekNo: 9,
    durationLabel: "약 60~70분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "꽃비 놀이", min: 20, max: 25 }, { name: "워크북", min: 10, max: 10 }, { name: "꽃다발", min: 15, max: 20 }, { name: "마무리", min: 5, max: 5 }],
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "꽃비 놀이", min: 20, max: 25 }, { kind: "art_more", name: "꽃다발", min: 15, max: 20 }],
    introTitle: "아직 봄일까?",
    sourceStatus: "verified",
    matchesCurrentLesson: false,
  },
  {
    weekNo: 10,
    durationLabel: "약 55~65분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "곤충 채집", min: 20, max: 25 }, { name: "워크북", min: 10, max: 10 }, { name: "마무리", min: 5, max: 10 }],
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "곤충 채집", min: 20, max: 25 }],
    introTitle: "“앗 뜨거!” 여름의 단서 만나기",
    sourceStatus: "verified",
    matchesCurrentLesson: true,
  },
  {
    weekNo: 11,
    durationLabel: "약 60~70분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "여행 놀이", min: 15, max: 20 }, { name: "훌라댄스", min: 15, max: 20 }, { name: "워크북·미술", min: 10, max: 15 }, { name: "마무리", min: 5, max: 5 }],
    extensionSources: [{ kind: "workbook", name: "워크북·미술", min: 10, max: 15 }, { kind: "move_more", name: "여행 놀이", min: 15, max: 20 }, { kind: "move_more", name: "훌라댄스", min: 15, max: 20 }],
    introTitle: "여행을 떠나려면 무엇이 필요할까?",
    sourceStatus: "verified",
    matchesCurrentLesson: true,
  },
  {
    weekNo: 12,
    durationLabel: "약 60~70분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "촉감놀이", min: 20, max: 25 }, { name: "워크북", min: 10, max: 10 }, { name: "허수아비 미술", min: 15, max: 20 }, { name: "마무리", min: 5, max: 5 }],
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "촉감놀이", min: 20, max: 25 }, { kind: "art_more", name: "허수아비 미술", min: 15, max: 20 }],
    introTitle: "숲의 색이 달라졌어!",
    sourceStatus: "verified",
    matchesCurrentLesson: true,
  },
  {
    weekNo: 13,
    durationLabel: "약 60~70분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "달빛 신체놀이", min: 20, max: 25 }, { name: "워크북", min: 10, max: 10 }, { name: "미술활동", min: 15, max: 20 }, { name: "마무리", min: 5, max: 5 }],
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "달빛 신체놀이", min: 20, max: 25 }, { kind: "art_more", name: "미술활동", min: 15, max: 20 }],
    introTitle: null,
    sourceStatus: "verified",
    matchesCurrentLesson: true,
  },
  {
    weekNo: 14,
    durationLabel: "약 60~70분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "몸으로 말해요", min: 20, max: 25 }, { name: "워크북", min: 10, max: 10 }, { name: "미술활동", min: 15, max: 20 }, { name: "마무리", min: 5, max: 5 }],
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "몸으로 말해요", min: 20, max: 25 }, { kind: "art_more", name: "미술활동", min: 15, max: 20 }],
    introTitle: "말하지 않아도 알 수 있을까?",
    sourceStatus: "verified",
    matchesCurrentLesson: false,
  },
  {
    weekNo: 15,
    durationLabel: "약 60~70분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "마음벨 놀이", min: 15, max: 20 }, { name: "워크북", min: 10, max: 10 }, { name: "미술·전달", min: 20, max: 25 }, { name: "마무리", min: 5, max: 5 }],
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 10 }, { kind: "move_more", name: "마음벨 놀이", min: 15, max: 20 }, { kind: "art_more", name: "미술·전달", min: 20, max: 25 }],
    introTitle: "따뜻한 마음은 어떤 모습일까?",
    sourceStatus: "verified",
    matchesCurrentLesson: false,
  },
  {
    weekNo: 16,
    durationLabel: "약 55~65분",
    stages: [{ name: "도입", min: 5, max: 5 }, { name: "그림책", min: 10, max: 10 }, { name: "사계절 사진 회상", min: 15, max: 20 }, { name: "영상편지", min: 10, max: 15 }, { name: "워크북", min: 10, max: 15 }, { name: "마무리", min: 5, max: 5 }],
    extensionSources: [{ kind: "workbook", name: "워크북", min: 10, max: 15 }, { kind: "move_more", name: "사계절 사진 회상", min: 15, max: 20 }, { kind: "art_more", name: "영상편지", min: 10, max: 15 }],
    introTitle: "이 사진, 기억나?",
    sourceStatus: "verified",
    matchesCurrentLesson: true,
  },
  {
    weekNo: 17,
    durationLabel: "약 60~70분",
    stages: null,
    extensionSources: [],
    introTitle: null,
    sourceStatus: "pending_review",
    matchesCurrentLesson: false,
  },
  {
    weekNo: 18,
    durationLabel: "약 60~70분",
    stages: null,
    extensionSources: [],
    introTitle: null,
    sourceStatus: "pending_review",
    matchesCurrentLesson: false,
  },
  {
    weekNo: 19,
    durationLabel: "약 60~70분",
    stages: null,
    extensionSources: [],
    introTitle: null,
    sourceStatus: "pending_review",
    matchesCurrentLesson: false,
  },
  {
    weekNo: 20,
    durationLabel: "약 60~70분",
    stages: null,
    extensionSources: [],
    introTitle: null,
    sourceStatus: "pending_review",
    matchesCurrentLesson: false,
  },
  {
    weekNo: 21,
    durationLabel: "약 60~70분",
    stages: null,
    extensionSources: [],
    introTitle: null,
    sourceStatus: "pending_review",
    matchesCurrentLesson: false,
  },
  {
    weekNo: 22,
    durationLabel: "약 60~70분",
    stages: null,
    extensionSources: [],
    introTitle: null,
    sourceStatus: "pending_review",
    matchesCurrentLesson: false,
  },
  {
    weekNo: 23,
    durationLabel: "약 60~70분",
    stages: null,
    extensionSources: [],
    introTitle: null,
    sourceStatus: "pending_review",
    matchesCurrentLesson: false,
  },
  {
    weekNo: 24,
    durationLabel: "약 60~70분",
    stages: null,
    extensionSources: [],
    introTitle: null,
    sourceStatus: "pending_review",
    matchesCurrentLesson: false,
  },
];

export function officialPlan(weekNo: number): OfficialWeekPlan | null {
  return OFFICIAL_PLAN.find((p) => p.weekNo === weekNo) ?? null;
}
