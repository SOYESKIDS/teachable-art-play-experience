import { cx } from "@/components/ui/cx";
import { TEXT_ORIGIN_LABEL, type TextOrigin } from "@/data/experience/types";

/**
 * 문장 출처 배지 — 주차 상세 · 교사 대시보드 · 교실 플레이어가 같은 모양 · 같은 말을 쓴다.
 * ★ 색만으로 구분하지 않는다 — 글자(TEXT_ORIGIN_LABEL)가 함께 있다.
 */
const TONE: Record<TextOrigin, string> = {
  source: "bg-pop-mint-soft text-pop-mint-deep",
  edited: "bg-pop-sky-soft text-pop-sky-deep",
  proposal: "bg-pop-yellow-soft text-pop-ink",
  review: "bg-pop-pink-soft text-pop-pink-deep",
};

export function OriginTag({ origin, className }: { origin: TextOrigin; className?: string }) {
  return (
    <span className={cx("inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold leading-tight", TONE[origin], className)}>
      {TEXT_ORIGIN_LABEL[origin]}
    </span>
  );
}

/** 출처 안내 한 줄 — 네 가지 배지가 무엇인지 */
export function OriginLegend({ className }: { className?: string }) {
  return (
    <p className={cx("flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-pop-ink-muted", className)}>
      <span className="font-bold">문장 출처</span>
      <OriginTag origin="source" /> 자료(PDF · 공식 가이드) 문장 그대로
      <OriginTag origin="edited" /> 근거 자료를 웹 체험 수업용으로 다듬음
      <OriginTag origin="proposal" /> 새로 쓴 제안 · 본사 검수 전
      <OriginTag origin="review" /> 아직 비어 있음
    </p>
  );
}
