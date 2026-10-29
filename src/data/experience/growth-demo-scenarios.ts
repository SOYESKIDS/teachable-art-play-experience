import type { DemoEvidence, DemoObservation } from "@/lib/growth/demo-analysis";

/**
 * 가상 성장 분석 시연 장면 — 모두 지어낸 가상 기록이다 (실제 아동 · 기관 · 사진 없음).
 *
 * ★ 사진 · 작품은 파일이 아니라 「가상 자료 설명」 한 줄이다. 체험 사이트는 파일을 받지 않는다.
 * ★ 활동 ID · 관찰 문항은 그 주차 실행형 수업 데이터(lesson-engine/plan.ts)의 것을 그대로 쓴다 — 테스트가 대조한다.
 * ★ 장면 8개는 분석 규칙을 하나씩 보여 준다 (근거 충분 · 근거 없음 · 사진만 · 충돌 · 기록 없는 지표 ·
 *   대표활동 둘 · 여러 주차 통합 · 개인정보 차단).
 */
export interface DemoScenario {
  key: string;
  title: string;
  expect: string;
  weekNo: number;
  childLabel: string;
  observations: readonly DemoObservation[];
  evidence: readonly DemoEvidence[];
}

const base = { observedAt: "가상 수업 중", observer: "가상 담임교사" };

