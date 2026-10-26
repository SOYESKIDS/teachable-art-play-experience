import { GROWTH_METRIC_LABEL, type GrowthMetricCode, type SupportLevelCode } from "@/lib/curriculum/taxonomies";

/**
 * 「SOYE KIDS 주간 성장리포트 5대지표 v2」 · 학부모용 PDF 원문 (IR/2026 사업화 전략/유치원 수업 프로그램/ai 리포트/).
 * ★ 지표 이름 · 짧은 질문 · 「…봅니다」 정의는 PDF 문장 그대로다. 고쳐 쓰지 않는다.
 * ★ PDF 의 「지난주 대비 ↑ 한 단계」 · 누적 횟수 · 워크북 수치는 쓰지 않는다
 *   (taxonomies.ts OPTIONAL_EXTENSIONS — 채택하지 않음. 점수 · 서열로 읽힐 수 있다).
 */
export const GROWTH_REPORT_SOURCE = "SOYE KIDS 주간 성장리포트 5대지표 v2 (학부모용 포함)";

export const GROWTH_INDICATORS: readonly { code: GrowthMetricCode; name: string; question: string; definition: string }[] = [
  { code: "expression_variety", name: "표현 다양성", question: "쓰는 색·재료·방법의 폭", definition: "쓰는 색·재료·방법이 얼마나 넓어졌는지 봅니다." },
  { code: "form_space_composition", name: "형태 · 공간 구성", question: "어디에 어떻게 놓는가", definition: "어디에 어떻게 놓을지 스스로 정하는지 봅니다." },
  { code: "creative_attempt", name: "창의적 시도", question: "안 되면 방법을 바꾸는가", definition: "잘 안 될 때 방법을 바꿔 다시 하는지 봅니다." },
  { code: "engagement_immersion", name: "활동 참여 · 몰입", question: "스스로 들어가고 끝맺는가", definition: "스스로 시작하고 끝까지 마치는지 봅니다." },
  { code: "self_explanation", name: "자기 설명 · 소통", question: "고른 이유를 말하는가", definition: "왜 그렇게 했는지 말로 설명하는지 봅니다." },
];

/** PDF 의 도움 방식 네 가지 — 「아이가 얼마나 잘했는지가 아니라, 그 일을 할 때 어떤 도움이 필요했는지」 */
export const SUPPORT_LEGEND: readonly { code: SupportLevelCode; name: string; meaning: string }[] = [
  { code: "not_observed", name: "기록 없음", meaning: "이번 주 관찰 안 됨" },
  { code: "with_teacher", name: "함께", meaning: "선생님과 함께" },
  { code: "after_modeling", name: "보고 나서", meaning: "친구를 본 뒤" },
  { code: "independent", name: "스스로", meaning: "혼자서" },
];

/** PDF 원문 — 표를 읽을 때 · 리포트 끝 안내 (문장 그대로) */
export const REPORT_READING_NOTES: readonly string[] = [
  "아이가 얼마나 잘했는지가 아니라, 그 일을 할 때 어떤 도움이 필요했는지를 표시합니다.",
  "표시는 점수나 등급이 아닙니다. 네 단계는 잘하고 못하고의 순서가 아니라 지금 어떤 도움이 맞는지를 나타냅니다.",
  "만 4~7세는 활동 종류와 그날 컨디션에 따라 같은 아이도 단계가 오르내리는 것이 자연스럽습니다.",
  "다른 아이나 또래 평균과 비교하지 않습니다. 한 주의 표시로 발달을 판단하지 않습니다.",
  "빈 칸은 그 주 수업에서 그 모습이 나오지 않았다는 뜻이며, 못했다는 뜻이 아닙니다.",
];

export const REPORT_GUARDIAN_NOTES: readonly string[] = [
  "아이를 진단하거나 점수를 매기지 않으며 다른 아이와 비교하지 않습니다.",
  "이 기록은 발달선별검사가 아닙니다. 아이의 발달이 걱정되실 때는 영유아 건강검진이나 전문기관에서 별도로 확인해 주세요.",
  "정답을 확인하는 질문이 아닙니다. “몰라”라고 해도 괜찮고, 손으로 가리키거나 그림으로 보여주는 것도 충분한 대답입니다.",
];

