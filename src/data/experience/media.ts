import type { ExperienceImage } from "./types";

/**
 * 주차 그림책 표지 — 소예키즈가 제공한 자료 (1~16주차).
 *
 * ── 사용권 ─────────────────────────────────────────────────────
 *
 * ★ 소예키즈가 직접 준 자료로 다룬다. 다만 **외부 공개 사용권 증빙은 아직
 *   확인되지 않았다.** 배포 전에 확인이 필요하다 (LICENSE_STATUS 참고).
 * ★ 17~24주차는 표지가 없다. 그 주차는 지금처럼 자체 제작 SVG(WeekArt)로 그린다.
 *   빈칸이나 깨진 그림을 두지 않는다.
 *
 * ── 주소 ───────────────────────────────────────────────────────
 *
 * ★ 파일명은 **바꾸지 않았다.** 한글 · 공백 · 문장부호가 들어 있어 주소로
 *   쓸 때만 퍼센트로 바꾼다. 이름을 바꾸면 원본 자료와 대조할 수 없다.
 * ★ width · height 는 파일에서 실제로 읽은 값이다. 1~8주차는 거의 정사각형
 *   (1312x1199), 9~16주차는 16:9 로 **비율이 서로 다르다.** 한 칸에 억지로
 *   맞추면 제목과 캐릭터가 잘린다 → WeekArt 는 object-contain 으로 그린다.
 */

/** 공개 사용권 확인 상태 — 확인되면 "confirmed" 로 바꾼다 */
export const LICENSE_STATUS = "unconfirmed" as const;

export const MEDIA: Record<string, ExperienceImage> = {};

