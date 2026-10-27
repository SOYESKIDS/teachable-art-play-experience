import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OriginTag } from "@/components/play/OriginTag";
import { displayFallback } from "@/components/play/display-font";
import { cx } from "@/components/ui/cx";
import { PrintButton } from "@/components/play/PrintButton";
import { TEACHER_POINT_PROPOSALS, weekProposal } from "@/data/experience/teacher-dashboard/proposals";
import { editedLines, isEditedLine, pdfQuestions, weekDashboard } from "@/data/experience/teacher-dashboard/week-dashboards";
import { pdfExtraOf } from "@/data/experience/teacher-dashboard/week-pdf-extra";
import { TEXT_ORIGIN_LABEL, type TextOrigin } from "@/data/experience/types";
import { EXPERIENCE_WEEKS, experienceWeek } from "@/data/experience/weeks";
import { LESSON_TIME, PDF_DURATION_LABEL, SHORT_TIME } from "@/lib/weeks/lesson-time";
import { buildLessonPlan, indicatorName } from "@/data/experience/lesson-engine/plan";
import { prepNotes } from "@/data/experience/lesson-engine/prep-notes";
import { GROWTH_INDICATORS } from "@/data/experience/report";

/**
 * 인쇄용 상세 수업 지도안 — 자료 PDF 12개 영역을 줄이지 않고 모두 싣는다.
 *
 * ★ 주차 상세 · 교사 대시보드와 같은 데이터(week-dashboards · week-pdf-extra · lesson-engine)만 쓴다. 새 문장을 쓰지 않는다.
 * ★ 문장마다 출처를 찍는다. 자료에 없는 칸은 「자료에서 확인하지 못했습니다」, 원문이 「미작성」인 칸은 따로 적는다.
 * ★ 파일이 없는 그림 · 워크북 · 음원 · 영상은 「자료 준비 중」과 대체 운영(교사용 제안)만 적는다.
 * ★ 검색에 따로 잡히지 않게 한다 (주차 상세와 내용이 겹친다).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return EXPERIENCE_WEEKS.map((w) => ({ weekNo: String(w.weekNo) }));
}

export async function generateMetadata({ params }: PageProps<"/experience/weeks/[weekNo]/guide">): Promise<Metadata> {
  const { weekNo } = await params;
  const week = experienceWeek(Number(weekNo));
  if (!week) return {};
  return {
    title: `${week.weekNo}주차 상세 수업 지도안 | TeachAble Art Play`,
    description: `《${week.title}》 자료 12개 영역 전체 — 그림책 · 신체활동 · 미술 · 워크북 · 교구 · 가족연계 · 가정용 교구 · 누리과정 · 음원 · 관찰 · 주차 연계 (체험용 구성).`,
    alternates: { canonical: `/experience/weeks/${week.weekNo}/guide` },
    robots: { index: false, follow: true },
  };
}

const NONE = "자료에서 확인하지 못했습니다.";
const BLANK = "자료 원문에 「미작성」으로 적혀 있습니다.";

function Section({ no, title, children, breakBefore = false }: { no: number; title: string; children: React.ReactNode; breakBefore?: boolean }) {
  return (
    <section className={breakBefore ? "mt-8 print:mt-0 print:break-before-page" : "mt-8 print:mt-5"}>
      <h2 className={cx("border-b-2 border-pop-ink pb-1 font-display text-[20px] print:text-[17px]", displayFallback(title))}>
        {no}. {title}
      </h2>
      <div className="mt-3 grid gap-2 text-[13.5px] leading-snug">{children}</div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-[13px] font-extrabold">{children}</p>;
}

function Line({ label, text, origin = "source" }: { label: string; text: string | null | undefined; origin?: TextOrigin }) {
  return (
    <p>
      <span className="font-bold">{label} · </span>
      {text ? <>{text} <OriginTag origin={origin} className="align-middle" /></> : <span className="text-pop-ink-muted">{NONE}</span>}
    </p>
  );
}

function Items({ items, ordered = false, origin = "source", empty = NONE, edited }: { items: readonly string[]; ordered?: boolean; origin?: TextOrigin; empty?: string; edited?: (x: string) => boolean }) {
  if (!items.length) return <p className="text-pop-ink-muted">{empty}</p>;
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className="grid gap-0.5">
      {items.map((x, i) => (
        <li key={`${i}-${x}`}>
          {ordered ? `${i + 1}. ` : "· "}
          {x} <OriginTag origin={edited?.(x) ? "edited" : origin} className="align-middle" />
        </li>
      ))}
    </Tag>
  );
}

export default async function WeekGuidePage({ params }: PageProps<"/experience/weeks/[weekNo]/guide">) {
  const { weekNo } = await params;
  const week = experienceWeek(Number(weekNo));
  const d = week ? weekDashboard(week.weekNo) : null;
  if (!week || !d) notFound();
  const x = pdfExtraOf(week.weekNo);
  const plan = buildLessonPlan(week);
  const proposal = weekProposal(week.weekNo);
  const prep = prepNotes(week.weekNo);
  const assetsBy = new Map<string, typeof plan.mediaAssets[number][]>();
  for (const a of plan.mediaAssets) assetsBy.set(a.label, [...(assetsBy.get(a.label) ?? []), a]);
  const teacherPoint = d.teacherPoint ?? TEACHER_POINT_PROPOSALS[week.weekNo] ?? null;

  return (
    <main id="main" tabIndex={-1} className="flex-1 bg-pop-cream focus:outline-none print:bg-white">
      <div className="mx-auto max-w-[860px] px-4 py-8 sm:px-6 print:max-w-none print:p-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex flex-wrap gap-x-4">
            <Link href={`/experience/weeks/${week.weekNo}`} className="inline-flex min-h-11 items-center text-[14px] font-semibold text-pop-ink-muted hover:text-pop-ink">
              ← {week.weekNo}주차 수업 안내
            </Link>
            <Link href={`/experience/weeks/${week.weekNo}/print`} className="inline-flex min-h-11 items-center text-[14px] font-semibold text-pop-ink-muted hover:text-pop-ink">
              수업 요약 (A4) 보기
            </Link>
          </div>
          <PrintButton />
        </div>

        <article className="rounded-[28px] bg-white p-6 text-pop-ink shadow-pop sm:p-10 print:rounded-none print:p-0 print:shadow-none">
          <header className="flex flex-wrap items-end justify-between gap-3 border-b border-pop-ink/15 pb-4">
            <div>
              <p className="text-[13px] font-bold text-pop-ink-muted">TeachAble Art Play · 상세 수업 지도안 (자료 12개 영역 전체)</p>
              <h1 className={cx("mt-1 font-display text-[30px] leading-tight print:text-[24px]", displayFallback(`${week.weekNo}주차 「${week.title}」`))}>{week.weekNo}주차 「{week.title}」</h1>
              <p className="mt-1 text-[15px] font-semibold">그림책 《{week.storybook}》 · #{week.growthKeyword}</p>
            </div>
            <p className="max-w-[30ch] text-[12px] leading-snug text-pop-ink-muted">
              체험용 구성입니다. 공식 교안으로 확정된 내용이 아닙니다. 문장 옆 표시는 출처입니다 —
              {(["source", "edited", "proposal", "review"] as const).map((o) => ` [${TEXT_ORIGIN_LABEL[o]}]`).join("")}
            </p>
          </header>

          <Section no={1} title="주차 기본 정보">
            <Line label="핵심 주제" text={d.coreTheme} />
            <Line label="성장 키워드" text={d.keyword} />
            <Line label="파트" text={d.part} />
            <Line label="계절 · 방문지" text={d.place ?? x?.seasonPlace} />
            {x?.topicElements ? <Line label="주제 요소 (원안)" text={x.topicElements} /> : null}
            <Line label="교사가 기억할 핵심" text={d.teacherKey} />
            <Line label="대상 연령" text={d.ageRange} />
            <Line label="자료 출처" text={d.dataSource} />
            {x?.makesKit ? <Line label="제작 교구" text={x.makesKit} /> : null}
            <Label>수업 시간</Label>
            <ul className="grid gap-0.5">
              <li>· 자료 PDF — {d.pdfDuration ?? PDF_DURATION_LABEL} <OriginTag origin="source" className="align-middle" /></li>
              <li>· 웹 체험 — {LESSON_TIME.label} ({LESSON_TIME.breakdown}) <OriginTag origin="edited" className="align-middle" /></li>
              <li>· {SHORT_TIME.label} ({SHORT_TIME.breakdown}) — {SHORT_TIME.note} <OriginTag origin="proposal" className="align-middle" /></li>
            </ul>
            <Label>교육 목표</Label>
            {d.goals.length ? <Items items={d.goals} /> : <Items items={proposal?.goals ?? []} origin="proposal" />}
            {prep.length ? (
              <>
                <Label>미리 준비 (수업 전 · 수업 중)</Label>
                <ul className="grid gap-0.5">
                  {prep.map((p) => (
                    <li key={p.text.text}>· {p.when === "before" ? "수업 전" : "수업 중"} — {p.text.text} <OriginTag origin={p.text.origin} className="align-middle" /> → {p.action.text} <OriginTag origin={p.action.origin} className="align-middle" /></li>
                  ))}
                </ul>
              </>
            ) : null}
          </Section>

          <Section no={2} title="그림책">
            <Line label="제목" text={d.storybookTitle ? `《${d.storybookTitle}》` : null} />
            <Line label="줄거리" text={d.storySummary} />
            {d.storyMessage ? <Line label="핵심 메시지" text={d.storyMessage} /> : null}
            {x?.ebook ? <Line label="E-BOOK 제공 여부" text={x.ebook} /> : null}
            <Label>단계별 교사 발문</Label>
            <ol className="grid gap-0.5">
              {week.stages.map((s) => <li key={s.key}>{s.title} — “{s.teacherQuestion}” <OriginTag origin={s.teacherQuestionOrigin} className="align-middle" /></li>)}
            </ol>
            {pdfQuestions(week.weekNo).length ? (
              <>
                <Label>자료에 적힌 발문</Label>
                <Items items={pdfQuestions(week.weekNo).map((q) => `“${q}”`)} />
              </>
            ) : null}
            <p className="text-pop-ink-muted">그림책 파일 · {plan.mediaAssets.some((m) => m.kind === "storybookCover" && m.state === "ready") ? "표지 그림 공개 사용 확인 · 본문 파일은 자료 준비 중" : "자료 준비 중 — 표지 대신 제목 카드로 읽어 줍니다."} [{TEXT_ORIGIN_LABEL.proposal}]</p>
          </Section>

          <Section no={3} title="대표 신체활동">
            {[
              d.physicalTitle ? { title: d.physicalTitle, lead: d.physicalLead, steps: d.physicalSteps, materials: d.physicalMaterials, core: d.coreExperience, tip: d.activityTip } : null,
              d.physical2 ? { title: d.physical2.title, lead: d.physical2.lead, steps: d.physical2.steps, materials: d.physical2.materials, core: d.physical2.coreExperience, tip: d.physical2.tip } : null,
            ].filter((a) => a !== null).map((a, k) => (
              <div key={a.title} className="break-inside-avoid">
                <p className={cx("font-display text-[18px]", displayFallback(a.title))}>{k === 1 ? "두 번째 활동 · " : ""}{a.title}</p>
                {a.lead ? <p>{a.lead} <OriginTag origin="source" className="align-middle" /></p> : null}
                <Label>진행 순서 ({a.steps.length}단계)</Label>
                <ol className="grid gap-1">
                  {a.steps.map((s, i) => <li key={s.title}><span className="font-bold">{i + 1}. {s.title}</span>{s.guide ? <> — {s.guide}</> : null} <OriginTag origin="source" className="align-middle" /></li>)}
                </ol>
                {a.materials.length ? <><Label>준비물</Label><Items items={a.materials} /></> : null}
                {a.core ? <Line label="핵심 경험" text={a.core} /> : null}
                {a.tip ? <Line label="활동 TIP" text={a.tip} /> : null}
              </div>
            ))}
            {!d.physicalTitle ? <p className="text-pop-ink-muted">{NONE}</p> : null}
          </Section>

          <Section no={4} title="미술활동">
            {d.artTitle ? <p className={cx("font-display text-[18px]", displayFallback(d.artTitle))}>{d.artTitle}</p> : <p className="text-pop-ink-muted">{NONE}</p>}
            {d.artLead ? <p>{d.artLead} <OriginTag origin="source" className="align-middle" /></p> : null}
            <Label>만드는 순서</Label>
            <Items items={d.artSteps} ordered />
            {x?.artUse.length ? <><Label>활용 방법</Label><Items items={x.artUse} /></> : null}
            {x?.artExamples.length ? <><Label>예시</Label><Items items={x.artExamples} /></> : null}
            {x?.artTip ? <Line label="TIP" text={x.artTip} /> : null}
          </Section>

          <Section no={5} title="워크북">
            {d.workbookTitle ? <p className="font-bold">{d.workbookTitle}</p> : null}
            {d.workbookSheets.length ? (
              <ol className="grid gap-1">
                {d.workbookSheets.map((s, i) => <li key={s.title}><span className="font-bold">{i + 1}장 · {s.title}</span>{s.guide ? <> — {s.guide}</> : null} <OriginTag origin="source" className="align-middle" /></li>)}
              </ol>
            ) : <p className="text-pop-ink-muted">{NONE}</p>}
            <p className="text-pop-ink-muted">워크북 인쇄 파일 · 자료 준비 중 — {LESSON_TIME.label} 밖의 선택 확장활동입니다. 파일이 오기 전에는 장마다 적힌 활동을 종이에 그려 진행합니다 [{TEXT_ORIGIN_LABEL.proposal}].</p>
          </Section>

          <Section no={6} title="교구 · 놀이자료 키트">
            {x?.kitNotice ? <p className="font-semibold">{x.kitNotice} <OriginTag origin="source" className="align-middle" /></p> : null}
            {x?.kitName ? <p className={cx("font-display text-[18px]", displayFallback(x.kitName))}>{x.kitName}</p> : null}
            {x?.kitLead.map((l) => <p key={l}>{l} <OriginTag origin="source" className="align-middle" /></p>)}
            <Label>키트 구성품</Label>
            <Items items={d.kitItems} />
            <Label>기관 준비물</Label>
            <Items items={d.orgItems} empty={d.missingInSource.includes("준비물") ? BLANK : NONE} />
            {x?.kitMissions.length ? <><Label>활동 방법 · 미션</Label><Items items={x.kitMissions} ordered /></> : null}
            {x?.kitUse ? <Line label="활용" text={x.kitUse} /> : null}
            {week.body.safety.length ? <><Label>안전 확인</Label><Items items={week.body.safety} origin="proposal" /></> : null}
            <p className="text-pop-ink-muted">교구 사진 · 자료 준비 중 — 구성품 이름으로 확인합니다.</p>
          </Section>

          <Section no={7} title="가족연계 활동" breakBefore>
            {d.familyTitle ? <p className={cx("font-display text-[18px]", displayFallback(d.familyTitle))}>{d.familyTitle}</p> : <p className="text-pop-ink-muted">{NONE}</p>}
            {x?.familyLead ? <p>{x.familyLead} <OriginTag origin={isEditedLine(week.weekNo, x.familyLead) ? "edited" : "source"} className="align-middle" /></p> : null}
            {d.familyHow.length ? (
              <>
                <Label>활동 방법</Label>
                <ol className="grid gap-0.5">
                  {d.familyHow.map((h, i) => <li key={h}>{i + 1}. {h} <OriginTag origin={isEditedLine(week.weekNo, h) ? "edited" : "source"} className="align-middle" /></li>)}
                </ol>
              </>
            ) : null}
            {d.familyTalk.length ? <><Label>이렇게 이야기해 보세요</Label><Items items={d.familyTalk.map((t) => `“${t}”`)} edited={(q) => isEditedLine(week.weekNo, q.slice(1, -1))} /></> : null}
            {x?.familyNote ? <Line label="안내" text={x.familyNote} /> : null}
            {x?.familyTip ? <Line label="TIP" text={x.familyTip} /> : null}
          </Section>

          <Section no={8} title="가정용 교구 · 교사 지원자료">
            <Line label={d.supportType === "teacherPrint" ? "교사용 출력 자료" : d.supportType === "teacherPrep" ? "교사 사전 준비" : "가정용 교구"} text={d.homeKitName} />
            {d.homeKitLead ? <p>{d.homeKitLead} <OriginTag origin="source" className="align-middle" /></p> : null}
            {d.homeKitItems.length ? <><Label>구성품</Label><Items items={d.homeKitItems} edited={(i) => isEditedLine(week.weekNo, i)} /></> : null}
            {d.homeKitHow.length ? <><Label>{d.supportType === "teacherPrep" ? "준비 순서" : "활동 방법"}</Label><Items items={d.homeKitHow} ordered /></> : null}
            {x?.homeKitNote ? <Line label="안내" text={x.homeKitNote} /> : null}
          </Section>

          <Section no={9} title="누리과정 연계">
            {d.nuri.length ? (
              <div className="grid gap-2 sm:grid-cols-2 print:grid-cols-2">
                {d.nuri.map((n) => <div key={n.area} className="break-inside-avoid"><p className="font-bold">{n.area}</p><Items items={n.items} /></div>)}
              </div>
            ) : <p className="text-pop-ink-muted">{NONE}</p>}
          </Section>

          <Section no={10} title="동화책 음원 · 캐릭터 뮤직비디오">
            <Label>음원 목록</Label>
            <Items items={d.media} ordered />
            {x?.videoDesc ? <Line label="캐릭터 뮤직비디오" text={x.videoDesc} /> : null}
            <p className="text-pop-ink-muted">
              음원 · 영상 파일 · 자료 준비 중{x?.videoUrlNote ? ` (자료의 영상 URL 칸: 「${x.videoUrlNote}」)` : ""} — 파일이 오기 전에는 선생님이 노래 가사를 읽어 주거나 리듬만 손뼉으로 함께합니다 [{TEXT_ORIGIN_LABEL.proposal}].
            </p>
          </Section>

          <Section no={11} title="교사 운영 · 관찰 · 성장 기록" breakBefore>
            {teacherPoint ? <Line label="교사 운영 포인트" text={teacherPoint} origin={d.teacherPoint ? "source" : "proposal"} /> : null}
            <Label>{LESSON_TIME.label} 진행 (단계별)</Label>
            <ol className="grid gap-2">
              {week.stages.map((s, i) => (
                <li key={s.key} className="break-inside-avoid">
                  <p className="font-bold">{i + 1}. {s.title} · 약 {s.minutes}분 — “{s.teacherQuestion}” <OriginTag origin={s.teacherQuestionOrigin} className="align-middle" /></p>
                  <ol className="ml-4 grid gap-0.5">
                    {s.steps.map((t, j) => <li key={t.text}>{j + 1}) {t.text} <OriginTag origin={t.origin} className="align-middle" /></li>)}
                  </ol>
                  {s.materials.length ? <p className="ml-4 text-pop-ink-muted">준비물 · {s.materials.join(" · ")}</p> : null}
                  {s.transition ? <p className="ml-4 text-pop-ink-muted">다음 단계로 · “{s.transition}” [{TEXT_ORIGIN_LABEL.proposal}]</p> : null}
                </li>
              ))}
            </ol>
            <Label>관찰 문항</Label>
            {d.observations.length ? <Items items={d.observations} /> : <Items items={proposal?.observations ?? []} origin="proposal" />}
            <Label>활동별 관찰 → 5대 성장지표 [{TEXT_ORIGIN_LABEL.proposal}]</Label>
            {[...plan.physicalActivities, ...(plan.artActivity ? [plan.artActivity] : [])].map((a) => (
              <div key={a.id} className="break-inside-avoid">
                <p className="font-bold">{a.kind === "art" ? "미술" : "신체"} · {a.title}</p>
                <ul className="grid gap-0.5">
                  {a.observations.map((o) => <li key={o.item}>· {o.item} — <span className="font-bold">{o.indicators.map(indicatorName).join(" · ") || "지표 연결 없음"}</span></li>)}
                </ul>
              </div>
            ))}
            <p className="text-pop-ink-muted">5대 지표 — {GROWTH_INDICATORS.map((g) => g.name).join(" · ")}. 점수 · 등급이 아니라 그 활동에서 본 모습을 적는 기준입니다.</p>
            <Label>성장기록 예시</Label>
            <p>{d.kidsnote ?? (d.missingInSource.includes("성장기록 예시") ? BLANK : NONE)}{d.kidsnote ? <> <OriginTag origin="source" className="align-middle" /></> : null}</p>
            {d.parentNotice.length ? <><Label>부모님께 드리는 안내</Label><Items items={d.parentNotice} /></> : null}
          </Section>

          <Section no={12} title="주차 연계 산출물">
            <Line label="이 주차 결과물" text={d.artTitle} />
            <Line label="주차 연계 (자료 원문)" text={d.crossWeek} />
            {plan.crossWeekOutputs.gather.length ? <><Label>앞 주차에서 모아 올 것</Label><Items items={plan.crossWeekOutputs.gather} /></> : null}
          </Section>

          <Section no={13} title="자료 파일 상태 (PDF 그림 자리)">
            <ul className="grid gap-1">
              {[...assetsBy.entries()].map(([label, list]) => (
                <li key={label}>
                  · {label} — {list.filter((a) => a.state === "ready").length ? `공개 파일 ${list.filter((a) => a.state === "ready").length}개` : "자료 준비 중"} ({list.length}자리)
                  {list.find((a) => a.state !== "ready" && a.fallback)?.fallback ? <> · 대체 운영: {list.find((a) => a.state !== "ready" && a.fallback)!.fallback!.text} <OriginTag origin="proposal" className="align-middle" /></> : null}
                </li>
              ))}
            </ul>
            <p className="text-pop-ink-muted">공개 사용이 확인된 파일만 싣습니다. 다른 주차의 그림을 대신 쓰지 않습니다.</p>
            {editedLines(week.weekNo).length ? (
              <>
                <Label>자료 원문을 고쳐 쓴 문장</Label>
                <ul className="grid gap-0.5">
                  {editedLines(week.weekNo).map((e) => <li key={e.text}>· 「{e.text}」 <OriginTag origin="edited" className="align-middle" /> ← 원문 「{e.original}」 · {e.reason}</li>)}
                </ul>
              </>
            ) : null}
          </Section>
        </article>
      </div>
    </main>
  );
}