/**
 * 가상 성장 리포트 예시 — 실제 원아 · 기관과 연결되지 않은 지어낸 사례다.
 *
 * ★ 점수 · 순위 · 등급 · 진단을 쓰지 않는다. 리포트는 아이가 무엇을 했고 어떻게
 *   달라졌는지를 문장으로 설명한다.
 * ★ 이름은 실존 인물로 오해되지 않도록 「하늘(가상)」처럼 적고, 사진은 쓰지 않는다.
 * ★ 다섯 관찰 관점의 이름은 운영 리포트와 같은 공식 명칭(taxonomies.ts)을 쓴다.
 */
export interface DemoMoment {
  metric: keyof typeof GROWTH_METRIC_LABEL;
  week: number;
  title: string;
  observed: string;
  childVoice: string | null;
  /** 그 장면에서 필요했던 도움 방식 (가상) — 점수가 아니다 */
  support: SupportLevelCode;
  /** 장면이 나온 수업 단계 — 그 주차 자료 PDF 의 활동 이름 */
  evidence: string;
}

export const DEMO_REPORT = {
  childLabel: "하늘 (가상 원아)",
  classLabel: "햇살반 (가상)",
  period: "1~4주 · 씨앗과 숲",
  summary:
    "하늘이는 새로운 재료를 만나면 먼저 손으로 만져 보고 소리를 들어 보는 탐색형 친구예요. 4주 동안 ‘처음엔 망설이다가 스스로 다시 해보는’ 순간이 점점 늘었어요.",
  moments: [
    {
      metric: "expression_variety",
      week: 3,
      title: "마음을 색으로 고르기",
      observed: "마음 팔찌를 만들며 처음엔 한 가지 색만 골랐어요. 전할 친구를 떠올리더니 색을 하나씩 더했어요.",
      childVoice: "이건 고마워 색이에요!",
      support: "independent",
      evidence: "3주차 미술 「마음을 전하는 팔찌 만들기」",
    },
    {
      metric: "form_space_composition",
      week: 4,
      title: "씨앗을 크기대로 나란히",
      observed: "마라카스에 넣기 전, 콩 · 옥수수 · 팥을 큰 것부터 작은 것 순서로 줄 세웠어요. ‘작은 건 맨 끝’이라며 놓은 순서를 설명했어요.",
      childVoice: null,
      support: "after_modeling",
      evidence: "4주차 미술 「씨앗 소리 마라카스 만들기」",
    },
    {
      metric: "creative_attempt",
      week: 4,
      title: "소리를 바꾸는 새로운 방법",
      observed: "친구 마라카스와 소리가 비슷하자 씨앗을 조금 덜어 내고 다시 흔들어 봤어요. 스스로 소리를 바꾸고 새 소리에 이름을 붙였어요.",
      childVoice: "이제 비 소리 같아요!",
      support: "independent",
      evidence: "4주차 신체활동 「씨앗 마라카스 연주회」",
    },
    {
      metric: "engagement_immersion",
      week: 2,
      title: "방법을 바꿔 다시 해보기",
      observed: "젓가락으로 메추리알 모형을 옮기다 두 번 떨어뜨리고 잠시 멈췄어요. 집게로 바꿔 살짝 잡아 보더니 끝까지 옮겼어요.",
      childVoice: null,
      support: "with_teacher",
      evidence: "2주차 신체활동 「젓가락 미션 · 집게 미션」",
    },
    {
      metric: "self_explanation",
      week: 1,
      title: "이름표 소개",
      observed: "이름표에 그린 해님을 가리키며 친구들 앞에 섰어요. 왜 해님을 그렸는지 자기 말로 설명했어요.",
      childVoice: "아침에 일찍 일어나서 해님을 그렸어요.",
      support: "after_modeling",
      evidence: "1주차 미술 「나만의 이름표 만들기」",
    },
  ] satisfies DemoMoment[],
  nextSupport:
    "다음 주차에는 하늘이가 고른 재료를 친구에게 소개하는 시간을 조금 더 길게 마련할 예정이에요. 탐색한 것을 말로 나누는 경험을 이어 가요.",
  homeTip: "집에서도 ‘이건 어떤 소리가 날까?’처럼 결과보다 시도를 묻는 질문을 건네 주세요.",
} as const;
