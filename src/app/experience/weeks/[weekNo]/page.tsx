import type { Metadata } from "next";
import { TeacherDashboard } from "@/components/play/TeacherDashboard";
import { INTEGRATION_LABEL, SAFETY_ORIGIN, mediaStatus, preLessonChecks, weekGoals } from "@/data/experience/lesson-support";
import { indicatorLinks } from "@/data/experience/lesson-engine/growth-mapping";
import { indicatorName } from "@/data/experience/lesson-engine/plan";
import { MEDIA_SLOT_IDS } from "@/data/experience/lesson-engine/media-slots-generated";
import { WeekSourcePanel } from "@/components/play/WeekSourcePanel";
import { ConsultButton } from "@/components/play/ConsultButton";
import { EmailInquiryButton } from "@/components/play/EmailInquiryButton";
import { ShareButton } from "@/components/play/ShareButton";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentStatusBadge, DemoNotice } from "@/components/play/Badges";
import { ArrowRight, PlayIcon, PopLink } from "@/components/play/PopButton";
import { Sticker } from "@/components/play/Stickers";
import { CoverTitleNote, WeekArt } from "@/components/play/WeekArt";
import { cx } from "@/components/ui/cx";
import { displayFallback } from "@/components/play/display-font";
import { curriculumBadge } from "@/data/experience/teacher-dashboard/source-register";
import { EXPERIENCE_WEEKS, experiencePart, experienceWeek } from "@/data/experience/weeks";
import { CORE_STAGE_FLOW, TEXT_ORIGIN_LABEL } from "@/data/experience/types";
import { OriginLegend, OriginTag } from "@/components/play/OriginTag";
import { LessonUpdateNotice } from "@/components/play/LessonUpdateNotice";
import { LESSON_TIME, PDF_TIME_NOTE, SOURCE_TIME_NOTE } from "@/lib/weeks/lesson-time";

/**
 * 공개 체험 · 주차 상세 (1~24주, 빌드 때 모두 생성).
 *
 * ★ 수업 지도 값과 체험용 구성을 화면에서 나눠 보인다.
 *   위쪽 = week-index.ts (주차 제목 · 그림책 · 키워드 · 메시지 · 활동 · 결과물)
 *     배지는 자료 확정본(1~8주차)만 「공식 교육과정」, 나머지는 「초안 · 검수 전 교안」.
 *   아래 본문 = 체험용 구성 — 상태 배지와 안내 문장을 항상 함께 둔다.
 * ★ 수업 시간은 lesson-time.ts 의 LESSON_TIME 하나만 말한다. 원본 표기는 출처 기록으로만.
 * ★ 누리과정 5개 영역과 SOYE KIDS 핵심경험은 다른 묶음으로 보인다 (섞어 쓰지 않는다).
 */
export const dynamicParams = false;

/** PDF 그림 자리 ID — 단계 순서대로 (wN.physical0.step.K …) */
function slotsOf(n: number) {
  const ids = MEDIA_SLOT_IDS[n] ?? [];
  const pick = (re: RegExp) => ids.filter((x) => re.test(x)).sort((a, b) => Number(a.split(".").pop()) - Number(b.split(".").pop()));
  return { physical0: pick(/\.physical0\.step\./), physical1: pick(/\.physical1\.step\./), art: pick(/\.art\.example\./), workbook: pick(/\.workbook\.worksheet\./) };
}

/** 앞뒤 주차 — 대시보드 주간 개요의 이동 단추 */
function neighbor(n: number): { weekNo: number; title: string } | null {
  const w = experienceWeek(n);
  return w ? { weekNo: w.weekNo, title: w.title } : null;
}

export function generateStaticParams() {
  return EXPERIENCE_WEEKS.map((w) => ({ weekNo: String(w.weekNo) }));
}

export async function generateMetadata({ params }: PageProps<"/experience/weeks/[weekNo]">): Promise<Metadata> {
  const { weekNo } = await params;
  const week = experienceWeek(Number(weekNo));
  if (!week) return {};
  return {
    title: `${week.weekNo}주차 「${week.title}」 | 수업 체험 | TeachAble Art Play`,
    description: `${week.coreMessage} — 동화책 《${week.storybook}》 · 성장 키워드 「${week.growthKeyword}」 · ${LESSON_TIME.label}`,
    alternates: { canonical: `/experience/weeks/${week.weekNo}` },
  };
}

