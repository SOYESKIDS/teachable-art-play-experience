import { consultHref, type ExperienceScreen } from "@/data/site";
import { popButtonClass, type PopSize, type PopTone } from "./PopButton";

/**
 * 도입 상담 안내로 가는 버튼 (E-4 · A 동선).
 *
 * ── 무엇을 고쳤나 ────────────────────────────────────────────────
 *
 * 전에는 「소개 사이트의 상담 폼으로 보낸다」고 적었는데 **소개 사이트에는
 * 상담 폼이 없다.** 전화와 이메일로 받는 안내 페이지(/contact)다. 폼이 있다고
 * 써 두면 열었을 때 없는 것을 찾게 된다.
 *
 * ★ 이 사이트는 그대로 아무 정보도 받지 않는다. 어느 화면에서 왔는지는 주소에
 *   적어 보내지만, **집계 장치가 없으므로 자동으로 세어진다고 말하지 않는다.**
 * ★ 전화 경로는 홈 「도입 문의」와 푸터에, 그리고 가는 곳인 안내 페이지에도 있다.
 */
export function ConsultButton({
  children = "도입 상담 안내",
  medium,
  campaign,
  tone = "ink",
  size = "lg",
  className,
}: {
  children?: string;
  /** 어느 화면에서 왔는지 */
  medium: ExperienceScreen;
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
      <span className="sr-only"> (새 창에서 열려요)</span>
    </a>
  );
}
