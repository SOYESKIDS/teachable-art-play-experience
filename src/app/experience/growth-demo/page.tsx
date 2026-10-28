import type { Metadata } from "next";
import Link from "next/link";
import { DemoNotice } from "@/components/play/Badges";
import { displayFallback } from "@/components/play/display-font";
import { cx } from "@/components/ui/cx";
import { GrowthDemo, type DemoWeek } from "@/components/play/GrowthDemo";
import { buildLessonPlan } from "@/data/experience/lesson-engine/plan";
import { EXPERIENCE_WEEKS } from "@/data/experience/weeks";
import { weekDashboard } from "@/data/experience/teacher-dashboard/week-dashboards";

export const metadata: Metadata = {
  title: "성장 분석 흐름 체험 (가상) | TeachAble Art Play",
  description: "가상 관찰 기록으로 근거 → 5대 성장지표 → 분석 초안 → 교사 검토 · 승인 → 리포트 흐름을 체험합니다. 저장 · 전송 · 실제 AI 호출이 없습니다.",
  alternates: { canonical: "/experience/growth-demo" },
};

/**
 * 가상 성장 분석 흐름 — 공개 체험.
 * ★ 실제 아동 자료의 업로드 · 저장 · AI 전송은 기관용 보안 서비스에서만 한다 (이 저장소 밖 내부 설계 문서).
 */
export default function GrowthDemoPage() {
  const weeks: DemoWeek[] = EXPERIENCE_WEEKS.map((w) => {
    const p = buildLessonPlan(w);
    return {
      weekNo: w.weekNo,
      title: w.title,
      storybook: w.storybook,
      familyTitle: p.familyActivity.title,
      activities: [...p.physicalActivities, ...(p.artActivity ? [p.artActivity] : [])].map((a) => ({
        id: a.id, title: a.title, kind: a.kind, stage: a.stage, items: a.observations.map((o) => ({ item: o.item, indicators: o.indicators })),
      })),
      items: p.growthIndicatorMappings.map((l) => ({ item: l.item, indicators: l.indicators })),
      itemsOrigin: p.observationPoints.origin,
      parentNotice: weekDashboard(w.weekNo)?.parentNotice ?? [],
      kidsnote: weekDashboard(w.weekNo)?.kidsnote ?? null,
    };
  });
  return (
    <main id="main" tabIndex={-1} className="flex-1 bg-pop-cream focus:outline-none">
      <div className="mx-auto max-w-[1100px] px-4 pb-16 pt-8 sm:px-6">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <span className="rounded-full bg-pop-orange px-4 py-2 text-[15px] font-extrabold text-pop-ink">가상 예시</span>
          <DemoNotice />
        </div>
        <h1 className={cx("mt-5 font-display text-[36px] leading-tight text-pop-ink sm:text-[48px]", displayFallback("성장 분석 흐름 체험"))}>성장 분석 흐름 체험</h1>
        <p className="mt-3 max-w-[60ch] text-[17px] leading-relaxed text-pop-ink-muted">
          PDF 수업 활동 → 교사 관찰 → 근거 → 5대 성장지표 → 분석 초안 → 교사 검토 · 승인 → 리포트까지 가상 기록으로 따라가 봅니다.
          이 화면은 아무것도 저장하거나 보내지 않으며, 실제 AI 를 부르지 않습니다. 새로고침하면 처음으로 돌아갑니다.
        </p>
        <p className="mt-2 text-[14px] text-pop-ink-muted">
          실제 아동 사진 · 영상 · 기록은 기관 인증 · 보호자 동의 · 비공개 저장이 갖춰진 기관용 서비스에서만 다룹니다.{" "}
          <Link href="/experience/report" className="font-bold text-pop-ink underline underline-offset-4">완성된 가상 리포트 보기</Link>
        </p>
        <div className="mt-6">
          <GrowthDemo weeks={weeks} />
        </div>
      </div>
    </main>
  );
}
