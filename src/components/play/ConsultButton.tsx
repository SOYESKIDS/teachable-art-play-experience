import { consultHref } from "@/data/site";
import { popButtonClass, type PopSize, type PopTone } from "./PopButton";

/**
 * 도입 문의 버튼 — 소개 사이트의 상담 폼으로 보낸다 (E-4).
 *
 * ── 왜 소개 사이트로 보내나 ───────────────────────────────────────────
 *
 * 전에는 홈 문의 영역(`/#contact`)으로만 갔다. 거기엔 전화번호와 메일 주소가 있어 연락은 되지만,
 * **어느 체험 화면이 상담으로 이어졌는지 알 수 없었다.** 체험 사이트가 아무것도 저장하지
 * 않기 때문이다. 그래서 접수는 이미 폼이 있는 소개 사이트에서 하고, 어디서 넘어왔는지는
 * 주소에 적어 보낸다.
 *
 * ★ 체험 사이트는 여전히 아무 정보도 받지 않는다. 여기서 집계하거나 전송하지 않는다 —
 *   utm 은 링크에 붙은 글자일 뿐이다.
 * ★ 전화 · 이메일 경로는 홈 「도입 문의」와 푸터에 그대로 둔다. 폼을 못 쓰는 사람의
 *   길을 막지 않는다.
 */
export function ConsultButton({
  children = "우리 유치원 도입 문의",
  medium,
  campaign,
  tone = "ink",
  size = "lg",
  className,
}: {
  children?: string;
  /** 어느 화면에서 왔는지 — classroom · week · report · weeks */
  medium: string;
  /** 주차처럼 더 좁은 구분이 필요할 때 (예: w4) */
  campaign?: string;
  tone?: PopTone;
  size?: PopSize;
  className?: string;
}) {
  return (
    <a
      href={consultHref(medium, campaign)}
      target="_blank"
      rel="noopener noreferrer"
      data-cta="consult"
      className={popButtonClass(tone, size, className)}
    >
      {children}
      <span className="sr-only"> (소개 사이트에서 열림)</span>
    </a>
  );
}
