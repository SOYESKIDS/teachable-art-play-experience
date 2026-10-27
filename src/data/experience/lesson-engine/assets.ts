import type { MediaState } from "../lesson-labels";
import type { Sourced, StageKey } from "../types";
import { WEEK_MEDIA } from "../media";
import { weekDashboard } from "../teacher-dashboard/week-dashboards";
import { MEDIA_SLOT_IDS } from "./media-slots-generated";

/**
 * 주차 자료 등록부 — 그림 자리 ID 는 PDF 원문의 ID 를 그대로 쓴다 (w4.physical0.step.0 …).
 *
 * ★ 「있음(ready)」은 실제로 공개된 파일뿐이다 — 지금은 1~8주차 그림책 표지(media.ts)만.
 * ★ 음원 · E-BOOK 은 PDF 에 그림 자리 ID 가 없다. 같은 규칙으로 `wN.media.audio.K` · `wN.storybook.ebook.0` 을 붙이고
 *   derived 로 표시한다 (PDF 에 이름이 적혀 있을 때만).
 * ★ 파일이 없는 자리마다 「대체 운영」을 교사용 제안으로 단다 — 자료가 없어도 수업이 멈추지 않게.
 */
export type AssetKind =
  | "weekHero" | "storybookCover" | "ebook" | "physicalStep" | "artExample" | "workbookPage"
  | "kitPhoto" | "kitExample" | "supportKit" | "supportExample" | "supportStep"
  | "familyHero" | "familyExample" | "video" | "audioCharacter" | "audioTrack";

export interface LessonAsset {
  id: string;
  weekNo: number;
  kind: AssetKind;
  label: string;
  state: MediaState;
  /** PDF 에 ID 가 없어 같은 규칙으로 붙인 것 */
  derived: boolean;
  /** 이 자료를 쓰는 수업 단계 · 확장활동 */
  usedIn: readonly (StageKey | "extension" | "family")[];
  /** 공개 파일 주소 (ready 일 때만) */
  src: string | null;
  /** 파일이 없을 때 수업을 이어 가는 방법 — 교사용 제안 */
  fallback: Sourced | null;
}

const KIND_INFO: Record<AssetKind, { label: string; usedIn: LessonAsset["usedIn"]; fallback: string | null }> = {
  weekHero: { label: "주차 대표 그림", usedIn: ["open"], fallback: "화면에는 자체 제작 주제 그림을 씁니다." },
  storybookCover: { label: "그림책 표지", usedIn: ["story"], fallback: "실물 그림책 표지를 들어 보여 주세요 (화면은 자체 제작 그림)." },
  ebook: { label: "E-BOOK", usedIn: ["story"], fallback: "E-BOOK 파일이 없으면 실물 그림책으로 읽어 주세요." },
  physicalStep: { label: "신체활동 단계 사진", usedIn: ["move"], fallback: "사진 없이 선생님이 먼저 동작을 보여 주고 아이들이 따라 해요." },
  artExample: { label: "미술 과정 · 완성 예시", usedIn: ["make"], fallback: "선생님이 미리 만든 견본 하나를 보여 주세요." },
  workbookPage: { label: "워크북 페이지", usedIn: ["extension"], fallback: "워크북 실물이 있을 때 기본 수업 뒤 확장활동으로 해요." },
  kitPhoto: { label: "교구 키트 사진", usedIn: ["move", "make"], fallback: "실물 교구를 꺼내 보여 주세요." },
  kitExample: { label: "교구 활용 예시", usedIn: ["move", "make"], fallback: "선생님이 먼저 교구를 써 보는 시범을 보여 주세요." },
  supportKit: { label: "지원자료 구성품", usedIn: ["family"], fallback: "구성품 목록(대시보드 8번 영역)으로 확인해요." },
  supportExample: { label: "지원자료 완성 예시", usedIn: ["family"], fallback: "완성 예시 대신 구성품 · 방법 글로 안내해요." },
  supportStep: { label: "지원자료 준비 단계", usedIn: ["family"], fallback: "준비 단계 글(대시보드 8번 영역)을 따라 해요." },
  familyHero: { label: "가족 활동 대표 그림", usedIn: ["share", "family"], fallback: "인쇄용 수업 요약의 가족연계 안내문을 보내요." },
  familyExample: { label: "가족 활동 완성 예시", usedIn: ["family"], fallback: "완성 예시 대신 활동 방법 글로 안내해요." },
  video: { label: "뮤직비디오", usedIn: ["story"], fallback: "영상 대신 그림책 장면을 다시 보며 이야기해요." },
  audioCharacter: { label: "음원 캐릭터 그림", usedIn: ["move"], fallback: "그림 없이 노래 이름만 알려 주세요." },
  audioTrack: { label: "동화 음원", usedIn: ["move"], fallback: "음원이 없으면 손뼉 · 교실 악기로 리듬을 만들어요." },
};

function kindOf(id: string): AssetKind | null {
  const k = id.replace(/^w\d+\./, "");
  if (k.startsWith("meta.hero")) return "weekHero";
  if (k.startsWith("storybook.cover")) return "storybookCover";
  if (/^physical\d+\.step/.test(k)) return "physicalStep";
  if (k.startsWith("art.example")) return "artExample";
  if (k.startsWith("workbook.worksheet")) return "workbookPage";
  if (k.startsWith("kit.kit")) return "kitPhoto";
  if (k.startsWith("kit.example")) return "kitExample";
  if (/^support\d+\.kit/.test(k)) return "supportKit";
  if (/^support\d+\.example/.test(k)) return "supportExample";
  if (/^support\d+\.step/.test(k)) return "supportStep";
  if (k.startsWith("family.hero")) return "familyHero";
  if (k.startsWith("family.example")) return "familyExample";
  if (k.startsWith("media.video")) return "video";
  if (k.startsWith("media.character")) return "audioCharacter";
  return null;
}

/** 신체활동 단계 사진 ID → 몇 번째 신체활동(physical0 · physical1)인가 */
export function physicalIndexOf(id: string): number | null {
  const m = id.match(/^w\d+\.physical(\d+)\.step/);
  return m ? Number(m[1]) : null;
}

export function weekAssets(weekNo: number): readonly LessonAsset[] {
  const d = weekDashboard(weekNo);
  const cover = WEEK_MEDIA[weekNo] ?? null;
  const make = (id: string, kind: AssetKind, derived: boolean, label?: string): LessonAsset => {
    const ready = kind === "storybookCover" && cover !== null;
    const info = KIND_INFO[kind];
    const listed = kind === "audioTrack" || kind === "ebook";
    return {
      id,
      weekNo,
      kind,
      label: label ?? info.label,
      state: ready ? "ready" : listed ? "listed" : "pending",
      derived,
      usedIn: info.usedIn,
      src: ready ? cover.src : null,
      fallback: ready || !info.fallback ? null : { text: info.fallback, origin: "proposal" },
    };
  };
  const out: LessonAsset[] = [];
  for (const id of MEDIA_SLOT_IDS[weekNo] ?? []) {
    const kind = kindOf(id);
    if (kind) out.push(make(id, kind, false));
  }
  const ebook = (d?.physicalMaterials ?? []).some((m) => /E-?BOOK/i.test(m));
  if (ebook) out.push(make(`w${weekNo}.storybook.ebook.0`, "ebook", true));
  (d?.media ?? []).forEach((name, i) => out.push(make(`w${weekNo}.media.audio.${i}`, "audioTrack", true, `동화 음원 · ${name}`)));
  return out;
}
