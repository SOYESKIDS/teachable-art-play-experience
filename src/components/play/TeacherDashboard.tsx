"use client";

import { useState } from "react";
import { cx } from "@/components/ui/cx";
import { CoverTitleNote, WeekArt } from "@/components/play/WeekArt";
import { OriginLegend, OriginTag } from "@/components/play/OriginTag";
import { displayFallback } from "@/components/play/display-font";
import { TEACHER_POINT_PROPOSALS, weekProposal } from "@/data/experience/teacher-dashboard/proposals";
import Link from "next/link";
import { gatherForWeek, isEditedLine, pdfQuestions, weekDashboard } from "@/data/experience/teacher-dashboard/week-dashboards";
import { TEXT_ORIGIN_LABEL, type ExperienceWeek, type TextOrigin } from "@/data/experience/types";
import { LESSON_TIME, SOURCE_TIME_NOTE } from "@/lib/weeks/lesson-time";
import { CHECK_STATE_NOTE, SAFETY_ORIGIN, type CheckGroup, type MediaRow } from "@/data/experience/lesson-labels";
import { GROWTH_INDICATORS, REPORT_READING_NOTES } from "@/data/experience/report";
import type { Sourced } from "@/data/experience/types";
import { LessonChecks, MediaStatusTable } from "@/components/play/LessonChecks";

/** 페이지(서버)가 만들어 넘기는 묶음 — 수업 확인 목록 · 미디어 상태 · 목표 · 앞뒤 주차 */
export interface DashboardSupport {
  pre: readonly CheckGroup[];
  media: readonly MediaRow[];
  goals: readonly Sourced[];
  prev: { weekNo: number; title: string } | null;
  next: { weekNo: number; title: string } | null;
  integration: string | null;
}

/**
 * 교사용 수업 대시보드 — 읽기 전용.
 *
 * ── 무엇을 보여 주나 ───────────────────────────────────────────
 *
 * 주차 자료(PDF)의 열두 영역을 그대로 담되, 종이 배치를 베끼지 않고 화면에서
 * 읽기 좋게 접어 둔다. 교사가 긴 설명서를 처음부터 읽지 않아도 지금 필요한
 * 묶음만 펼쳐 볼 수 있다.
 *
 * ★ 자료에 없는 항목은 비워 두고 「자료에서 확인하지 못했습니다」로 적는다.
 *   지어내서 채우지 않는다 — 교사가 그대로 따라 하는 글이다.
 * ★ 원문에 「미작성」이라고 적힌 항목은 따로 밝힌다. 자료를 못 읽은 것이
 *   아니라 원본이 비어 있다.
 * ★ 음원 · 영상은 실제 파일이 없다. 눌러도 열리지 않는 재생 단추를 두지 않고
 *   「자료 준비 중」으로 적는다.
 * ★ 원아 정보를 넣거나 저장하는 자리를 만들지 않는다. 관찰 문장은 예시다.
 * ★ 운영 시간은 LESSON_TIME(기본 수업) 하나다. 자료의 CORE 표기는 출처 기록으로만 적는다.
 * ★ 관찰 문항 · 활동 목표는 문장마다 출처 상태를 밝힌다 —
 *   공식 원문(자료 PDF) · 교사용 제안(proposals.ts, 검수 전) · 검수 필요(둘 다 없음).
 */

const NONE = "자료에서 확인하지 못했습니다.";

/** 원문에 「미작성」이라고 적힌 칸 — 자료를 못 읽은 것(NONE)과 구분한다 */
const BLANK_IN_SOURCE = "자료 원문에 「미작성」으로 적혀 있습니다. 본사 검수 때 채울 자리입니다.";

const SUPPORT_LABEL = {
  homeKit: "가정용 교구 (가정에서 쓰는 것)",
  teacherPrint: "교사용 출력 자료 (교실 게시용)",
  teacherPrep: "교사 사전 준비",
} as const;

function OriginBadge({ origin }: { origin: TextOrigin }) {
  return <OriginTag origin={origin} />;
}

/**
 * 출처 상태가 붙는 목록 — 자료 원문이 있으면 원문, 없으면 교사용 제안, 둘 다 없으면 검수 필요.
 */
function OriginList({ label, source, proposal }: { label: string; source: readonly string[]; proposal: readonly string[] }) {
  const origin: TextOrigin = source.length > 0 ? "source" : proposal.length > 0 ? "proposal" : "review";
  const items = origin === "source" ? source : proposal;
  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-2 first:mt-0">
        <p className="text-[13px] font-bold text-pop-ink-muted">{label}</p>
        <OriginBadge origin={origin} />
      </div>
      {origin === "review" ? (
        <p className="mt-1.5 text-[14px] text-pop-ink-muted">{NONE} 본사 검수 때 채울 자리입니다.</p>
      ) : (
        <List items={items} />
      )}
      {origin === "proposal" ? (
        <p className="mt-2 text-[13px] leading-relaxed text-pop-ink-muted">
          자료에 비어 있어 같은 주차 수업 장면을 바탕으로 교사용 제안을 적었습니다. 본사 검수 전이며,
          아이를 평가하는 기준이 아니라 수업 중 볼 수 있는 행동입니다.
        </p>
      ) : null}
    </>
  );
}

