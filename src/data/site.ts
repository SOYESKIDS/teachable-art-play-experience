/**
 * 공개 체험 사이트의 연락처 · 회사 표기 · 외부 링크.
 *
 * ★ 이 사이트는 아무것도 저장하지 않는다. 도입 문의는 전화 · 이메일 · 기존 영업 사이트로 받는다.
 */
export const SITE_URL = "https://teachable-art-play-experience.vercel.app";

export const CONTACT = {
  phone: "02-303-4420",
  phoneHref: "tel:023034420",
  email: "soyes2013@gmail.com",
  emailHref: "mailto:soyes2013@gmail.com?subject=%5BTeachAble%20Art%20Play%5D%20%EB%8F%84%EC%9E%85%20%EB%AC%B8%EC%9D%98",
  salesSite: "https://teachable-art-play-sales.vercel.app/",
} as const;

export const COMPANY = {
  name: "주식회사 소예키즈 (SOYE KIDS Co., Ltd.)",
  service: "TeachAble Art Play",
  ceo: "백향은",
  businessNo: "371-86-01244",
  copyright: "© SOYE KIDS Co., Ltd.",
} as const;


/** 체험 화면 이름 — 메일에 어느 화면에서 왔는지 적는 데 쓴다 */
export const EXPERIENCE_SCREEN_LABEL = {
  classroom: "교실 플레이어",
  week: "주차 상세",
  report: "성장 리포트",
  weeks: "둘러보기",
} as const;

export type ExperienceScreen = keyof typeof EXPERIENCE_SCREEN_LABEL;

/**
 * 도입 상담 안내 페이지 (E-4).
 *
 * ★ 소개 사이트에는 **상담 폼이 없다.** 전화와 이메일로 받는 안내 페이지다.
 *   「폼으로 간다」고 쓰면 열었을 때 없는 것을 찾게 된다.
 * ★ utm 은 주소에 붙는 글자일 뿐이다. 이 사이트에는 집계 장치가 없으므로
 *   **방문이나 상담 전환이 자동으로 세어진다고 말하지 않는다.**
 */
export function consultHref(medium: ExperienceScreen, campaign?: string): string {
  const url = new URL("contact", CONTACT.salesSite);
  url.searchParams.set("utm_source", "experience");
  url.searchParams.set("utm_medium", medium);
  if (campaign) url.searchParams.set("utm_campaign", campaign);
  return url.toString();
}

/**
 * 이메일 문의 (E-4 · B 동선).
 *
 * ★ 메일 앱에 **어느 화면에서 왔는지만** 미리 적어 둔다. 기관명 · 담당자 ·
 *   연락처는 빈 칸으로 두고 보내는 사람이 직접 쓴다 — 이 사이트는 개인정보를
 *   모으지도 보내지도 않는다. 메일은 사용자의 메일 앱이 보내는 것이다.
 * ★ 제목과 본문은 encodeURIComponent 로 바꾼다. 줄 나누는 문자 · 기호와 한글이
 *   그대로 들어가면 메일 앱마다 다르게 끊어 읽는다.
 */
export function inquiryMailtoHref(screen: ExperienceScreen, weekNo?: number): string {
  const subject = "[TeachAble Art Play] 도입 문의";
  const lines = [
    "아래 항목을 채워 보내 주세요.",
    "",
    "· 기관명 :",
    "· 담당자 :",
    "· 연락처 :",
    "· 문의 내용 :",
    "",
    "— 체험 정보 —",
    "· 체험 출처 : TeachAble Art Play 무료 체험",
    `· 체험 화면 : ${EXPERIENCE_SCREEN_LABEL[screen]}`,
    ...(weekNo ? [`· 체험 주차 : ${weekNo}주차`] : []),
  ];
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}

/**
 * 「원장님께 전하기」 공유 (E-5).
 *
 * ★ 보내는 것은 **링크와 고정 문구뿐**이다. 원아 이름 · 연락처 · 사진 · 기록은
 *   들어가지 않는다. 누가 썼는지 · 몇 번 썼는지 남기지 않는다.
 * ★ 카카오 공식 공유 SDK 는 앱 키가 필요해 범위 밖이다 (문서 E-5).
 */
export const SHARE_MESSAGE =
  "원장님, 담임교사가 직접 운영하는 유치원 통합예술 수업이 있어 공유드립니다. TeachAble Art Play";

export function shareHref(path: string): string {
  const url = new URL(path, SITE_URL);
  url.searchParams.set("utm_source", "teacher_share");
  return url.toString();
}
