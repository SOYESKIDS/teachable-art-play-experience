import { inquiryMailtoHref, type ExperienceScreen } from "@/data/site";
import { popButtonClass, type PopSize, type PopTone } from "./PopButton";

/**
 * 이메일 문의 버튼 (E-4 · B 동선).
 *
 * ★ 메일 앱에 **어느 화면에서 왔는지만** 미리 적어 둔다. 기관명 · 담당자 ·
 *   연락처는 빈 칸이고 보내는 사람이 직접 쓴다. 이 사이트는 개인정보를
 *   모으지도 보내지도 않는다 — 메일은 사용자의 메일 앱이 보낸다.
 * ★ 메일 앱이 없는 PC 도 있다. 그래서 전화와 안내 페이지 경로를 함께 둔다.
 */
export function EmailInquiryButton({
  children = "이메일로 문의하기",
  screen,
  weekNo,
  tone = "white",
  size = "md",
  className,
}: {
  children?: string;
  screen: ExperienceScreen;
  weekNo?: number;
  tone?: PopTone;
  size?: PopSize;
  className?: string;
}) {
  return (
    <a
      href={inquiryMailtoHref(screen, weekNo)}
      data-cta="email"
      className={popButtonClass(tone, size, className)}
    >
      {children}
    </a>
  );
}