/** 주차 전용 그림 — 1~16주차만 있다 */
export const WEEK_MEDIA: Partial<Record<number, ExperienceImage>> = {
  1: {
    src: "/images/24%EC%A3%BC%20%EC%88%98%EC%97%85%20%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EA%B5%90%EC%B2%B4/1%EC%A3%BC%EC%B0%A8_%EC%9C%A0%EC%B9%98%EC%9B%90%20%EA%B0%80%EB%8A%94%20%EB%82%A0.png",
    alt: "1주차 그림책 표지 — 유치원 가는 날",
    width: 1312,
    height: 1199,
  },
  2: {
    src: "/images/24%EC%A3%BC%20%EC%88%98%EC%97%85%20%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EA%B5%90%EC%B2%B4/2%EC%A3%BC%EC%B0%A8_%EB%81%9D%EA%B9%8C%EC%A7%80%20%ED%95%B4%EB%B3%B4%EC%9E%90.png",
    alt: "2주차 그림책 표지 — 끝까지 해보자",
    width: 1312,
    height: 1199,
  },
  3: {
    src: "/images/24%EC%A3%BC%20%EC%88%98%EC%97%85%20%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EA%B5%90%EC%B2%B4/3%EC%A3%BC%EC%B0%A8_%EB%A7%88%EC%9D%8C%EC%9D%84%20%EB%A7%90%ED%95%B4%EC%9A%94.png",
    alt: "3주차 그림책 표지 — 마음을 말해요",
    width: 1312,
    height: 1199,
  },
  4: {
    src: "/images/24%EC%A3%BC%20%EC%88%98%EC%97%85%20%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EA%B5%90%EC%B2%B4/4%EC%A3%BC%EC%B0%A8_%EC%86%8C%EC%98%88%EC%9D%98%20%EC%94%A8%EC%95%97.png",
    alt: "4주차 그림책 표지 — 소예의 씨앗",
    width: 1312,
    height: 1199,
  },
  5: {
    src: "/images/24%EC%A3%BC%20%EC%88%98%EC%97%85%20%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EA%B5%90%EC%B2%B4/5%EC%A3%BC%EC%B0%A8_%EC%9A%B0%EB%A6%B0%20%EB%AA%A8%EB%91%90%20%ED%8A%B9%EB%B3%84%ED%95%B4.png",
    alt: "5주차 그림책 표지 — 우린 모두 특별해",
    width: 1312,
    height: 1199,
  },
  6: {
    src: "/images/24%EC%A3%BC%20%EC%88%98%EC%97%85%20%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EA%B5%90%EC%B2%B4/6%EC%A3%BC%EC%B0%A8_%EC%9A%B0%EB%A6%AC%EB%93%A4%EC%9D%98%20%EB%B9%84%EB%B0%80%EA%B8%B0%EC%A7%80.png",
    alt: "6주차 그림책 표지 — 우리들의 비밀기지",
    width: 1312,
    height: 1199,
  },
  7: {
    src: "/images/24%EC%A3%BC%20%EC%88%98%EC%97%85%20%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EA%B5%90%EC%B2%B4/7%EC%A3%BC%EC%B0%A8_%EB%82%98%EB%B9%84%EC%95%BC%2C%20%EB%86%80%EB%9D%BC%EC%99%80%21.png",
    alt: "7주차 그림책 표지 — 나비야, 놀라와!",
    width: 1312,
    height: 1199,
  },
  8: {
    src: "/images/24%EC%A3%BC%20%EC%88%98%EC%97%85%20%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EA%B5%90%EC%B2%B4/8%EC%A3%BC_%EC%9A%B0%EB%A6%AC%EB%93%A4%EC%9D%98%20%EC%88%B2.png",
    alt: "8주차 그림책 표지 — 우리들의 숲",
    width: 1312,
    height: 1199,
  },
  9: {
    src: "/images/24%EC%A3%BC%20%EC%88%98%EC%97%85%20%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EA%B5%90%EC%B2%B4/9%EC%A3%BC_%EC%95%88%EB%85%95%EB%B4%84%EC%95%84.png",
    alt: "9주차 그림책 표지 — 안녕봄아",
    width: 557,
    height: 312,
  },
  10: {
    src: "/images/24%EC%A3%BC%20%EC%88%98%EC%97%85%20%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EA%B5%90%EC%B2%B4/10%EC%A3%BC_%EB%84%88%EB%AC%B4%EB%9C%A8%EA%B2%81%EC%9E%96%EC%95%84.png",
    alt: "10주차 그림책 표지 — 너무뜨겁잖아",
    width: 1672,
    height: 941,
  },
  11: {
    src: "/images/24%EC%A3%BC%20%EC%88%98%EC%97%85%20%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EA%B5%90%EC%B2%B4/11%EC%A3%BC_%EC%9E%90%21%EB%96%A0%EB%82%98%EC%9E%90.png",
    alt: "11주차 그림책 표지 — 자!떠나자",
    width: 752,
    height: 437,
  },
  12: {
    src: "/images/24%EC%A3%BC%20%EC%88%98%EC%97%85%20%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EA%B5%90%EC%B2%B4/12%EC%A3%BC_%EC%84%B8%EC%83%81%EC%9D%80%20%EC%95%8C%EB%A1%9D%EB%8B%AC%EB%A1%9D.png",
    alt: "12주차 그림책 표지 — 세상은 알록달록",
    width: 2730,
    height: 1536,
  },
  13: {
    src: "/images/24%EC%A3%BC%20%EC%88%98%EC%97%85%20%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EA%B5%90%EC%B2%B4/13%EC%A3%BC_%EB%8F%99%EA%B8%80%EB%8F%99%EA%B8%80%20%EB%B3%B4%EB%A6%84%EB%8B%AC.png",
    alt: "13주차 그림책 표지 — 동글동글 보름달",
    width: 944,
    height: 528,
  },
  14: {
    src: "/images/24%EC%A3%BC%20%EC%88%98%EC%97%85%20%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EA%B5%90%EC%B2%B4/14%EC%A3%BC_%EB%A7%90%ED%95%98%EC%A7%80%20%EC%95%8A%EC%95%84%EB%8F%84%20%EA%B4%9C%EC%B0%AE%EC%95%84%21.png",
    alt: "14주차 그림책 표지 — 말하지 않아도 괜찮아!",
    width: 1672,
    height: 941,
  },
  15: {
    src: "/images/24%EC%A3%BC%20%EC%88%98%EC%97%85%20%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EA%B5%90%EC%B2%B4/15%EC%A3%BC_%EB%94%B0%EB%9C%BB%ED%95%9C%20%EC%86%8C%EB%A6%AC%EA%B0%80%20%EB%93%A4%EB%A0%A4%EC%9A%94.png",
    alt: "15주차 그림책 표지 — 따뜻한 소리가 들려요",
    width: 1672,
    height: 941,
  },
  16: {
    src: "/images/24%EC%A3%BC%20%EC%88%98%EC%97%85%20%EC%9D%B4%EB%AF%B8%EC%A7%80%20%EA%B5%90%EC%B2%B4/16%EC%A3%BC_%EB%82%98%EB%B9%84%EC%95%BC%EB%86%80%EB%9F%AC%EC%99%80.png",
    alt: "16주차 그림책 표지 — 나비야놀러와",
    width: 1672,
    height: 941,
  },
};

/** 보안 테스트가 읽는 허용 목록 — public 에 둘 수 있는 그림 (로고 제외) */
export const WEEK_IMAGE_FILES: readonly string[] = [
  "public/images/24주 수업 이미지 교체/1주차_유치원 가는 날.png",
  "public/images/24주 수업 이미지 교체/2주차_끝까지 해보자.png",
  "public/images/24주 수업 이미지 교체/3주차_마음을 말해요.png",
  "public/images/24주 수업 이미지 교체/4주차_소예의 씨앗.png",
  "public/images/24주 수업 이미지 교체/5주차_우린 모두 특별해.png",
  "public/images/24주 수업 이미지 교체/6주차_우리들의 비밀기지.png",
  "public/images/24주 수업 이미지 교체/7주차_나비야, 놀라와!.png",
  "public/images/24주 수업 이미지 교체/8주_우리들의 숲.png",
  "public/images/24주 수업 이미지 교체/9주_안녕봄아.png",
  "public/images/24주 수업 이미지 교체/10주_너무뜨겁잖아.png",
  "public/images/24주 수업 이미지 교체/11주_자!떠나자.png",
  "public/images/24주 수업 이미지 교체/12주_세상은 알록달록.png",
  "public/images/24주 수업 이미지 교체/13주_동글동글 보름달.png",
  "public/images/24주 수업 이미지 교체/14주_말하지 않아도 괜찮아!.png",
  "public/images/24주 수업 이미지 교체/15주_따뜻한 소리가 들려요.png",
  "public/images/24주 수업 이미지 교체/16주_나비야놀러와.png",
];