export const DEMO_SCENARIOS: readonly DemoScenario[] = [
  {
    key: "enough",
    title: "근거가 충분한 경우",
    expect: "관찰 문장 · 아이 말 · 작품 사실이 있는 두 장면이 지표 문장이 됩니다.",
    weekNo: 4,
    childLabel: "하늘 (가상)",
    observations: [
      { ...base, id: "obs-4-1", weekNo: 4, activityId: "w4.art", activityTitle: "씨앗 소리 마라카스 만들기", stageKey: "make",
        item: "씨앗의 크기와 모양을 비교하며 탐색하는가?", indicator: "form_space_composition",
        teacherNote: "콩 · 옥수수 · 팥을 큰 것부터 작은 것 순서로 줄 세운 뒤 통에 담았다.", childQuote: "작은 건 맨 끝이야.",
        artworkFact: "통 안에 씨앗 세 종류 · 스티커 두 장", support: "independent", evidenceIds: ["ev-4-1"] },
      { ...base, id: "obs-4-2", weekNo: 4, activityId: "w4.physical0", activityTitle: "씨앗 마라카스 연주회", stageKey: "move",
        item: "마라카스를 즐겁게 연주하는가?", indicator: "engagement_immersion",
        teacherNote: "친구가 흔드는 모습을 본 뒤 리듬에 맞춰 흔들기 시작했고, 합주가 끝날 때까지 이어 갔다.", support: "after_modeling", evidenceIds: ["ev-4-2"] },
    ],
    evidence: [
      { id: "ev-4-1", kind: "artwork", caption: "가상 작품 설명 — 씨앗 세 종류가 든 투명 마라카스" },
      { id: "ev-4-2", kind: "photo", caption: "가상 사진 설명 — 합주 장면 (얼굴 없음)", supportHint: "after_modeling" },
    ],
  },
  {
    key: "none",
    title: "근거가 없는 경우",
    expect: "교사 기록 · 자료가 모두 없으면 아무 문장도 만들지 않습니다.",
    weekNo: 2,
    childLabel: "바다 (가상)",
    observations: [
      { ...base, id: "obs-2-1", weekNo: 2, activityId: "w2.physical0", activityTitle: "마루의 도전 미션 키트", stageKey: "move",
        item: "잘 안 될 때 멈췄다가 다시 시도하는가?", indicator: "creative_attempt", teacherNote: "", support: "with_teacher", evidenceIds: [] },
    ],
    evidence: [],
  },
  {
    key: "photoOnly",
    title: "사진만 있고 교사 기록이 없는 경우",
    expect: "사진만으로는 분석하지 않습니다 — 사진으로 아이의 생각 · 감정을 알 수 없습니다.",
    weekNo: 14,
    childLabel: "구름 (가상)",
    observations: [
      { ...base, id: "obs-14-1", weekNo: 14, activityId: "w14.art", activityTitle: "감기야 사라져라! 얍!", stageKey: "make",
        item: "응원 그림의 색·모양·상징 선택", indicator: "expression_variety", teacherNote: "", support: "independent", evidenceIds: ["ev-14-1"] },
    ],
    evidence: [{ id: "ev-14-1", kind: "artwork", caption: "가상 작품 설명 — 색연필 · 스티커로 꾸민 응원 그림" }],
  },
  {
    key: "conflict",
    title: "교사 기록과 사진 설명이 다른 경우",
    expect: "문장에 「사실 확인 필요」가 붙고, 교사가 확인하기 전에는 승인할 수 없습니다.",
    weekNo: 17,
    childLabel: "하늘 (가상)",
    observations: [
      { ...base, id: "obs-17-1", weekNo: 17, activityId: "w17.art", activityTitle: "내가 만든 색친구", stageKey: "make",
        item: "번진 모양을 자기 방식으로 확장하는가", indicator: "form_space_composition",
        teacherNote: "번진 물감 모양 위쪽에 눈을 직접 붙이고, 아래로 다리 두 개를 이어 그렸다.", support: "independent", evidenceIds: ["ev-17-1"] },
    ],
    evidence: [{ id: "ev-17-1", kind: "photo", caption: "가상 사진 설명 — 선생님이 눈 붙이는 것을 함께 도와주는 장면", supportHint: "with_teacher" }],
  },
  {
    key: "missingIndicator",
    title: "기록이 없는 지표가 있는 경우",
    expect: "기록한 지표만 문장이 되고, 나머지는 「기록 없음」으로 남습니다. 못했다는 뜻이 아닙니다.",
    weekNo: 18,
    childLabel: "바다 (가상)",
    observations: [
      { ...base, id: "obs-18-1", weekNo: 18, activityId: "w18.art", activityTitle: "마음을 담은 비누", stageKey: "make",
        item: "비누에 자신의 마음을 담아 구성하는가", indicator: "form_space_composition",
        teacherNote: "비누 틀 가운데에 하트 조각을 놓고, 둘레에 작은 별 조각을 돌려 담았다.", childQuote: "가운데가 내 마음이야!", support: "independent", evidenceIds: [] },
    ],
    evidence: [],
  },
  {
    key: "twoActivities",
    title: "한 주에 대표활동이 둘인 경우 (7주)",
    expect: "나비놀이 · 벌놀이 기록이 각각 어느 활동인지 표시됩니다.",
    weekNo: 7,
    childLabel: "구름 (가상)",
    observations: [
      { ...base, id: "obs-7-1", weekNo: 7, activityId: "w7.physical0", activityTitle: "팔랑팔랑 꽃가루를 날려요! (나비놀이)", stageKey: "move",
        item: "친구들과 협력하여 놀이하는가?", indicator: "engagement_immersion",
        teacherNote: "꽃가루 포스트잇을 친구 바구니에 옮겨 주며 끝까지 함께 날았다.", support: "independent", evidenceIds: [] },
      { ...base, id: "obs-7-2", weekNo: 7, activityId: "w7.physical1", activityTitle: "윙윙! 꿀을 모아요! (벌놀이)", stageKey: "move",
        item: "나비와 벌의 특징을 알고 말하는가?", indicator: "self_explanation",
        teacherNote: "꿀통을 옮기며 벌은 꿀을 모은다고 친구에게 말했다.", childQuote: "벌은 꿀 모으는 거야!", support: "after_modeling", evidenceIds: [] },
    ],
    evidence: [],
  },
  {
    key: "integration",
    title: "여러 주차 결과물을 통합하는 경우 (8주)",
    expect: "4 · 5주차 결과물을 쓴 기록이 「몇 주차 결과물」인지 함께 적힙니다.",
    weekNo: 8,
    childLabel: "하늘 (가상)",
    observations: [
      { ...base, id: "obs-8-1", weekNo: 8, activityId: "w8.physical0", activityTitle: "하나씩 모이면 숲이 돼요! (숲을 완성해요)", stageKey: "move",
        item: "친구들과 협력하여 참여하는가?", indicator: "engagement_immersion",
        teacherNote: "4주차에 만든 씨앗 · 새싹을 들고 현수막으로 가서 친구 옆자리에 붙였다.", support: "independent", evidenceIds: ["ev-8-1"] },
      { ...base, id: "obs-8-2", weekNo: 5, activityId: "w5.art", activityTitle: "나만의 꽃 만들기", stageKey: "make",
        item: "다양한 꽃 놀이에 즐겁게 참여하는가?", indicator: "expression_variety",
        teacherNote: "5주차에 만든 꽃을 숲 가장자리에 놓으며 꽃잎 색이 세 가지라고 말했다.", support: "independent", evidenceIds: [] },
    ],
    evidence: [{ id: "ev-8-1", kind: "photo", caption: "가상 사진 설명 — 우리 반 숲 현수막 (아이 얼굴 없음)" }],
  },
  {
    key: "pii",
    title: "실제 아동 개인정보가 들어간 경우",
    expect: "실명 · 연락처가 보이면 분석을 막습니다. 체험에는 가상 원아만 씁니다.",
    weekNo: 1,
    childLabel: "하늘 (가상)",
    observations: [
      { ...base, id: "obs-1-1", weekNo: 1, activityId: "w1.art", activityTitle: "나만의 이름표 만들기", stageKey: "make",
        item: "해 보고 싶은 놀이를 하나 골라 말하는가?", indicator: "self_explanation",
        teacherNote: "김민준이가 이름표에 해님을 그렸다. 어머니 연락처 010-1234-5678", support: "independent", evidenceIds: [] },
    ],
    evidence: [],
  },
];