function Fold({
  no,
  title,
  count,
  children,
}: {
  no: number;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <details id={`dash-area-${no}`} className="group scroll-mt-28 rounded-[24px] bg-pop-cream ring-1 ring-pop-ink/5 open:bg-white open:shadow-pop">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-2 text-[17px] font-bold text-pop-ink">
        <span className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pop-ink text-[13px] font-extrabold text-white">
            {no}
          </span>
          <span>{title}</span>
          {typeof count === "number" && count > 0 ? (
            <span className="rounded-full bg-white px-2 py-0.5 text-[12px] font-bold text-pop-ink-muted">
              {count}
            </span>
          ) : null}
        </span>
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-pop-ink-muted transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="px-5 pb-5 text-[15px] leading-relaxed text-pop-ink">{children}</div>
    </details>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-1.5">
      <dt className="w-24 shrink-0 text-[13px] font-bold text-pop-ink-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Head({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-[13px] font-bold text-pop-ink-muted first:mt-0">{children}</p>;
}

function List({ items, empty }: { items: readonly string[]; empty?: string }) {
  if (items.length === 0) {
    return empty ? <p className="text-[14px] text-pop-ink-muted">{empty}</p> : null;
  }
  return (
    <ul className="mt-1.5 flex flex-col gap-1.5">
      {items.map((x, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden="true" className="text-pop-ink-muted">·</span>
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * 수업 준비 한눈에 — 열두 영역 가운데 수업 전에 꼭 보는 일곱 가지를 한 줄씩.
 *
 * ★ 누르면 그 영역을 펼치고 그 자리로 간다. 긴 자료를 처음부터 읽지 않아도 된다.
 * ★ 새 내용을 만들지 않는다 — 아래 영역에 이미 있는 자료 문장 · 개수만 보인다.
 */
/** 영역(들)을 펼치고 첫 자리로 간다. 영역이 아닌 묶음(id)도 받는다. */
function goTo(ids: readonly string[]) {
  let first: HTMLElement | null = null;
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el instanceof HTMLDetailsElement) el.open = true;
    if (el && !first) first = el;
  }
  first?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const area = (n: number) => `dash-area-${n}`;

/**
 * 교사 업무 메뉴 — 원본 명세의 여덟 업무(WK · LS · PR · OB · RP · FM · MD · CW).
 *
 * ★ 새 내용을 만들지 않는다. 같은 화면의 열두 영역 · 기본 수업 진행 단계 · 준비 카드로 바로 간다.
 *   업무 하나가 여러 영역을 묶으면 그 영역을 함께 펼친다.
 */
const TASKS: readonly { code: string; name: string; hint: string; ids: readonly string[]; areas: readonly number[] }[] = [
  { code: "WK", name: "주간 개요", hint: "주제 · 목표 · 누리과정", ids: [area(1), area(9)], areas: [1, 9] },
  { code: "LS", name: "수업 진행 가이드", hint: `${LESSON_TIME.totalMinutes}분 단계 · 발문 · 그림책 · 활동`, ids: ["lesson-plan"], areas: [2, 3, 4] },
  { code: "PR", name: "준비 · 물류", hint: "준비물 · 키트 · 안전 · 정리", ids: ["dash-prep", area(6), area(8)], areas: [6, 8] },
  { code: "OB", name: "관찰 포인트", hint: "수업 중 볼 행동 · 운영 포인트", ids: [area(11)], areas: [11] },
  { code: "RP", name: "성장 리포트", hint: "성장기록 예시 · 가상 리포트", ids: [area(12)], areas: [12] },
  { code: "FM", name: "가정 연계", hint: "가족 활동 · 부모 안내 문구", ids: [area(7), area(12)], areas: [7, 12] },
  { code: "MD", name: "미디어 라이브러리", hint: "그림책 표지 · 음원 · 영상", ids: [area(10)], areas: [10] },
  { code: "CW", name: "주차 연계 산출물", hint: "결과물 · 다음 주차 · 모아 올 것", ids: ["dash-cw"], areas: [4, 12] },
];

function TaskMenu({ color }: { color: string }) {
  return (
    <nav aria-label="교사 업무 메뉴" className="mt-5 rounded-[28px] bg-white p-4 ring-1 ring-pop-ink/5 sm:p-5">
      <p className="text-[14px] font-extrabold text-pop-ink">교사 업무 메뉴</p>
      <ul className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {TASKS.map((x) => (
          <li key={x.code}>
            <button
              type="button"
              onClick={() => goTo(x.ids)}
              className="flex h-full min-h-[88px] w-full flex-col items-start gap-1 rounded-2xl bg-pop-cream px-3.5 py-3 text-left ring-1 ring-pop-ink/5 transition-colors hover:bg-pop-yellow-soft"
            >
              <span className="flex items-center gap-2">
                <span className="rounded-lg px-1.5 py-0.5 text-[12px] font-extrabold tracking-wide text-white" style={{ backgroundColor: color }}>{x.code}</span>
                <span className="text-[15px] font-bold leading-snug text-pop-ink">{x.name}</span>
              </span>
              <span className="text-[12px] font-semibold leading-snug text-pop-ink-muted">{x.hint}</span>
              <span className="text-[11px] font-semibold text-pop-ink-muted">영역 {x.areas.join(" · ")}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function PrepSummary({ tiles }: { tiles: readonly { area: number; label: string; title: string; detail: string }[] }) {
  const open = (n: number) => goTo([area(n)]);
  return (
    <div className="mt-5 rounded-[28px] bg-white p-4 ring-1 ring-pop-ink/5 sm:p-5">
      <p className="text-[14px] font-extrabold text-pop-ink">수업 준비 한눈에</p>
      <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.label}>
            <button
              type="button"
              onClick={() => open(t.area)}
              className="flex h-full min-h-[76px] w-full flex-col items-start gap-0.5 rounded-2xl bg-pop-cream px-4 py-3 text-left ring-1 ring-pop-ink/5 transition-colors hover:bg-pop-yellow-soft"
            >
              <span className="text-[12px] font-bold text-pop-ink-muted">{t.label}</span>
              <span className="line-clamp-2 text-[15px] font-bold leading-snug text-pop-ink">{t.title}</span>
              <span className="text-[12px] font-semibold text-pop-ink-muted">{t.detail}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 준비물 체크리스트 — 교사가 눈으로 보는 용도. 아무것도 저장하지 않는다. */
function CheckList({ items }: { items: readonly string[] }) {
  const [done, setDone] = useState<readonly number[]>([]);
  if (items.length === 0) return <p className="text-[14px] text-pop-ink-muted">{NONE}</p>;
  return (
    <>
    <p className="mt-1 text-[12px] font-semibold text-pop-ink-muted">{CHECK_STATE_NOTE}</p>
    <ul className="mt-1.5 flex flex-col gap-1">
      {items.map((x, i) => {
        const on = done.includes(i);
        return (
          <li key={i}>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => setDone((d) => (d.includes(i) ? d.filter((n) => n !== i) : [...d, i]))}
              className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-2 text-left hover:bg-pop-cream"
            >
              <span
                aria-hidden="true"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-[12px] font-bold ${
                  on ? "border-pop-mint-deep bg-pop-mint-deep text-white" : "border-pop-ink/20 text-transparent"
                }`}
              >
                ✓
              </span>
              <span className={on ? "text-pop-ink-muted line-through" : ""}>{x}</span>
            </button>
          </li>
        );
      })}
    </ul>
    </>
  );
}

/**
 * 가정 안내 문구 복사.
 *
 * ★ 교사의 클립보드에만 넣는다. 어디로도 보내지 않고 저장하지 않는다.
 * ★ 복사가 막힌 환경에서 조용히 실패하지 않는다 — 직접 복사하라고 알린다.
 */
function CopyBlock({ lines }: { lines: readonly string[] }) {
  const [note, setNote] = useState<string | null>(null);
  if (lines.length === 0) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setNote("복사했어요. 가정 안내에 붙여넣어 주세요.");
    } catch {
      setNote("자동 복사가 막혀 있어요. 위 글을 직접 선택해 복사해 주세요.");
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-11 items-center rounded-full border border-pop-ink/15 bg-white px-4 text-[14px] font-bold text-pop-ink"
      >
        가정 안내 문구 복사
      </button>
      {note ? (
        <span role="status" className="text-[13px] font-semibold text-pop-ink-muted">
          {note}
        </span>
      ) : null}
    </div>
  );
}

export function TeacherDashboard({ week, support }: { week: ExperienceWeek; support: DashboardSupport }) {
  const d = weekDashboard(week.weekNo);
  if (!d) return null;
  const proposal = weekProposal(week.weekNo);
  // 통합 주차(8 · 16 · 24) — 앞 주차 자료의 「주차 연계」 원문을 모은다
  const gather = gatherForWeek(week.weekNo);
  const moveStage = week.stages.find((s) => s.key === "move");
  const makeStage = week.stages.find((s) => s.key === "make");

  const tone = { borderColor: `${week.themeColor}55` };

  return (
    <section aria-labelledby="teacher-dash" className="mt-14">
      <h2 id="teacher-dash" className="font-display text-[30px] text-pop-ink sm:text-[36px]">
        교사용 수업 대시보드
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-pop-ink-muted">
        주차 자료의 열두 영역입니다. 필요한 묶음만 펼쳐 보세요. 자료는 아직 초안이라{" "}
        <strong className="font-bold text-pop-ink">공식 교안으로 확정된 내용이 아닙니다.</strong>
      </p>

      <OriginLegend className="mt-3" />

      <TaskMenu color={week.themeColor} />

      {d.missingInSource.length > 0 ? (
        <p className="mt-3 rounded-2xl border-2 bg-pop-cream px-4 py-3 text-[14px] leading-relaxed text-pop-ink" style={tone}>
          이 주차 자료에는 {d.missingInSource.join(" · ")}이(가) 비어 있습니다. 검수가 필요합니다.
        </p>
      ) : null}

      <PrepSummary
        tiles={[
          { area: 2, label: "그림책", title: d.storybookTitle ? `《${d.storybookTitle}》` : NONE, detail: d.storySummary ? "줄거리 · 핵심 메시지" : "그림책 정보" },
          { area: 3, label: "대표 신체활동", title: d.physicalTitle ?? NONE, detail: d.physicalSteps.length ? `진행 ${d.physicalSteps.length}단계` : "단계 자료 없음" },
          { area: 4, label: "미술", title: d.artTitle ?? week.outcome ?? NONE, detail: d.artSteps.length ? `만드는 순서 ${d.artSteps.length}단계` : "만드는 순서는 체험 구성 참고" },
          { area: 5, label: "워크북", title: d.workbookTitle ?? "워크북", detail: d.workbookSheets.length ? `${d.workbookSheets.length}장 · 선택 확장활동` : NONE },
          { area: 6, label: "준비물", title: (d.physicalMaterials.length ? d.physicalMaterials : d.kitItems).slice(0, 2).join(" · ") || NONE, detail: `체크리스트 ${d.physicalMaterials.length}가지 · 키트 ${d.kitItems.length}가지` },
          { area: 7, label: "가정연계", title: d.familyTitle ?? NONE, detail: d.familyHow.length ? `방법 ${d.familyHow.length}단계` : "방법 자료 없음" },
          { area: 2, label: "교사 발문", title: `“${week.body.teacherQuestions[0]}”`, detail: `발문 ${week.body.teacherQuestions.length}개 + 마무리 질문` },
          { area: 11, label: "관찰 포인트", title: `관찰 문항 ${week.teacherObservations.items.length}개`, detail: TEXT_ORIGIN_LABEL[week.teacherObservations.origin] },
        ]}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <a href="#lesson-plan" className="inline-flex min-h-11 items-center rounded-full bg-pop-ink px-4 text-[14px] font-bold text-white">{LESSON_TIME.label} 진행 단계 보기</a>
        <Link href={`/experience/classroom/${week.weekNo}`} className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-[14px] font-bold text-pop-ink ring-1 ring-pop-ink/10">교실 플레이어 열기</Link>
        <Link href={`/experience/weeks/${week.weekNo}/print`} className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-[14px] font-bold text-pop-ink ring-1 ring-pop-ink/10">인쇄용 수업 요약</Link>
      </div>

      {week.body.safety.length > 0 ? (
        <div className="mt-4 rounded-[24px] border-2 border-pop-pink-deep/30 bg-pop-pink-soft px-5 py-4">
          <p className="flex flex-wrap items-center gap-2 text-[14px] font-extrabold text-pop-pink-deep">안전 먼저 — 수업 전에 확인해요 <OriginTag origin={SAFETY_ORIGIN} /></p>
          <ul className="mt-1.5 grid gap-1 text-[15px] leading-relaxed text-pop-ink">{week.body.safety.map((x) => <li key={x}>· {x}</li>)}</ul>
        </div>
      ) : null}

      <div id="dash-prep" className="mt-4 scroll-mt-28 rounded-[24px] bg-white px-5 py-4 ring-1 ring-pop-ink/5">
        <p className="text-[14px] font-extrabold text-pop-ink">수업 전 준비 · 공간 · 정리 — 선생님 혼자 운영할 때</p>
        <ul className="mt-2 grid gap-1.5 text-[14px] leading-relaxed text-pop-ink">
          {week.prep.before.filter((x) => !gather.includes(x.text)).map((x) => (
            <li key={x.text} className="flex flex-wrap items-baseline gap-x-2"><span>· {x.text}</span><OriginTag origin={x.origin} /></li>
          ))}
          <li className="flex flex-wrap items-baseline gap-x-2"><span><strong className="font-bold">공간 · </strong>{week.prep.space.text}</span><OriginTag origin={week.prep.space.origin} /></li>
          <li className="flex flex-wrap items-baseline gap-x-2"><span><strong className="font-bold">정리 · </strong>{week.prep.cleanup.text}</span><OriginTag origin={week.prep.cleanup.origin} /></li>
        </ul>
        <details className="group mt-3 rounded-2xl bg-pop-cream ring-1 ring-pop-ink/5 open:bg-white">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 text-[14px] font-bold text-pop-ink [&::-webkit-details-marker]:hidden">
            <span>수업 시작 전 확인 체크리스트 (목표 · 교구 · 공간 · 안전 · 발문 · 미디어)</span>
            <span aria-hidden="true" className="text-[18px] text-pop-ink-muted transition-transform group-open:rotate-45">+</span>
          </summary>
          <LessonChecks groups={support.pre} className="px-3 pb-4" />
        </details>
      </div>

      <div id="dash-cw" className="mt-4 scroll-mt-28 rounded-[24px] bg-white px-5 py-4 ring-1 ring-pop-ink/5">
        <p className="text-[14px] font-extrabold text-pop-ink">주차 연계 산출물</p>
        {support.integration ? (
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-[14px] font-bold text-pop-ink"><span>{support.integration}</span><OriginTag origin="edited" /></p>
        ) : null}
        <ul className="mt-2 grid gap-1.5 text-[14px] leading-relaxed text-pop-ink">
          <li className="flex flex-wrap items-baseline gap-x-2">
            <span><strong className="font-bold">이 주차 결과물 · </strong>{d.artTitle ?? NONE}</span>
            {d.artTitle ? <OriginTag origin="source" /> : null}
          </li>
          <li className="flex flex-wrap items-baseline gap-x-2">
            <span><strong className="font-bold">다음 주차로 · </strong>{d.crossWeek ?? NONE}</span>
            {d.crossWeek ? <OriginTag origin="source" /> : null}
          </li>
        </ul>
        {gather.length > 0 ? (
          <>
            <p className="mt-3 text-[14px] font-extrabold text-pop-ink">앞 주차에서 모아 올 것 · 수업 전 체크</p>
            <p className="mt-0.5 text-[13px] text-pop-ink-muted">각 주차 자료의 「주차 연계」 원문입니다. 이 주차는 앞선 결과물을 모아 완성하는 통합 주차예요.</p>
            <CheckList items={gather} />
          </>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Fold no={1} title="주차 기본 정보와 교육 목표" count={d.goals.length || proposal?.goals.length}>
          <div className="mb-4 grid gap-2 rounded-2xl border-2 bg-white p-4 sm:grid-cols-2" style={tone}>
            <p className="text-[13px] font-extrabold text-pop-ink-muted sm:col-span-2">주간 개요</p>
            <p><span className="text-[13px] font-bold text-pop-ink-muted">주차 · </span>{week.weekNo}주차 「{week.title}」</p>
            <p><span className="text-[13px] font-bold text-pop-ink-muted">성장 키워드 · </span>#{week.growthKeyword}</p>
            <p className="flex flex-wrap items-baseline gap-x-2 sm:col-span-2"><span><span className="text-[13px] font-bold text-pop-ink-muted">핵심 목표 · </span>{support.goals[0]?.text ?? NONE}</span>{support.goals[0] ? <OriginTag origin={support.goals[0].origin} /> : null}</p>
            <p><span className="text-[13px] font-bold text-pop-ink-muted">대표 신체활동 · </span>{d.physicalTitle ?? NONE}</p>
            <p><span className="text-[13px] font-bold text-pop-ink-muted">미술 · </span>{d.artTitle ?? NONE}</p>
            <p><span className="text-[13px] font-bold text-pop-ink-muted">준비 · </span>교구 {d.kitItems.length}가지 · 원 준비물 {d.orgItems.length}가지 · 안전 {week.body.safety.length}가지</p>
            <p><span className="text-[13px] font-bold text-pop-ink-muted">수업 시간 · </span>{LESSON_TIME.label} ({LESSON_TIME.breakdown})</p>
            <p className="flex flex-wrap gap-2 pt-1 sm:col-span-2">
              {support.prev ? <Link href={`/experience/weeks/${support.prev.weekNo}`} className="inline-flex min-h-11 items-center rounded-full bg-pop-cream px-4 text-[14px] font-bold text-pop-ink">← {support.prev.weekNo}주 「{support.prev.title}」</Link> : null}
              {support.next ? <Link href={`/experience/weeks/${support.next.weekNo}`} className="inline-flex min-h-11 items-center rounded-full bg-pop-cream px-4 text-[14px] font-bold text-pop-ink">{support.next.weekNo}주 「{support.next.title}」 →</Link> : null}
            </p>
          </div>
          <dl>
            <Row label="핵심 주제" value={d.coreTheme} />
            <Row label="성장 키워드" value={d.keyword} />
            <Row label="기억할 것" value={d.teacherKey} />
            <Row label="파트" value={d.part} />
            <Row label="계절 · 장소" value={d.place} />
            <Row label="대상 연령" value={d.ageRange} />
            <Row label="자료 출처" value={d.dataSource} />
          </dl>
          <OriginList label="교육 목표" source={d.goals} proposal={proposal?.goals ?? []} />
          <div className="mt-4 rounded-2xl border-2 bg-white px-4 py-3" style={tone}>
            <p className="text-[13px] font-bold text-pop-ink-muted">수업 시간</p>
            <p className="mt-1">
              운영 기준 <strong className="font-bold">{LESSON_TIME.label}</strong> ({LESSON_TIME.breakdown}) +
              선택 확장활동
            </p>
            <p className="mt-1 text-[14px] text-pop-ink-muted">
              자료 표기 「{week.duration.pdfDurationLabel}」
              {week.duration.legacyGuideDurationLabel ? ` · 이전 가이드 「${week.duration.legacyGuideDurationLabel}」` : ""} — {SOURCE_TIME_NOTE}.
            </p>
          </div>
        </Fold>

        <Fold no={2} title="그림책">
          <WeekArt week={week} className="mb-4 aspect-[4/3] w-full max-w-[280px] rounded-[20px] ring-1 ring-pop-ink/5" />
          {d.storybookTitle ? (
            <p className={cx("font-display text-[20px] text-pop-ink", displayFallback(d.storybookTitle))}>《{d.storybookTitle}》</p>
          ) : (
            <p className="text-[14px] text-pop-ink-muted">{NONE}</p>
          )}
          <CoverTitleNote week={week} className="mt-1" />
          {d.storySummary ? <p className="mt-2">{d.storySummary}</p> : null}
          {d.storyMessage ? (
            <p className="mt-3 rounded-2xl bg-pop-sky-soft px-4 py-3 text-[15px] font-semibold text-pop-ink">
              {d.storyMessage}
            </p>
          ) : null}
          <Head>교사 발문 — {LESSON_TIME.label} 단계 순서</Head>
          <ol className="mt-1.5 flex flex-col gap-1.5">
            {week.stages.map((s) => (
              <li key={s.key} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="shrink-0 text-[13px] font-bold text-pop-ink-muted">{s.title}</span>
                <span>“{s.teacherQuestion}”</span>
                <OriginTag origin={s.teacherQuestionOrigin} />
              </li>
            ))}
          </ol>
          {pdfQuestions(week.weekNo).length > 0 ? (
            <>
              <Head>자료에 적힌 발문 (진행 팁 · 운영 포인트 속 문장)</Head>
              <ul className="mt-1.5 flex flex-col gap-1">
                {pdfQuestions(week.weekNo).map((q) => (
                  <li key={q} className="flex flex-wrap items-baseline gap-x-2"><span>“{q}”</span><OriginTag origin="source" /></li>
                ))}
              </ul>
            </>
          ) : null}
          <p className="mt-2 text-[13px] leading-relaxed text-pop-ink-muted">
            정답을 묻지 않고, 아이가 본 것 · 한 것을 자기 말로 하게 돕는 질문입니다. 교실 플레이어 교사 화면에 같은 순서로 나옵니다.
          </p>
        </Fold>

        <Fold no={3} title="대표 신체활동과 단계별 진행" count={d.physicalSteps.length}>
          {d.physicalTitle ? (
            <>
              <p className={cx("font-display text-[19px] text-pop-ink", displayFallback(d.physicalTitle))}>{d.physicalTitle}</p>
              {d.physicalLead ? <p className="mt-1">{d.physicalLead}</p> : null}
            </>
          ) : (
            <p className="text-[14px] text-pop-ink-muted">{NONE}</p>
          )}
          <ol className="mt-3 flex flex-col gap-2.5">
            {d.physicalSteps.map((s, i) => (
              <li key={i} className="rounded-2xl border-2 bg-white p-3.5" style={tone}>
                <p className="font-bold text-pop-ink">
                  {i + 1}. {s.title}
                </p>
                <p className="mt-0.5 text-[14px] leading-relaxed text-pop-ink-muted">{s.guide}</p>
              </li>
            ))}
          </ol>
          {d.coreExperience ? (
            <>
              <Head>핵심 경험</Head>
              <p className="mt-1">{d.coreExperience}</p>
            </>
          ) : null}
          {d.activityTip ? (
            <p className="mt-4 rounded-2xl bg-pop-mint-soft px-4 py-3 text-[14px] leading-relaxed text-pop-ink">
              진행 팁 · {d.activityTip}
            </p>
          ) : null}
          {d.physical2 ? (
            <div className="mt-5 rounded-2xl bg-pop-cream p-4">
              <p className="text-[13px] font-bold text-pop-ink-muted">두 번째 대표활동 (자료 원문)</p>
              <p className={cx("mt-1 font-display text-[19px] text-pop-ink", displayFallback(d.physical2.title))}>{d.physical2.title}</p>
              <p className="mt-1">{d.physical2.lead}</p>
              <ol className="mt-2 flex flex-col gap-1.5">
                {d.physical2.steps.map((s, i) => <li key={s.title}><span className="font-bold">{i + 1}. {s.title}</span> — {s.guide}</li>)}
              </ol>
              {d.physical2.tip ? <p className="mt-2 text-[14px] text-pop-ink-muted">진행 팁 · {d.physical2.tip}</p> : null}
            </div>
          ) : null}
          <Head>이 사이트의 {LESSON_TIME.label}</Head>
          <ol className="mt-1.5 flex flex-col gap-1.5">
            {week.stages.map((s, i) => (
              <li key={s.key} className="flex gap-2">
                <span className="shrink-0 font-bold text-pop-ink-muted">{i + 1}</span>
                <span>
                  {s.title} · 약 {s.minutes}분
                </span>
              </li>
            ))}
          </ol>
        </Fold>

        <Fold no={4} title="미술활동과 만드는 순서" count={d.artSteps.length}>
          {d.artTitle ? (
            <>
              <p className={cx("font-display text-[19px] text-pop-ink", displayFallback(d.artTitle))}>{d.artTitle}</p>
              {d.artLead ? <p className="mt-1">{d.artLead}</p> : null}
              <Head>만드는 순서</Head>
              <List items={d.artSteps} empty={NONE} />
            </>
          ) : (
            <p className="text-[14px] text-pop-ink-muted">{NONE}</p>
          )}
        </Fold>

        <Fold no={5} title="워크북" count={d.workbookSheets.length}>
          {d.workbookTitle ? (
            <p className={cx("font-display text-[19px] text-pop-ink", displayFallback(d.workbookTitle))}>{d.workbookTitle}</p>
          ) : null}
          {d.workbookSheets.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-2">
              {d.workbookSheets.map((s, i) => (
                <li key={i} className="rounded-2xl bg-pop-cream p-3.5">
                  <p className="font-bold text-pop-ink">
                    {i + 1}. {s.title}
                  </p>
                  <p className="mt-0.5 text-[14px] leading-relaxed text-pop-ink-muted">{s.guide}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px] text-pop-ink-muted">{NONE}</p>
          )}
          <p className="mt-3 text-[14px] leading-relaxed text-pop-ink-muted">
            워크북은 선택 확장활동입니다. {LESSON_TIME.label} 안에 넣지 않습니다. 워크북 인쇄 파일 · 교구 사진은 자료 준비 중입니다.
          </p>
        </Fold>

        <Fold no={6} title="교구와 놀이자료 키트" count={d.kitItems.length}>
          <Head>키트 구성품</Head>
          <List items={d.kitItems} empty={NONE} />
          <Head>기관 준비물</Head>
          <List items={d.orgItems} empty={d.missingInSource.includes("준비물") ? BLANK_IN_SOURCE : NONE} />
          <Head>활동 준비물 체크리스트</Head>
          <CheckList items={moveStage?.materials ?? d.physicalMaterials} />
          <Head>언제 쓰나요 · 교구 사용 시점</Head>
          <dl className="mt-1.5 grid gap-2 text-[14px]">
            {[moveStage, makeStage].map((s) => (s && s.materials.length ? (
              <div key={s.key} className="rounded-2xl bg-pop-cream px-3.5 py-2.5">
                <dt className="font-bold text-pop-ink">{s.title} · 약 {s.minutes}분</dt>
                <dd className="mt-0.5 text-pop-ink-muted">{s.materials.join(" · ")}</dd>
              </div>
            ) : null))}
          </dl>
          <p className="mt-1.5 text-[12px] text-pop-ink-muted">자료의 구성품을 수업 단계에 나눠 보인 것입니다. 수업 전에 한 번 확인해 주세요.</p>
          {week.body.safety.length > 0 ? (
            <>
              <Head>안전 주의사항</Head>
              <List items={week.body.safety} />
            </>
          ) : null}
        </Fold>

        <Fold no={7} title="가족연계 활동" count={d.familyHow.length}>
          {d.familyTitle ? (
            <p className={cx("font-display text-[19px] text-pop-ink", displayFallback(d.familyTitle))}>{d.familyTitle}</p>
          ) : (
            <p className="text-[14px] text-pop-ink-muted">{NONE}</p>
          )}
          {d.familyHow.length > 0 ? (
            <>
              <Head>활동 방법</Head>
              <ul className="mt-1.5 flex flex-col gap-1.5">
                {d.familyHow.map((x) => (
                  <li key={x} className="flex flex-wrap items-baseline gap-x-2">
                    <span><span aria-hidden="true" className="text-pop-ink-muted">· </span>{x}</span>
                    {isEditedLine(week.weekNo, x) ? <OriginTag origin="edited" /> : null}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {d.familyTalk.length > 0 ? (
            <>
              <Head>이렇게 이야기해 보세요</Head>
              <List items={d.familyTalk} />
            </>
          ) : null}
          {d.familyTitle ? (
            <>
              <Head>학부모 안내 카드 미리보기 (자료 원문으로 만든 예시)</Head>
              <div className="mt-2 max-w-[440px] overflow-hidden rounded-[24px] bg-white shadow-pop ring-1 ring-pop-ink/5">
                <div className="px-5 py-3 text-white" style={{ backgroundColor: week.themeColor }}>
                  <p className="text-[12px] font-bold">{week.weekNo}주차 가정 연계 · {week.title}</p>
                  <p className={cx("mt-0.5 font-display text-[20px]", displayFallback(d.familyTitle))}>{d.familyTitle}</p>
                </div>
                <div className="grid gap-2 px-5 py-4 text-[14px] leading-relaxed text-pop-ink">
                  {d.familyHow.length ? <ol className="grid gap-1">{d.familyHow.map((x, i) => <li key={x}>{i + 1}. {x}</li>)}</ol> : null}
                  {d.familyTalk.length ? <p className="rounded-xl bg-pop-cream px-3 py-2">💬 {d.familyTalk.map((x) => `“${x}”`).join(" ")}</p> : null}
                  {d.homeKitName && (d.supportType ?? "homeKit") === "homeKit" ? <p className="text-[13px] text-pop-ink-muted">가정용 교구 · {d.homeKitName}</p> : null}
                </div>
              </div>
              <p className="mt-2 text-[12px] text-pop-ink-muted">아이 이름 · 사진을 넣는 칸이 없습니다. 보내기 기능 없이 복사 · 인쇄만 됩니다.</p>
              <CopyBlock lines={[d.familyTitle, ...d.familyHow.map((x, i) => `${i + 1}. ${x}`), ...d.familyTalk.map((x) => `“${x}”`)]} />
            </>
          ) : null}
        </Fold>

        <Fold no={8} title="가정용 교구 · 교사 지원자료" count={d.homeKitItems.length || d.homeKitHow.length}>
          <p className="mb-2 inline-flex rounded-full bg-pop-cream px-3 py-1 text-[12px] font-bold text-pop-ink-muted">
            {SUPPORT_LABEL[d.supportType ?? "homeKit"]}
          </p>
          {d.homeKitName ? (
            <>
              <p className={cx("font-display text-[19px] text-pop-ink", displayFallback(d.homeKitName))}>{d.homeKitName}</p>
              {d.homeKitLead ? <p className="mt-1">{d.homeKitLead}</p> : null}
              {d.homeKitItems.length > 0 ? (
                <>
                  <Head>구성품</Head>
                  <List items={d.homeKitItems} />
                </>
              ) : null}
              {d.homeKitHow.length > 0 ? (
                <>
                  <Head>{d.supportType === "teacherPrep" ? "교사 사전 준비 체크" : "활동 방법"}</Head>
                  {d.supportType === "teacherPrep" ? <CheckList items={d.homeKitHow} /> : <List items={d.homeKitHow} />}
                </>
              ) : null}
            </>
          ) : (
            <p className="text-[14px] text-pop-ink-muted">{NONE}</p>
          )}
        </Fold>

        <Fold no={9} title="누리과정 연계" count={d.nuri.length}>
          {d.nuri.length > 0 ? (
            <div className="mt-1 grid gap-3 sm:grid-cols-2">
              {d.nuri.map((n) => (
                <div key={n.area} className="rounded-2xl border-2 bg-white p-3.5" style={tone}>
                  <p className="font-bold text-pop-ink">{n.area}</p>
                  <List items={n.items} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-pop-ink-muted">{NONE}</p>
          )}
        </Fold>

        <Fold no={10} title="동화책 음원과 뮤직비디오" count={d.media.length}>
          <Head>미디어 보유 상태</Head>
          <div className="mt-1.5"><MediaStatusTable rows={support.media} /></div>
          <Head>음원 목록 (자료 원문)</Head>
          <List items={d.media} empty={NONE} />
          <p className="mt-3 rounded-2xl bg-pop-cream px-4 py-3 text-[14px] leading-relaxed text-pop-ink">
            음원 · 영상 파일은 <strong className="font-bold">자료 준비 중</strong>입니다. 자료에
            자리만 있고 실제 파일이 없어, 눌러도 열리지 않는 단추를 두지 않았습니다.
          </p>
        </Fold>

        <Fold no={11} title="관찰 포인트" count={d.observations.length || proposal?.observations.length}>
          <OriginList label="관찰 문항" source={d.observations} proposal={proposal?.observations ?? []} />
          <p className="mt-3 text-[13px] leading-relaxed text-pop-ink-muted">
            보기 예시입니다. 이 화면에는 원아 정보를 적거나 저장하는 자리가 없습니다.
          </p>
          <Head>관찰할 때 (주간 성장리포트 원문)</Head>
          <ul className="mt-1.5 grid gap-1 text-[14px] leading-relaxed">
            {REPORT_READING_NOTES.slice(0, 3).map((x) => <li key={x} className="flex flex-wrap items-baseline gap-x-2"><span>· {x}</span><OriginTag origin="source" /></li>)}
          </ul>
          {d.kidsnote ? (
            <>
              <Head>행동 관찰 기록 예시 (자료의 성장기록 예시)</Head>
              <p className="mt-1 rounded-2xl bg-pop-cream px-4 py-3 text-[14px] leading-relaxed">{d.kidsnote} <OriginTag origin="source" className="align-middle" /></p>
            </>
          ) : null}
          {d.teacherPoint ? (
            <>
              <Head>교사 운영 포인트</Head>
              <p className="mt-1">{d.teacherPoint} <OriginTag origin="source" className="align-middle" /></p>
            </>
          ) : TEACHER_POINT_PROPOSALS[week.weekNo] ? (
            <>
              <Head>교사 운영 포인트</Head>
              <p className="mt-1">{TEACHER_POINT_PROPOSALS[week.weekNo]} <OriginTag origin="proposal" className="align-middle" /></p>
              <p className="mt-1 text-[12px] text-pop-ink-muted">이 주차 자료에는 운영 포인트가 없어 교사용 제안을 적었습니다 (본사 검수 전).</p>
            </>
          ) : null}
        </Fold>

        <Fold no={12} title="성장기록 예시와 가정 안내" count={d.parentNotice.length}>
          <Head>성장기록 예시</Head>
          {d.kidsnote ? (
            <p className="mt-1 rounded-2xl bg-pop-cream px-4 py-3 leading-relaxed">{d.kidsnote}</p>
          ) : (
            <p className="mt-1 text-[14px] text-pop-ink-muted">{d.missingInSource.includes("성장기록 예시") ? BLANK_IN_SOURCE : NONE}</p>
          )}
          {d.parentNotice.length > 0 ? (
            <>
              <Head>부모님께 드리는 안내</Head>
              <List items={d.parentNotice} />
              <CopyBlock lines={d.parentNotice} />
            </>
          ) : null}
          <Head>소예키즈 5대 성장지표 (주간 성장리포트 원문)</Head>
          <ul className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
            {GROWTH_INDICATORS.map((g) => (
              <li key={g.code} className="rounded-2xl bg-pop-cream px-3.5 py-2.5 text-[14px] leading-relaxed">
                <span className="font-bold text-pop-ink">{g.name}</span> <span className="text-pop-ink-muted">— {g.definition}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1.5 text-[12px] text-pop-ink-muted">점수 · 등급이 아니라 그 활동에서 필요했던 도움 방식을 적는 지표입니다. 실제 기록 · 보호자 공유는 기관용 서비스에서만 합니다.</p>
          <Link href="/experience/report" className="mt-3 mr-2 inline-flex min-h-11 items-center rounded-full bg-white px-4 text-[14px] font-bold text-pop-ink ring-1 ring-pop-ink/10">
            성장 리포트 예시 보기 (가상)
          </Link>
          {week.weekNo < 24 ? (
            <Link href={`/experience/weeks/${week.weekNo + 1}`} className="mt-3 inline-flex min-h-11 items-center rounded-full bg-white px-4 text-[14px] font-bold text-pop-ink ring-1 ring-pop-ink/10">
              다음 주차 {week.weekNo + 1}주 보기 →
            </Link>
          ) : null}
        </Fold>
      </div>
    </section>
  );
}
