import type { ExperienceWeek, Sourced } from "./types";
import { MATERIALS_ORIGIN, MEDIA_STATE_LABEL, SAFETY_ORIGIN, type CheckGroup, type MediaRow } from "./lesson-labels";
import { gatherForWeek, weekDashboard } from "./teacher-dashboard/week-dashboards";
import { weekProposal } from "./teacher-dashboard/proposals";
import { prepNotes } from "./lesson-engine/prep-notes";

/**
 * 수업 전 · 수업 뒤 확인 목록과 미디어 보유 상태.
 *
 * ★ 교실 플레이어 · 교사 대시보드 · 인쇄용 수업 요약이 같은 목록을 쓴다 — 화면마다 말이 달라지지 않게.
 * ★ 새 문장을 지어내지 않는다. 이미 있는 자료 원문 · 35분 체험 편집 · 교사용 제안을 모아 묶을 뿐이고,
 *   문장마다 출처 상태를 그대로 단다.
 * ★ 체크 상태는 어디에도 저장하지 않는다 (화면 안에서만 잠시 보인다).
 */

const src = (text: string): Sourced => ({ text, origin: "source" });

/** 교육 목표 — 자료 원문 → 교사용 제안 → 주차 핵심 문장(35분 체험 편집) 순서 */
export function weekGoals(week: ExperienceWeek): readonly Sourced[] {
  const d = weekDashboard(week.weekNo);
  if (d?.goals.length) return d.goals.map(src);
  const p = weekProposal(week.weekNo);
  if (p?.goals.length) return p.goals.map((text) => ({ text, origin: "proposal" as const }));
  return [{ text: week.coreMessage, origin: "edited" }];
}

/** 통합 주차(8 · 16 · 24) — 앞 주차 결과물을 모아 완성한다. 이름은 화면 안내용(35분 체험 편집) */
export const INTEGRATION_LABEL: Partial<Record<number, string>> = {
  8: "PART 1 통합 활동 — 4~7주차 결과물로 숲을 완성해요",
  16: "PART 2 통합 활동 — 9~15주차를 돌아보며 한 뼘 자란 나를 만나요",
  24: "PART 3 마무리 활동 — 17~23주차를 모아 우리 지구를 완성해요",
};

/** 수업 시작 전 확인 — 목표 · 교구 · 공간 · 안전 · 앞 주차 결과물 · 발문 · 미디어 */
export function preLessonChecks(week: ExperienceWeek): readonly CheckGroup[] {
  const d = weekDashboard(week.weekNo);
  const kit = [...(d?.kitItems ?? []), ...(d?.orgItems ?? [])].map(src);
  const gather = gatherForWeek(week.weekNo).map(src);
  const media = mediaStatus(week);
  const groups: CheckGroup[] = [
    { key: "goal", label: "오늘의 목표", items: weekGoals(week).slice(0, 2) },
    {
      key: "materials",
      label: "교구 · 재료",
      items: kit.length ? kit : week.body.materials.map((text) => ({ text, origin: MATERIALS_ORIGIN })),
    },
    { key: "space", label: "공간 배치", items: [week.prep.space] },
    { key: "safety", label: "안전 유의사항", items: week.body.safety.map((text) => ({ text, origin: SAFETY_ORIGIN })) },
  ];
  if (gather.length) groups.push({ key: "gather", label: "앞 주차 결과물 준비", items: gather });
  // 미리 만들 것 · 미리 설치할 것 — 본 활동(4단계)에서 만드는 것과 나눠 적는다
  const before = prepNotes(week.weekNo).filter((p) => p.when === "before");
  if (before.length) groups.push({ key: "premake", label: "미리 준비 · 사전 제작", items: before.flatMap((p) => [p.text, p.action]) });
  groups.push({
    key: "script",
    label: "여는 말 · 발문",
    items: [
      { text: `여는 말 — ${week.body.openLine}`, origin: "proposal" },
      ...week.stages.map((s) => ({ text: `${s.title} — “${s.teacherQuestion}”`, origin: s.teacherQuestionOrigin })),
    ],
  });
  groups.push({
    key: "media",
    label: "미디어 보유 상태",
    items: [{ text: media.map((m) => `${m.label} ${MEDIA_STATE_LABEL[m.state]}`).join(" · "), origin: "edited" }],
  });
  return groups;
}