function Block({ title, tone, children, className }: { title: string; tone: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cx("rounded-[32px] p-6 sm:p-7", tone, className)}>
      <h2 className="font-display text-[22px] text-pop-ink">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function ExperienceWeekPage({ params }: PageProps<"/experience/weeks/[weekNo]">) {
  const { weekNo } = await params;
  const week = experienceWeek(Number(weekNo));
  if (!week) notFound();
  const part = experiencePart(week.partNo)!;
  const prev = experienceWeek(week.weekNo - 1);
  const next = experienceWeek(week.weekNo + 1);
  const b = week.body;

  return (
    <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
      <div className="mx-auto max-w-[1320px] 2xl:max-w-[1520px] px-4 pt-6 sm:px-6">
        <nav aria-label="현재 위치" className="text-[14px] font-semibold text-pop-ink-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/experience" className="inline-flex min-h-11 items-center hover:text-pop-ink">수업 체험</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href={`/experience/weeks#part-${part.partNo}`} className="inline-flex min-h-11 items-center hover:text-pop-ink">PART {part.partNo} {part.title}</Link></li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="text-pop-ink">{week.weekNo}주차</li>
          </ol>
        </nav>
      </div>

      <section aria-labelledby="week-title" className="mx-auto grid max-w-[1320px] 2xl:max-w-[1520px] items-center gap-8 px-4 pb-10 pt-6 sm:px-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-12">
        <div className="relative">
          <WeekArt week={week} size="hero" priority className="aspect-[4/3] w-full rounded-[40px] shadow-pop-lg ring-8 ring-white" />
          <span className="absolute -left-2 -top-4 inline-flex h-16 min-w-16 items-center justify-center rounded-3xl px-3 font-display text-[30px] text-white sticker" style={{ backgroundColor: week.themeColor }}>
            {week.weekNo}<span className="ml-0.5 text-[16px]">주</span>
          </span>
          <Sticker kind="sparkle" color="#ffc928" float className="absolute -bottom-5 right-8 h-12 w-12" />
        </div>
        <div className="animate-rise">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-pop-leaf-soft px-3 py-1 text-[12px] font-bold text-pop-leaf-deep">{curriculumBadge(week.weekNo)}</span>
            <span className="rounded-full bg-white px-3 py-1 text-[12px] font-bold text-pop-ink ring-1 ring-pop-ink/10">PART {part.partNo} · {part.title}</span>
          </div>
          <h1 id="week-title" className={cx("mt-4 font-display text-[40px] leading-tight text-pop-ink sm:text-[54px]", displayFallback(week.title))}>{week.title}</h1>
          <LessonUpdateNotice week={week} className="mt-3" />
          <p className="mt-2 text-[18px] font-bold text-pop-ink-muted">동화책 《{week.storybook}》</p>
          <CoverTitleNote week={week} className="mt-1" />
          <p className="mt-4 text-[19px] font-medium leading-relaxed text-pop-ink">{week.coreMessage}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3">
            {[
              ["성장 키워드", `#${week.growthKeyword}`],
              ["수업 시간", LESSON_TIME.label],
              ["대표 활동", week.activitySummary],
              ["결과물", week.outcome ?? "결과물 정리 중"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-3xl bg-white p-4 ring-1 ring-pop-ink/5">
                <dt className="text-[13px] font-bold text-pop-ink-muted">{k}</dt>
                <dd className="mt-1 text-[16px] font-bold leading-snug text-pop-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[13px] leading-relaxed text-pop-ink-muted">
            시간 출처 기록 · 자료 「{week.duration.pdfDurationLabel}」 — {PDF_TIME_NOTE}
            {week.duration.legacyGuideDurationLabel ? ` · 이전 가이드 「${week.duration.legacyGuideDurationLabel}」 — ${SOURCE_TIME_NOTE}` : ""}.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <PopLink href={`/experience/classroom/${week.weekNo}`} tone="pink" size="xl">
              <PlayIcon />
              체험 시작
            </PopLink>
            <PopLink href="/experience/weeks" tone="white" size="xl">24주 목록</PopLink>
          </div>
        </div>
      </section>

      <div className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-[1320px] 2xl:max-w-[1520px] px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3 rounded-[28px] bg-pop-orange-soft px-5 py-4">
            <ContentStatusBadge status={b.status} className="bg-white" />
            <p className="text-[15px] font-semibold text-pop-ink">
              아래 수업 구성은 체험을 위한 예시입니다. 정식 교안은 본사 검수 후 기관 서비스에서 제공됩니다.
            </p>
            <DemoNotice compact className="ml-auto max-sm:ml-0" />
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <Block title="수업 목표" tone="bg-pop-yellow-soft" className="lg:col-span-2">
              <p className="text-[18px] font-semibold leading-relaxed text-pop-ink">{b.goal}</p>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="핵심 경험">
                {b.coreExperiences.map((c) => <li key={c} className="rounded-full bg-white px-3 py-1.5 text-[14px] font-bold text-pop-ink">{c}</li>)}
              </ul>
            </Block>
            <Block title="교육과정 연계" tone="bg-pop-cream ring-1 ring-pop-ink/5">
              <p className="text-[13px] font-bold text-pop-leaf-deep">누리과정 영역</p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {b.nuriAreas.map((a) => <li key={a} className="rounded-full bg-pop-leaf-soft px-3 py-1 text-[14px] font-bold text-pop-leaf-deep">{a}</li>)}
              </ul>
              {b.soyeCoreExperiences.length > 0 ? (
                <>
                  <p className="mt-4 text-[13px] font-bold text-pop-lilac-deep">SOYE KIDS 핵심경험</p>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {b.soyeCoreExperiences.map((a) => <li key={a} className="rounded-full bg-pop-lilac-soft px-3 py-1 text-[14px] font-bold text-pop-lilac-deep">{a}</li>)}
                  </ul>
                </>
              ) : null}
            </Block>
          </div>

          <h2 id="lesson-plan" className="mt-14 scroll-mt-28 font-display text-[30px] text-pop-ink sm:text-[36px]">{LESSON_TIME.label}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-pop-ink-muted">
            {CORE_STAGE_FLOW} — 다섯 단계로 한 회차가 끝나요. {LESSON_TIME.connectNote}
          </p>
          <LessonUpdateNotice week={week} className="mt-3" />
          <OriginLegend className="mt-2" />
          <ol className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {week.stages.map((s, i) => (
              <li key={s.key} className={cx("flex flex-col rounded-[28px] p-5", ["bg-pop-sky-soft", "bg-pop-pink-soft", "bg-pop-mint-soft", "bg-pop-yellow-soft", "bg-pop-lilac-soft"][i])}>
                <p className="text-[13px] font-bold text-pop-ink-muted">{i + 1}단계</p>
                <h3 className="mt-1 font-display text-[21px] text-pop-ink">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-pop-ink">{s.guide} <OriginTag origin={s.guideOrigin} className="align-middle" /></p>
                <details className="group mt-3 rounded-2xl bg-white/70 px-3 py-2">
                  <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between text-[13px] font-bold text-pop-ink [&::-webkit-details-marker]:hidden">
                    진행 순서 {s.steps.length}
                    <span aria-hidden="true" className="text-pop-ink-muted transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <ol className="mt-1 grid gap-1.5 pb-1 text-[13px] leading-relaxed text-pop-ink">{s.steps.map((x, j) => <li key={x.text}>{j + 1}. {x.text} <OriginTag origin={x.origin} className="align-middle" /></li>)}</ol>
                  {s.materials.length ? <p className="mt-1 text-[12px] text-pop-ink-muted">준비물 · {s.materials.join(" · ")}</p> : null}
                </details>
                <p className="mt-auto pt-4 text-[14px] font-semibold leading-relaxed text-pop-ink-muted">“{s.teacherQuestion}” <OriginTag origin={s.teacherQuestionOrigin} className="align-middle" /></p>
                {s.transition ? <p className="mt-2 text-[12px] leading-relaxed text-pop-ink-muted">다음 단계로 (교사용 제안) · “{s.transition}”</p> : null}
              </li>
            ))}
          </ol>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Block title="준비물" tone="bg-pop-yellow-soft">
              <ul className="flex flex-wrap gap-2">
                {b.materials.map((m) => <li key={m} className="rounded-full bg-white px-3.5 py-2 text-[15px] font-semibold text-pop-ink">{m}</li>)}
              </ul>
            </Block>
            <Block title="교구 및 워크북 활동 · 결과물" tone="bg-pop-mint-soft">
              <p className="text-[16px] leading-relaxed text-pop-ink">{b.art}</p>
              <p className="mt-3 inline-flex rounded-full bg-white px-3.5 py-2 text-[14px] font-bold text-pop-ink">결과물 · {week.outcome ?? "정리 중"}</p>
            </Block>
          </div>

          {/*
            연계 활동 — 워크북 · 작품 완성 · 가정연계 (내용은 그대로).
            ★ 2026-10-29 수정 지시: 「기본 수업 밖 선택 확장활동」 문구와 분 숫자는 화면에서 뺐다.
          */}
          <section aria-labelledby="week-ext-title" className="mt-14">
            <h2 id="week-ext-title" className="font-display text-[30px] text-pop-ink sm:text-[36px]">연계 활동</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-pop-ink-muted">
              워크북 · 작품 완성 · 가정연계로 이어 갑니다. 원의 일정에 맞춰 운영합니다.
            </p>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {week.extensions.map((x) => (
                <li key={x.key} className="flex flex-col rounded-[28px] bg-white p-5 ring-1 ring-pop-ink/5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-[20px] text-pop-ink">{x.title}</h3>
                  </div>
                  <p className="mt-2 text-[15px] leading-relaxed text-pop-ink">{x.activity}</p>
                  <dl className="mt-3 flex flex-col gap-1.5 text-[13px] leading-relaxed text-pop-ink-muted">
                    <div className="flex gap-2"><dt className="shrink-0 font-bold">기본 수업과의 연결</dt><dd>{x.linkToCore}</dd></div>
                    <div className="flex gap-2"><dt className="shrink-0 font-bold">준비물</dt><dd>{x.materials.slice(0, 4).join(" · ")}</dd></div>
                    {x.teacherPrompt ? <div className="flex gap-2"><dt className="shrink-0 font-bold">교사 발문</dt><dd>“{x.teacherPrompt}”</dd></div> : null}
                    {x.safetyNote ? <div className="flex gap-2"><dt className="shrink-0 font-bold">안전 주의</dt><dd>{x.safetyNote}</dd></div> : null}
                    <div className="flex gap-2"><dt className="shrink-0 font-bold">원본 출처</dt><dd>{x.source}</dd></div>
                    <div className="flex gap-2"><dt className="shrink-0 font-bold">검수 상태</dt>
                      <dd>{x.sourceStatus === "verified" ? "공식 가이드 확인" : "검수 필요"}</dd></div>
                  </dl>
                </li>
              ))}
            </ul>
          </section>

          <TeacherDashboard
            week={week}
            support={{
              pre: preLessonChecks(week),
              media: mediaStatus(week),
              goals: weekGoals(week),
              prev: neighbor(week.weekNo - 1),
              next: neighbor(week.weekNo + 1),
              integration: INTEGRATION_LABEL[week.weekNo] ?? null,
              indicatorLinks: indicatorLinks(week.teacherObservations.items).map((l) => ({ item: l.item, indicators: l.indicators.map(indicatorName) })),
              slots: slotsOf(week.weekNo),
            }}
          />

          <WeekSourcePanel weekNo={week.weekNo} />

          <section aria-labelledby="teacher-detail-title" className="mt-10">
            <h2 id="teacher-detail-title" className="font-display text-[24px] text-pop-ink sm:text-[28px]">교사용 자세히 보기</h2>
            <p className="mt-1 text-[15px] text-pop-ink-muted">필요한 항목만 펼쳐 보세요.</p>
            <div className="mt-4 grid gap-3">
              {[
                {
                  title: "동화책 · 신체활동 · 소리",
                  body: (
                    <dl className="grid gap-3 text-[16px] leading-relaxed text-pop-ink sm:grid-cols-3">
                      <div><dt className="font-bold text-pop-sky-deep">동화책 활동</dt><dd className="mt-1">{b.story}</dd></div>
                      <div><dt className="font-bold text-pop-pink-deep">신체활동</dt><dd className="mt-1">{b.movement}</dd></div>
                      <div><dt className="font-bold text-pop-lilac-deep">음악 · 리듬</dt><dd className="mt-1">{b.music}</dd></div>
                    </dl>
                  ),
                },
                {
                  title: `교사 발문 ${b.teacherQuestions.length + 1}개`,
                  body: <ul className="grid gap-2 text-[17px] font-semibold leading-relaxed text-pop-ink">{[...b.teacherQuestions, b.closingQuestion].map((q) => <li key={q}>“{q}”</li>)}</ul>,
                },
                {
                  // 대시보드 · 교실 플레이어와 같은 목록 (자료 원문 우선)
                  title: `관찰 포인트 ${week.teacherObservations.items.length}개 · ${TEXT_ORIGIN_LABEL[week.teacherObservations.origin]}`,
                  body: <ul className="grid gap-2 text-[16px] leading-relaxed text-pop-ink">{week.teacherObservations.items.map((o) => <li key={o}>· {o}</li>)}</ul>,
                },
                {
                  title: "가정연계 · 안전 안내",
                  body: (
                    <div className="grid gap-3 text-[16px] leading-relaxed text-pop-ink sm:grid-cols-2">
                      <p>{b.homeConnection}</p>
                      <div className="rounded-2xl bg-pop-pink-soft p-4 text-[15px]"><p className="mb-1.5 flex items-center gap-2 text-[13px] font-bold text-pop-pink-deep">안전 안내 <OriginTag origin={SAFETY_ORIGIN} /></p><ul className="grid gap-1.5">{b.safety.map((x) => <li key={x}>· {x}</li>)}</ul></div>
                    </div>
                  ),
                },
              ].map((d) => (
                <details key={d.title} className="group rounded-[24px] bg-pop-cream ring-1 ring-pop-ink/5 open:bg-white open:shadow-pop">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 text-[17px] font-bold text-pop-ink [&::-webkit-details-marker]:hidden">
                    {d.title}
                    <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-pop-ink-muted transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-5 pb-5">{d.body}</div>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/*
        체험을 본 다음 행동 (E-4). 전에는 이 화면에서 다음 주차로만 갈 수 있어,
        「우리 원에서 해 볼까」라는 생각이 든 순간에 갈 곳이 없었다.
      */}
      <section aria-labelledby="week-next-step" className="mx-auto max-w-[1320px] 2xl:max-w-[1520px] px-4 pt-12 sm:px-6">
        <div className="flex flex-col items-center gap-4 rounded-[28px] bg-white/70 px-5 py-7 text-center">
          <h2 id="week-next-step" className="font-display text-[24px] text-pop-ink">우리 원에서 해 보려면</h2>
          <p className="max-w-[44ch] text-[15px] font-medium leading-relaxed text-pop-ink-muted">
            체험 화면은 저장되지 않아요. 도입 상담은 전화 · 이메일로 받습니다.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <ShareButton path={`/experience/weeks/${week.weekNo}`} tone="white" size="md" />
            <EmailInquiryButton screen="week" weekNo={week.weekNo} tone="white" size="md" />
            <ConsultButton medium="week" campaign={`w${week.weekNo}`} tone="ink" size="md">
              도입 상담 안내
            </ConsultButton>
          </div>
        </div>
      </section>

      <nav aria-label="다른 주차" className="mx-auto grid max-w-[1320px] 2xl:max-w-[1520px] gap-4 px-4 py-12 sm:grid-cols-2 sm:px-6">
        {prev ? (
          <Link href={`/experience/weeks/${prev.weekNo}`} className="group flex min-h-20 items-center gap-4 rounded-[28px] bg-white p-5 shadow-pop">
            <span aria-hidden="true" className="text-[22px] text-pop-ink-muted transition-transform group-hover:-translate-x-1">←</span>
            <span><span className="block text-[13px] font-bold text-pop-ink-muted">이전 · {prev.weekNo}주차</span><span className={cx("font-display text-[20px] text-pop-ink", displayFallback(prev.title))}>{prev.title}</span></span>
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/experience/weeks/${next.weekNo}`} className="group flex min-h-20 items-center justify-end gap-4 rounded-[28px] bg-white p-5 text-right shadow-pop">
            <span><span className="block text-[13px] font-bold text-pop-ink-muted">다음 · {next.weekNo}주차</span><span className={cx("font-display text-[20px] text-pop-ink", displayFallback(next.title))}>{next.title}</span></span>
            <ArrowRight className="h-6 w-6 text-pop-ink-muted transition-transform group-hover:translate-x-1" />
          </Link>
        ) : null}
      </nav>
    </main>
  );
}
