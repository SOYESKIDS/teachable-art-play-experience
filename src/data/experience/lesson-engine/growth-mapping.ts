import type { GrowthMetricCode } from "@/lib/curriculum/taxonomies";
import type { TextOrigin } from "../types";

/**
 * 관찰 문항 → 소예키즈 5대 성장지표 연결.
 *
 * ★ 자료 PDF 의 관찰 문항에는 지표가 적혀 있지 않다. 연결은 **교사용 제안(본사 검수 전)** 이다.
 * ★ 지표 정의(주간 성장리포트 5대지표 v2 원문)에 기대어, 문항이 묻는 **보이는 행동**으로만 고른다.
 *   - 표현 다양성: 쓰는 색 · 재료 · 방법의 폭
 *   - 형태 · 공간 구성: 어디에 어떻게 놓는가
 *   - 창의적 시도: 안 되면 방법을 바꾸는가
 *   - 활동 참여 · 몰입: 스스로 들어가고 끝맺는가
 *   - 자기 설명 · 소통: 고른 이유를 말하는가
 * ★ 문항 하나에 많아야 두 지표. 맞는 지표가 없으면 **연결하지 않는다** (다섯 지표를 억지로 채우지 않는다).
 * ★ 규칙은 앞에서부터 본다 — 순서가 우선순위다. 테스트가 24주 결과를 고정한다.
 */
const RULES: readonly { code: GrowthMetricCode; re: RegExp }[] = [
  // 「이야기를 듣는가」는 듣기다 — 자기 설명이 아니다 (아래 listening 에서 참여 · 몰입으로 본다)
  // 「전하」는 「안전하게」 안에도 있다 — 안전 문항이 자기 설명으로 잘못 가지 않게 「안」 뒤의 「전하」는 뺀다
  { code: "self_explanation", re: /말로|말하|이야기하|이야기를 나누|설명|소개|(?<!안)전하|대답|인사|발표|질문하|마음을 표현|따뜻한 말/ },
  { code: "creative_attempt", re: /새로운|다른 방법|방법을 바꾸|바꿔|다시 시도|도전|실험|상상|예상|궁금|스스로 생각|자기만의|자신만의|나만의|이름을 붙이/ },
  // 「큰 소리로 부르기」 · 「재료를 나누어 쓰기」는 표현의 폭이 아니다 — 소리 · 재료는 표현 대상일 때만
  { code: "expression_variety", re: /색|재료로|재료를 골|다양한 재료|소리(를|의|에|가)|악기|리듬|다양|여러|꾸미|몸으로|동작|움직임|흉내|표정|흔적|골라 표현|자유롭게 표현/ },
  // 「새 공간을 둘러보기」 · 「내 자리 찾기」는 배치가 아니다 — 어디에 어떻게 놓는가만
  { code: "form_space_composition", re: /배치|모양|순서|위치|크기|구성|조합|쌓|길이|분류|비교/ },
  { code: "engagement_immersion", re: /참여|끝까지|집중|즐기|즐겁|몰입|협력|힘을 모아|함께|기다리|차례|규칙|약속|관심|살펴|둘러보|탐색|관찰|나누어|나누는가|스스로 찾아/ },
];

export interface IndicatorLink {
  item: string;
  indicators: readonly GrowthMetricCode[];
  origin: TextOrigin;
}

const LISTENING = /듣는가|듣고|들어 주|들으려|들으며|귀 기울/;
/** 「소리를 듣는가」처럼 듣기만 묻는 문항 — 소리는 표현 대상이 아니라 듣는 대상이다 */
const EXPRESSION_BEYOND_SOUND = /색|재료|악기|리듬|다양|여러|꾸미|몸으로|동작|움직임|흉내|표정|흔적|표현/;

export function indicatorsFor(item: string): readonly GrowthMetricCode[] {
  let hits = RULES.filter((r) => r.re.test(item)).map((r) => r.code);
  if (LISTENING.test(item) && !EXPRESSION_BEYOND_SOUND.test(item)) hits = hits.filter((c) => c !== "expression_variety");
  if (LISTENING.test(item) && !hits.includes("engagement_immersion")) hits.push("engagement_immersion");
  return hits.slice(0, 2);
}

export function indicatorLinks(items: readonly string[]): readonly IndicatorLink[] {
  return items.map((item) => ({ item, indicators: indicatorsFor(item), origin: "proposal" as const }));
}

/** 관찰 문항이 몸 활동 · 만들기 활동 어느 쪽 장면인가 — 둘 다 아니면 두 활동 모두에 건다 */
const BODY = /몸|움직|춤|신체|놀이|게임|따라|흔들|걷|달리|뛰|건너|옮기|던지|굴리|탐험|이동|차례|규칙|약속|협력|친구와|친구들과|함께/;
const MAKE = /만들|만드|그리|꾸미|작품|색|도장|붙이|오리|접|칠|완성|표현|만든/;

export function activitySides(item: string): { body: boolean; make: boolean } {
  const body = BODY.test(item);
  const make = MAKE.test(item);
  return body || make ? { body, make } : { body: true, make: true };
}

/** 활동 종류별로 모을 근거 — 기관용 서비스에서 실제로 받는 것 (공개 체험은 가상 예시만) */
export const EVIDENCE_REQUIREMENTS = {
  physical: [
    { key: "teacherNote", label: "교사 관찰 문장 (보인 행동 그대로)", required: true },
    { key: "childQuote", label: "아이가 한 말 (그대로 옮김)", required: false },
    { key: "support", label: "도움 방식 (기록 없음 · 함께 · 보고 나서 · 스스로)", required: true },
    { key: "photo", label: "활동 사진 · 영상 (기관용 서비스 · 보호자 동의 범위 안)", required: false },
  ],
  art: [
    { key: "teacherNote", label: "교사 관찰 문장 (만드는 과정에서 보인 행동)", required: true },
    { key: "artworkFact", label: "작품에서 직접 센 · 본 사실 (색 · 재료 · 배치)", required: false },
    { key: "childQuote", label: "아이의 작품 설명 (그대로 옮김)", required: false },
    { key: "support", label: "도움 방식", required: true },
    { key: "photo", label: "작품 사진 (기관용 서비스 · 보호자 동의 범위 안)", required: false },
  ],
} as const;
