import { LESSON_UPDATE_PENDING_LABEL } from "@/lib/weeks/week-index";
import { cx } from "@/components/ui/cx";

/**
 * 제목이 바뀐 주차(2026-10-29 승인 제목) — 아래 수업이 자료 PDF 교안 기준이라는 것을 밝힌다.
 * ★ 승인 제목은 2026-10-26 PDF 동기화 전의 공식 가이드 주제와 같다. 그 이전 본문은
 *   docs/curriculum/snapshots/2026-10-26-before-pdf-sync/ 에 남아 있지만, 어느 교안을 쓸지는 본사가 정한다.
 * ★ 제목만 바뀐 수업을 새 수업처럼 보이게 하지 않는다. 본문은 지어내지 않는다.
 */
export function LessonUpdateNotice({
  week,
  compact = false,
  className,
}: {
  week: { lessonUpdatePending: boolean; sourceTitle: string };
  compact?: boolean;
  className?: string;
}) {
  if (!week.lessonUpdatePending) return null;
  if (compact) {
    return (
      <span className={cx("inline-flex rounded-full bg-pop-orange-soft px-2.5 py-0.5 text-[12px] font-extrabold text-pop-orange-deep", className)}>
        {LESSON_UPDATE_PENDING_LABEL}
      </span>
    );
  }
  return (
    <p role="note" className={cx("rounded-2xl bg-pop-orange-soft px-4 py-3 text-[15px] leading-relaxed text-pop-ink", className)}>
      <strong className="font-extrabold text-pop-orange-deep">{LESSON_UPDATE_PENDING_LABEL}</strong> — 주차 제목이 새로 정해졌습니다.
      아래 수업 내용은 자료 PDF 교안 「{week.sourceTitle}」 기준이며, 새 제목에 맞는 교안은 본사 확인 중입니다.
    </p>
  );
}
