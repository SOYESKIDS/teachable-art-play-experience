import Link from "next/link";
import { popButtonClass, type PopSize, type PopTone } from "./PopButton";

/**
 * 도입 문의 버튼 — 홈의 문의 안내(#contact: 전화 · 이메일 · 영업 사이트)로 이동한다.
 *
 * ★ 공개 체험 사이트에는 문의를 저장하는 폼이 없다. 아무 정보도 받지 않는다.
 */
export function ConsultButton({
  children = "우리 유치원 도입 문의",
  tone = "ink",
  size = "lg",
  className,
}: {
  children?: string;
  tone?: PopTone;
  size?: PopSize;
  className?: string;
}) {
  return (
    <Link href="/#contact" data-cta="consult" className={popButtonClass(tone, size, className)}>
      {children}
    </Link>
  );
}
