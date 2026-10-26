import type { ExperienceImage } from "./types";

/**
 * 주차 그림책 표지 — 소예키즈 제공 자료 가운데 **내용이 확인된 1~8주차만** 쓴다.
 *
 * ── 왜 8장뿐인가 ───────────────────────────────────────────────
 *
 * 받은 16장 가운데 9~16주차로 이름 붙은 8장은 그림 속 제목이 모두
 * 1~8주차 수업이었다 (예: 「9주_안녕봄아」 안에 「EP 01. 유치원 가는 날」).
 * 주차 번호만 보고 그대로 걸면 9주차 화면에 1주차 표지가 올라간다.
 * 그래서 **공개 등록에서 뺐다.** 파일을 지우거나 다른 주차로 옮기지 않았다 —
 * 원본 16장은 프로젝트 밖에 그대로 보관한다.
 *
 * ── 화면용 파생본 ──────────────────────────────────────────────
 *
 * ★ 화면이 받는 것은 WebP 로 만든 파생본이다. 원본 PNG 는 덮어쓰지 않았고 파일명도
 *   그대로다. 어느 원본에서 나왔는지는 docs/images/week-cover-mapping.md 에 적었다.
 * ★ 비율을 바꾸지 않았다. 가로 1200 을 넘을 때만 줄였다 — 표지 제목 글씨의
 *   선명도를 먼저 본다.
 *
 * ── 사용권 ─────────────────────────────────────────────────────
 *
 * ★ 소예키즈가 준 자료로 다루되 **외부 공개 사용권 증빙은 아직 확인되지 않았다.**
 * ★ 그래서 사용권이 확인되기 전에는 **파일 자체를 저장소에 두지 않는다.**
 *   Vercel 은 public/ 을 그대로 내보낸다 — 화면이 싣지 않아도 public/ 에 있으면 주소로 받힌다
 *   (2026-10-26 Preview 에서 실제로 200 이었다. 빌드 뒤 out/ 을 지우는 방식은 효과가 없었다).
 *   파생본 8장 · SHA256 은 프로젝트 밖 `_백업_체험사이트자료/화면용파생본8장_week-covers-web/` 에 있다.
 * ★ 사용권 증빙을 받은 뒤 다시 싣는 절차 (docs/images/week-cover-mapping.md §8):
 *   ① 백업 폴더의 8장을 public/images/week-covers-web/ 로 복사하고 SHA256 을 대조한다
 *   ② LICENSE_STATUS 를 "confirmed" 로 바꾼다 ③ npm test (public 허용 목록이 함께 바뀐다)
 *   ④ Preview 에서 8장 200 · 화면 표시를 확인한 뒤 출시한다.
 */

export type LicenseStatus = "unconfirmed" | "confirmed";

/** 공개 사용권 확인 상태 — 확인되면 "confirmed" 로 바꾼다 */
export const LICENSE_STATUS: LicenseStatus = "unconfirmed";

export function coversPublished(status: LicenseStatus): boolean {
  return status === "confirmed";
}

export const MEDIA: Record<string, ExperienceImage> = {};

/** 내용이 확인된 1~8주차 표지 등록부 — 사용권과 관계없이 그대로 둔다 */
export const WEEK_COVER_REGISTRY: Partial<Record<number, ExperienceImage>> = {
  1: {
    src: "/images/week-covers-web/week-01.webp",
    alt: "1주차 그림책 표지",
    width: 1200,
    height: 1097,
  },
  2: {
    src: "/images/week-covers-web/week-02.webp",
    alt: "2주차 그림책 표지",
    width: 1200,
    height: 1097,
  },
  3: {
    src: "/images/week-covers-web/week-03.webp",
    alt: "3주차 그림책 표지",
    width: 1200,
    height: 1097,
  },
  4: {
    src: "/images/week-covers-web/week-04.webp",
    alt: "4주차 그림책 표지",
    width: 1200,
    height: 1097,
  },
  5: {
    src: "/images/week-covers-web/week-05.webp",
    alt: "5주차 그림책 표지",
    width: 1200,
    height: 1097,
  },
  6: {
    src: "/images/week-covers-web/week-06.webp",
    alt: "6주차 그림책 표지",
    width: 1200,
    height: 1097,
  },
  7: {
    src: "/images/week-covers-web/week-07.webp",
    alt: "7주차 그림책 표지",
    width: 1200,
    height: 1097,
  },
  8: {
    src: "/images/week-covers-web/week-08.webp",
    alt: "8주차 그림책 표지",
    width: 1200,
    height: 1097,
  },
};

/** 화면이 실제로 싣는 주차 표지 — 사용권이 확인되기 전에는 비어 있다 */
export const WEEK_MEDIA: Partial<Record<number, ExperienceImage>> = coversPublished(LICENSE_STATUS)
  ? WEEK_COVER_REGISTRY
  : {};

/** 보안 테스트가 대조하는 실제 배포 파일 목록 */
export const WEEK_IMAGE_FILES: readonly string[] = [
  "public/images/week-covers-web/week-01.webp",
  "public/images/week-covers-web/week-02.webp",
  "public/images/week-covers-web/week-03.webp",
  "public/images/week-covers-web/week-04.webp",
  "public/images/week-covers-web/week-05.webp",
  "public/images/week-covers-web/week-06.webp",
  "public/images/week-covers-web/week-07.webp",
  "public/images/week-covers-web/week-08.webp",
];
