import { guideSummary, type GuideSummary } from "./guide-summaries";
import type { DashStep, WeekDashboard } from "./week-dashboards";

/**
 * 공식 교사용 수업가이드 요약 → 교사 대시보드 12개 영역 — 2026-10-29 승인 제목 주차(14 · 17~24).
 *
 * ★ 공개 체험에는 요약(guide-summaries.ts)만 싣는다. 가이드 원문 전체는 회사 지식재산이라 공개 저장소 밖에 비공개로 둔다.
 * ★ 요약에 없는 칸(교구 키트 목록 · 가정용 교구 · 기록 예시 · 안내 문구 · 주차 연계 · 그림 자리)은 비워 두고,
 *   화면이 「자료에서 확인하지 못했습니다」로 적는다. 같은 주차 자료 PDF(다른 주제)의 내용으로 채우지 않는다.
 * ★ 같은 주차의 자료 PDF 데이터는 week-dashboards.ts 에 보관만 한다.
 */
function fromSummary(s: GuideSummary): WeekDashboard {
  return {
    weekNo: s.weekNo,
    pdfTitle: s.title,
    keyword: s.growthKeyword,
    part: null,
    place: null,
    coreTheme: s.theme,
    teacherKey: null,
    dataSource: "공식 교사용 수업가이드 (공개 체험용 요약 · 원문은 기관 서비스에서 제공)",
    // 가이드의 시간 표기는 이전 가이드 시간 — official-plan.ts 가 출처 기록으로 적는다 (운영 기준은 기본 45분)
    pdfDuration: null,
    ageRange: null,
    storybookTitle: s.title,
    storySummary: null,
    storyMessage: s.coreMessage,
    physicalTitle: s.physical?.title ?? null,
    // 활동 소개 단락은 공개하지 않는다 — 첫 놀이의 활동 예시 한 줄(공개 요약)로 소개한다
    physicalLead: s.physical?.plays[0]?.example ?? null,
    physicalSteps: (s.physical?.plays ?? []).map((p): DashStep => ({ title: p.title, guide: p.example })),
    physicalMaterials: s.physical?.materials ?? [],
    coreExperience: s.experienceFlow.length ? s.experienceFlow.join(" → ") : null,
    activityTip: null,
    artTitle: s.art?.title ?? null,
    artLead: null,
    artSteps: s.art?.steps ?? [],
    workbookTitle: s.workbook?.title ?? null,
    workbookSheets: (s.workbook?.sheets ?? []).map((t): DashStep => ({ title: t, guide: "" })),
    kitItems: [],
    orgItems: s.materials,
    familyTitle: s.family?.title ?? null,
    familyHow: s.family?.summary ? [s.family.summary] : [],
    familyTalk: [],
    homeKitName: null,
    homeKitLead: null,
    homeKitItems: [],
    homeKitHow: [],
    nuri: s.goals.map((g) => ({ area: g.area, items: [g.goal] })),
    observations: s.observations,
    goals: s.goals.map((g) => g.goal),
    kidsnote: null,
    parentNotice: [],
    teacherPoint: null,
    crossWeek: null,
    media: s.linkedContents,
    mediaPending: true,
    missingInSource: s.family?.status === "undecided" ? ["가족연계"] : [],
    sourceKind: "officialGuide",
  };
}

/** 공식 가이드 기준 주차면 그 대시보드, 아니면 null */
export function guideDashboard(weekNo: number): WeekDashboard | null {
  const s = guideSummary(weekNo);
  return s ? fromSummary(s) : null;
}
