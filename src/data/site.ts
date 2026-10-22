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

/**
 * 체험 → 상담 유입 경로 표시 (E-4).
 *
 * ★ 문의는 **소개 사이트의 상담 폼**으로 보낸다. 체험 사이트는 아무 정보도 받지 않는다는
 *   전제를 지키면서, 어떤 체험 화면에서 넘어왔는지는 소개 사이트에서 구분해 볼 수 있다.
 * ★ utm 값은 주소에 붙는 글자일 뿐이다. 이 사이트가 모으거나 보내지 않는다.
 */
export function consultHref(medium: string, campaign?: string): string {
  const url = new URL(CONTACT.salesSite);
  url.searchParams.set("utm_source", "experience");
  url.searchParams.set("utm_medium", medium);
  if (campaign) url.searchParams.set("utm_campaign", campaign);
  return url.toString();
}

/**
 * 「원장님께 전하기」 공유 (E-5).
 *
 * ★ 보내는 것은 **링크와 고정 문구뿐**이다. 누가 썼는지 · 몇 번 썼는지 남기지 않는다.
 * ★ 카카오 공식 공유 SDK 는 앱 키가 필요해 범위 밖이다 (문서 E-5).
 */
export const SHARE_MESSAGE =
  "원장님, 담임교사가 직접 운영하는 유치원 통합예술 수업이 있어 공유드립니다. TeachAble Art Play";

export function shareHref(path: string): string {
  const url = new URL(path, SITE_URL);
  url.searchParams.set("utm_source", "teacher_share");
  return url.toString();
}