/** 수업 마무리 확인 — 나누기 질문 · 정리 · 관찰 · 가정 안내 · 다음 주차 · 확장활동 */
export function closingChecks(week: ExperienceWeek, next: ExperienceWeek | null): readonly CheckGroup[] {
  const d = weekDashboard(week.weekNo);
  const share = week.stages.find((s) => s.key === "share");
  const groups: CheckGroup[] = [];
  if (share) groups.push({ key: "share", label: "나누기 질문", items: [{ text: `“${share.teacherQuestion}”`, origin: share.teacherQuestionOrigin }] });
  groups.push({ key: "cleanup", label: "재료 정리", items: [week.prep.cleanup] });
  const during = prepNotes(week.weekNo).filter((p) => p.when === "during");
  if (during.length) groups.push({ key: "worldmap", label: "우리 반 세계지도 (17~24주 공동작품)", items: during.flatMap((p) => [p.text, p.action]) });
  groups.push({ key: "observe", label: "관찰 포인트 확인", items: week.teacherObservations.items.map((text) => ({ text, origin: week.teacherObservations.origin })) });
  if (d?.familyTitle) {
    groups.push({
      key: "family",
      label: "가정연계 안내",
      items: [src(d.familyTitle), ...(d.parentNotice.length ? [src(d.parentNotice[0])] : [])],
    });
  }
  const nd = next ? weekDashboard(next.weekNo) : null;
  const nextItems: Sourced[] = [];
  if (next) {
    nextItems.push({ text: `${next.weekNo}주차 「${next.title}」 — 그림책 《${next.storybook}》`, origin: "edited" });
    for (const k of (nd?.kitItems ?? []).slice(0, 3)) nextItems.push(src(`${next.weekNo}주차 교구 · ${k}`));
  }
  if (nextItems.length) groups.push({ key: "next", label: "다음 주차 준비", items: nextItems });
  // 원문 한 칸에 「이번 주 결과물 → 다음 주」와 「앞 주차 → 이번 주」가 함께 적혀 있어 따로 둔다
  if (d?.crossWeek) groups.push({ key: "crossweek", label: "주차 연계 (자료 원문)", items: [src(d.crossWeek)] });
  if (week.extensions.length) {
    groups.push({
      key: "extension",
      label: "연계 활동 (워크북 · 작품 완성 · 가정연계)",
      items: week.extensions.map((x) => ({ text: x.title, origin: "edited" as const })),
    });
  }
  return groups;
}

/**
 * 미디어 보유 상태 — 실제로 공개된 파일만 「있음」이다.
 * ★ 지금 공개된 파일은 1~8주차 그림책 표지뿐이다. 음원 · 영상 · 워크북 · 교구 사진은 파일이 없다.
 *   자료에 이름만 있으면 「목록만」, 이름도 없으면 「자료 준비 중」.
 */
export function mediaStatus(week: ExperienceWeek): readonly MediaRow[] {
  const d = weekDashboard(week.weekNo);
  const ebook = [...week.body.materials, ...(d?.physicalMaterials ?? [])].some((m) => /E-?BOOK/i.test(m));
  return [
    week.image
      ? { key: "cover", label: "동화책 표지", state: "ready", detail: "소예키즈 동화책 표지 (공개 사용 확인)" }
      : { key: "cover", label: "동화책 표지", state: "pending", detail: "화면에는 자체 제작 그림을 씁니다" },
    { key: "ebook", label: "E-BOOK", state: ebook ? "listed" : "pending", detail: ebook ? "준비물에 E-BOOK 이 적혀 있습니다 · 파일은 없습니다" : "자료에 없습니다" },
    { key: "audio", label: "동화 음원", state: d?.media.length ? "listed" : "pending", detail: d?.media.length ? `${d.media.length}개 이름이 자료에 있습니다` : "자료에 없습니다" },
    { key: "video", label: "뮤직비디오", state: "pending", detail: "영상 파일이 없습니다" },
    {
      key: "workbook",
      label: "워크북 인쇄 파일",
      state: d?.workbookSheets.length ? "listed" : "pending",
      detail: d?.workbookSheets.length ? `${d.workbookSheets.length}장 구성이 자료에 있습니다 · 인쇄 파일은 없습니다` : "자료에 없습니다",
    },
    { key: "kitPhoto", label: "교구 사진", state: "pending", detail: d?.kitItems.length ? `구성품 ${d.kitItems.length}가지는 글로만 있습니다` : "자료에 없습니다" },
    { key: "example", label: "활동 예시 사진", state: "pending", detail: "실제 수업 사진은 쓰지 않습니다 (원아 사진 없음)" },
  ];
}

export { CHECK_STATE_NOTE, MATERIALS_ORIGIN, MEDIA_STATE_LABEL, SAFETY_ORIGIN } from "./lesson-labels";
export type { CheckGroup, MediaRow, MediaState } from "./lesson-labels";
