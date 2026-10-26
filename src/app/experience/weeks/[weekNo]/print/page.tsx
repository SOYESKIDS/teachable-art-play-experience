import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OriginTag } from "@/components/play/OriginTag";
import { displayFallback } from "@/components/play/display-font";
import { cx } from "@/components/ui/cx";
import { PrintButton } from "@/components/play/PrintButton";
import { closingChecks, preLessonChecks, weekGoals, type CheckGroup } from "@/data/experience/lesson-support";
import { isEditedLine, weekDashboard } from "@/data/experience/teacher-dashboard/week-dashboards";
import { TEXT_ORIGIN_LABEL } from "@/data/experience/types";
import { EXPERIENCE_WEEKS, experienceWeek } from "@/data/experience/weeks";
import { LESSON_TIME } from "@/lib/weeks/lesson-time";

/**
 * 인쇄용 수업 요약 (A4) — 교사용 수업 요약 · 준비물 체크리스트 · 기본 수업 진행표 · 가족연계 안내문.
 *
 * ★ 화면에 이미 있는 문장만 모은다. 문장마다 출처 상태를 그대로 찍는다 (인쇄물에서도 원문 · 편집 · 제안이 구분된다).
 * ★ 워크북 도안 · 음원 · 사진은 파일이 없어 넣지 않는다 — 있는 것처럼 보이게 하지 않는다.
 * ★ 검색에 따로 잡히지 않게 한다 (주차 상세와 내용이 겹친다).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return EXPERIENCE_WEEKS.map((w) => ({ weekNo: String(w.weekNo) }));
}

export async function generateMetadata({ params }: PageProps<"/experience/weeks/[weekNo]/print">): Promise<Metadata> {
  const { weekNo } = await params;
  const week = experienceWeek(Number(weekNo));
  if (!week) return {};
  return {
    title: `${week.weekNo}주차 인쇄용 수업 요약 | TeachAble Art Play`,
    description: `《${week.title}》 교사용 수업 요약 · 준비물 체크리스트 · ${LESSON_TIME.label} 진행표 · 가족연계 안내문 (체험용 구성).`,
    alternates: { canonical: `/experience/weeks/${week.weekNo}/print` },
    robots: { index: false, follow: true },
  };
}

function Checks({ groups }: { groups: readonly CheckGroup[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
      {groups.map((g) => (
        <div key={g.key} className="break-inside-avoid">
          <p className="text-[13px] font-extrabold">{g.label}</p>
          <ul className="mt-1 grid gap-1 text-[13px] leading-snug">
            {g.items.map((it) => (
              <li key={it.text} className="flex gap-2">
                <span aria-hidden="true" className="mt-[3px] h-3.5 w-3.5 shrink-0 rounded-[3px] border-[1.5px] border-pop-ink/60" />
                <span>{it.text} <OriginTag origin={it.origin} className="align-middle" /></span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children, breakBefore = false }: { title: string; children: React.ReactNode; breakBefore?: boolean }) {
  return (
    <section className={breakBefore ? "mt-8 print:mt-0 print:break-before-page" : "mt-8 print:mt-5"}>
      <h2 className={cx("border-b-2 border-pop-ink pb-1 font-display text-[20px] print:text-[17px]", displayFallback(title))}>{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function WeekPrintPage({ params }: PageProps<"/experience/weeks/[weekNo]/print">) {
  const { weekNo } = await params;
  const week = experienceWeek(Number(weekNo));
  const d = week ? weekDashboard(week.weekNo) : null;
  if (!week || !d) notFound();
  const next = experienceWeek(week.weekNo + 1) ?? null;
  const goals = weekGoals(week);

  return (
    <main id="main" tabIndex={-1} className="flex-1 bg-pop-cream focus:outline-none print:bg-white">
      <div className="mx-auto max-w-[860px] px-4 py-8 sm:px-6 print:max-w-none print:p-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link href={`/experience/weeks/${week.weekNo}`} className="inline-flex min-h-11 items-center text-[14px] font-semibold text-pop-ink-muted hover:text-pop-ink">
            ← {week.weekNo}주차 수업 안내
          </Link>
          <PrintButton />
        </div>

        <article className="rounded-[28px] bg-white p-6 text-pop-ink shadow-pop sm:p-10 print:rounded-none print:p-0 print:shadow-none">
          <header className="flex flex-wrap items-end justify-between gap-3 border-b border-pop-ink/15 pb-4">
            <div>
              <p className="text-[13px] font-bold text-pop-ink-muted">TeachAble Art Play · 교사용 수업 요약</p>
              <h1 className={cx("mt-1 font-display text-[30px] leading-tight print:text-[24px]", displayFallback(`${week.weekNo}주차 「${week.title}」`))}>{week.weekNo}주차 「{week.title}」</h1>
              <p className="mt-1 text-[15px] font-semibold">그림책 《{week.storybook}》 · #{week.growthKeyword} · {LESSON_TIME.label} ({LESSON_TIME.breakdown})</p>
            </div>
            <p className="max-w-[30ch] text-[12px] leading-snug text-pop-ink-muted">
              체험용 구성입니다. 공식 교안으로 확정된 내용이 아닙니다. 문장 옆 표시는 출처입니다 —
              {(["source", "edited", "proposal", "review"] as const).map((o) => ` [${TEXT_ORIGIN_LABEL[o]}]`).join("")}
            </p>
          </header>

          <Section title="오늘의 목표">
            <ul className="grid gap-1 text-[14px]">
              {goals.map((g) => <li key={g.text}>· {g.text} <OriginTag origin={g.origin} className="align-middle" /></li>)}
            </ul>
          </Section>

          <Section title="수업 전 준비물 · 확인 체크리스트">
            <Checks groups={preLessonChecks(week)} />
          </Section>

          <Section title={`${LESSON_TIME.label} 진행표`}>
            <table className="w-full border-collapse text-left text-[13px] leading-snug">
              <thead>
                <tr className="border-b-2 border-pop-ink/30 text-[12px] text-pop-ink-muted">
                  <th scope="col" className="w-[16%] py-1.5 pr-2">단계 · 시간</th>
                  <th scope="col" className="w-[30%] py-1.5 pr-2">교사 발문</th>
                  <th scope="col" className="py-1.5 pr-2">아이가 하는 일 · 준비물</th>
                </tr>
              </thead>
              <tbody>
                {week.stages.map((s, i) => (
                  <tr key={s.key} className="break-inside-avoid border-b border-pop-ink/10 align-top">
                    <th scope="row" className="py-2 pr-2 font-bold">{i + 1}. {s.title}<br /><span className="font-semibold text-pop-ink-muted">약 {s.minutes}분</span></th>
                    <td className="py-2 pr-2">“{s.teacherQuestion}” <OriginTag origin={s.teacherQuestionOrigin} className="align-middle" /></td>
                    <td className="py-2 pr-2">
                      <ol className="grid gap-0.5">
                        {s.steps.map((x, j) => <li key={x.text}>{j + 1}) {x.text} <OriginTag origin={x.origin} className="align-middle" /></li>)}
                      </ol>
                      {s.materials.length ? <p className="mt-1 text-pop-ink-muted">준비물 · {s.materials.join(" · ")}</p> : null}
                      {s.transition ? <p className="mt-0.5 text-pop-ink-muted">다음 단계로 · “{s.transition}”</p> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-[12px] text-pop-ink-muted">워크북 · 확장활동은 {LESSON_TIME.label} 밖의 선택 활동입니다. 워크북 도안 · 음원 · 영상 파일은 자료 준비 중이라 이 인쇄물에 넣지 않았습니다.</p>
          </Section>

          <Section title="수업 마무리 확인">
            <Checks groups={closingChecks(week, next)} />
          </Section>

          <Section title="가족연계 안내문" breakBefore>
            <p className="text-[13px] text-pop-ink-muted">{week.weekNo}주차 「{week.title}」 · 자료 원문 기준 <OriginTag origin="source" className="align-middle" /> · 고쳐 쓴 문장은 따로 표시합니다</p>
            {d.familyTitle ? <p className={cx("mt-2 font-display text-[22px] print:text-[19px]", displayFallback(d.familyTitle))}>{d.familyTitle}</p> : <p className="mt-2 text-[14px]">자료에서 확인하지 못했습니다.</p>}
            {d.familyHow.length ? <ol className="mt-2 grid gap-1 text-[14px]">{d.familyHow.map((x, i) => <li key={x}>{i + 1}. {x}{isEditedLine(week.weekNo, x) ? <> <OriginTag origin="edited" className="align-middle" /></> : null}</li>)}</ol> : null}
            {d.familyTalk.length ? (
              <div className="mt-3">
                <p className="text-[13px] font-extrabold">집에서 이렇게 이야기해 보세요</p>
                <ul className="mt-1 grid gap-0.5 text-[14px]">{d.familyTalk.map((x) => <li key={x}>“{x}”</li>)}</ul>
              </div>
            ) : null}
            {d.parentNotice.length ? (
              <div className="mt-3">
                <p className="text-[13px] font-extrabold">부모님께 드리는 안내</p>
                <ul className="mt-1 grid gap-0.5 text-[14px]">{d.parentNotice.map((x) => <li key={x}>· {x}</li>)}</ul>
              </div>
            ) : null}
            <p className="mt-4 text-[12px] text-pop-ink-muted">이 안내문에는 아이 이름 · 사진 · 기록을 넣지 않습니다.</p>
          </Section>
        </article>
      </div>
    </main>
  );
}
