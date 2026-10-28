import { weekDashboard } from "./teacher-dashboard/week-dashboards";
import { pdfExtraOf } from "./teacher-dashboard/week-pdf-extra";

/**
 * 소예키즈 키즈보드 (학부모 앱) — 공개 체험에서 보는 주차별 연결.
 *
 * ★ 메뉴 이름 · 설명은 「24주 교안 데이터」 공통 콘텐츠(키즈보드 안내 이미지)의 원문이다.
 *   주차 PDF 는 1~8주에만 「키즈보드 메뉴 1~4주차 구성 (세트 A)」 · 「5~8주차 구성 (세트 B)」을 적었다.
 *   9~24주는 세트가 정해지지 않았다 (원 자료 「검수 필요 항목」 — 결정 필요). 화면은 「세트 미정」으로 두고
 *   두 세트의 메뉴를 모두 보이되 확정안처럼 말하지 않는다.
 * ★ 공개 체험에는 실제 사진 · 영상 공유, 아동 이름, 저장이 없다. 각 메뉴가 이 주차의 어떤 자료와 이어지는지만 보인다.
 */
export type KidsboardSetKey = "A" | "B";

export const KIDSBOARD_SOURCE = "24주 교안 데이터 · 공통 콘텐츠 (키즈보드 안내 이미지)";

export const KIDSBOARD_SETS: Readonly<Record<KidsboardSetKey, { label: string; items: readonly { name: string; desc: string | null }[] }>> = {
  A: {
    label: "1~4주차 구성 (세트 A)",
    items: [
      { name: "활동사진", desc: "오늘의 활동을 사진으로 확인해요." },
      { name: "성장데이터", desc: "출석, 활동 참여, 발달 영역별 기록을 확인해요." },
      { name: "선생님의 따뜻한 기록", desc: "아이의 노력과 성장을 따뜻한 글로 남겨요." },
      { name: "소예키즈의 기록", desc: "우리 아이의 성장 여정을 한눈에 확인해요." },
    ],
  },
  B: {
    label: "5~8주차 구성 (세트 B)",
    items: [
      { name: "활동 안내 영상", desc: null },
      { name: "활동 영상", desc: null },
      { name: "워크북 자료", desc: null },
      { name: "교구 활동 팁", desc: null },
      { name: "활동 사진 공유", desc: null },
    ],
  },
};

/** 주차 PDF 에 적힌 세트 — 9~24주는 null (미정) */
export function kidsboardSetFor(weekNo: number): KidsboardSetKey | null {
  if (weekNo >= 1 && weekNo <= 4) return "A";
  if (weekNo >= 5 && weekNo <= 8) return "B";
  return null;
}

/**
 * 공개 체험 상태
 * - week: 이 주차 PDF 자료가 화면에 있다 (원문)
 * - virtual: 가상 자료로 체험한다 (성장 분석 · 리포트)
 * - pending: 파일이 오면 보인다 (자료 준비 중)
 * - saas: 실제 아동 사진 · 기록 공유 — 기관용 서비스(2027)에서만
 */
export type KidsboardState = "week" | "virtual" | "pending" | "saas";

export const KIDSBOARD_STATE_LABEL: Readonly<Record<KidsboardState, string>> = {
  week: "이 주차 자료 있음",
  virtual: "가상 자료로 체험",
  pending: "자료 준비 중",
  saas: "기관용 서비스 (2027)",
};

export interface KidsboardRow {
  set: KidsboardSetKey;
  name: string;
  desc: string | null;
  state: KidsboardState;
  /** 이 주차에서 이 메뉴에 들어갈 것 (주차 자료 · 공개 체험 범위) */
  thisWeek: string;
  href: string | null;
}

export function kidsboardRows(weekNo: number): readonly KidsboardRow[] {
  const d = weekDashboard(weekNo);
  const x = pdfExtraOf(weekNo);
  if (!d) return [];
  const acts = [d.physicalTitle, d.physical2?.title, d.artTitle].filter(Boolean).join(" · ");
  const tip = x?.kitUse ?? d.activityTip;
  const row = (set: KidsboardSetKey, i: number, state: KidsboardState, thisWeek: string, href: string | null = null): KidsboardRow => ({
    set, name: KIDSBOARD_SETS[set].items[i].name, desc: KIDSBOARD_SETS[set].items[i].desc, state, thisWeek, href,
  });
  return [
    row("A", 0, "saas", `실제 활동 사진은 공개 체험에서 받지 않습니다. 이 주차 활동 — ${acts || "자료에서 확인하지 못했습니다"}`, `/experience/classroom/${weekNo}`),
    row("A", 1, "virtual", "가상 원아의 관찰 기록으로 이 주차 활동 → 관찰 문항 → 5대 성장지표 흐름을 봅니다 (출석 기록 없음).", `/experience/growth-demo?week=${weekNo}`),
    row("A", 2, d.kidsnote ? "week" : "pending", d.kidsnote ? `성장기록 예시 (자료 원문) — ${d.kidsnote}` : d.missingInSource.includes("성장기록 예시") ? "자료 원문에 「미작성」으로 적혀 있습니다." : "자료에서 확인하지 못했습니다."),
    row("A", 3, "virtual", "가상 원아의 주간 성장리포트 예시를 봅니다 — 성장분석 체험에서 승인하면 이 주차 리포트 미리보기가 열립니다.", "/experience/report"),
    row("B", 0, "pending", `영상 파일 준비 중${x?.videoDesc ? ` — 자료 설명: ${x.videoDesc}` : ""}`),
    row("B", 1, "saas", "아이들이 활동하는 영상은 공개 체험에서 받거나 보내지 않습니다."),
    row("B", 2, d.workbookSheets.length ? "week" : "pending", d.workbookSheets.length ? `워크북 ${d.workbookSheets.length}장 — ${d.workbookSheets.map((s) => s.title).join(" · ")} (인쇄 파일 준비 중)` : "자료에서 확인하지 못했습니다."),
    row("B", 3, tip ? "week" : "pending", tip ? `교구 · 활동 TIP (자료 원문) — ${tip}` : "자료에서 확인하지 못했습니다."),
    row("B", 4, "saas", "실제 사진 공유는 보호자 동의 범위 안에서 기관용 서비스에서만 합니다."),
  ];
}
