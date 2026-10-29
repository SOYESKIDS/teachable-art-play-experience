import type { Sourced } from "../types";
import { isOfficialGuideWeek, weekDashboard } from "../teacher-dashboard/week-dashboards";

/**
 * 미리 준비할 것 · 수업 안에서 이어 붙일 것 — 여러 주차에 걸친 공동작품과 사전 제작을 본 활동과 나눠 적는다.
 *
 * ★ 근거 문장(text)은 자료 PDF 원문 조각이다 (주차 연계 · 기관 준비물 칸). 운영 방법(action)은 교사용 제안이다.
 * ★ 17주차에 설치한 「우리 반 세계지도」에 18~23주차마다 나라 깃발을 붙이고, 24주차에 지구와 함께 완성한다
 *   (2026-10-27 원문 대조). 4 · 11 · 22주차는 신체활동이 예술 표현에서 만들 것을 먼저 쓰므로 선생님 견본을 미리 만든다.
 */
export interface PrepNote {
  weekNo: number;
  when: "before" | "during";
  text: Sourced;
  action: Sourced;
}

const src = (text: string): Sourced => ({ text, origin: "source" });
const prop = (text: string): Sourced => ({ text, origin: "proposal" });

const FIXED: readonly PrepNote[] = [
  { weekNo: 4, when: "before", text: src("씨앗 소리 마라카스 만들기"), action: prop("연주 시범용 선생님 견본 마라카스 1개를 미리 만들어 둬요. 아이들 마라카스는 4단계에서 만들어요.") },
  { weekNo: 11, when: "before", text: src("나의 여권 & 탑승권"), action: prop("여권 · 탑승권은 워크북으로 미리 만들거나, 없으면 선생님이 탑승권 카드를 준비해요. 꽃목걸이는 4단계에서 만들어요.") },
  { weekNo: 22, when: "before", text: src("가면 도안"), action: prop("입장용 견본 가면 · 장식 하나를 미리 만들어 보여 줘요. 아이들 장식 · 가면은 4단계에서 만들어요.") },
  { weekNo: 16, when: "before", text: src("9~15주차 활동 사진 인화본"), action: prop("수업 전에 9~15주차 사진을 인화해 계절별로 나눠 두고, 아이마다 고를 수 있게 펼쳐 둬요.") },
  { weekNo: 24, when: "before", text: src("각자 꾸민 지구 조각"), action: prop("원아 수만큼 지구 조각을 미리 잘라 두고, 대형 지구 판에 조각 자리를 표시해 둬요. 결석한 아이 조각 자리도 비워 둬요. 아이들 조각은 4단계에서 꾸며요.") },
  { weekNo: 17, when: "before", text: src("우리 반 세계지도 설치 + 출발지 표시"), action: prop("대형 세계지도를 아이 눈높이에 붙이고 우리 원 자리에 출발지를 표시해요. 24주차까지 떼지 않아요.") },
];

/** 18~23주차 — 주차 연계 원문의 「우리 반 세계지도 — ○○ 깃발을 붙여요」 */
function flagNotes(): PrepNote[] {
  const out: PrepNote[] = [];
  for (let n = 18; n <= 23; n++) {
    const m = weekDashboard(n)?.crossWeek?.match(/우리 반 세계지도(?: \(17주차 설치\))? — (.+?깃발을 붙여요)/);
    if (m) out.push({ weekNo: n, when: "during", text: src(m[1]), action: prop(`수업 마무리에 17주차에 붙인 세계지도에 ${m[1].replace(/을 붙여요$/, "")}을 함께 붙여요. 24주차 지구 완성 때 다시 봐요.`) });
  }
  return out;
}

export const PREP_NOTES: readonly PrepNote[] = [...FIXED, ...flagNotes()];

export function prepNotes(weekNo: number): readonly PrepNote[] {
  // 14 · 17~24주는 공식 가이드 기준 수업이다 — 위 메모는 같은 주차 자료 PDF(다른 주제) 활동에 붙인 것이라 쓰지 않는다
  if (isOfficialGuideWeek(weekNo)) return [];
  return PREP_NOTES.filter((x) => x.weekNo === weekNo);
}

/**
 * 촬영이 들어가는 활동 — 아이 영상 · 사진을 찍는 수업 (16주 영상편지 · 8주 숲 영상 · 11주 여행 사진).
 * ★ 공개 체험 사이트는 사진 · 영상을 받지 않는다. 이 문장은 원 안에서 찍을 때의 교사용 제안이다.
 */
export const FILMING_NOTE: Sourced = prop("아이 사진 · 영상은 원의 사진 · 영상 동의 범위 안에서만 찍고, 원 밖(개인 SNS 등)에 올리지 않아요. 찍기 싫어하는 아이는 목소리 · 그림으로 참여해요.");

export function hasFilming(weekNo: number): boolean {
  const d = weekDashboard(weekNo);
  return JSON.stringify([d?.physicalSteps, d?.physicalLead, d?.familyHow]).match(/영상|촬영|카메라|사진을 찍|찰칵/) !== null;
}
