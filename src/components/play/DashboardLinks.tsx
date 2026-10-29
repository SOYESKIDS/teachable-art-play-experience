"use client";

import Link from "next/link";
import { cx } from "@/components/ui/cx";
import { KIDSBOARD_SETS, KIDSBOARD_SOURCE, KIDSBOARD_STATE_LABEL, kidsboardRows, kidsboardSetFor, type KidsboardState } from "@/data/experience/kidsboard";

/**
 * 교사 대시보드의 이동 · 연결 묶음 — 수업 흐름 · 키즈보드 · 그림 자리 상태.
 * ★ 새 수업 내용을 만들지 않는다. 같은 화면의 영역을 펼치거나 다른 체험 화면으로 간다.
 */

/** 영역(들)을 펼치고 첫 자리로 간다. 영역이 아닌 묶음(id)도 받는다. */
export function goTo(ids: readonly string[]) {
  let first: HTMLElement | null = null;
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el instanceof HTMLDetailsElement) el.open = true;
    // 묶음 카드(수업 준비 등) 안의 접힌 확인 목록도 함께 편다
    else el?.querySelectorAll("details").forEach((x) => { x.open = true; });
    if (el && !first) first = el;
  }
  first?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export const area = (n: number) => `dash-area-${n}`;

/** 수업 흐름 — 준비부터 인쇄까지 이 화면 · 다른 화면으로 차례대로 간다 */
export function LessonFlow({ weekNo }: { weekNo: number }) {
  const steps: readonly { label: string; ids?: readonly string[]; href?: string }[] = [
    { label: "수업 준비", ids: ["dash-prep", area(6)] },
    { label: "동화책", ids: [area(2)] },
    { label: "신체 · 감각 활동", ids: [area(3)] },
    { label: "미술 제작", ids: [area(4)] },
    { label: "워크북 · 교구", ids: [area(5), area(6)] },
    { label: "수업 진행 (플레이어)", href: `/experience/classroom/${weekNo}` },
    { label: "관찰 포인트", ids: [area(11)] },
    { label: "성장 분석 (가상)", href: `/experience/growth-demo?week=${weekNo}` },
    { label: "가정연계 · 키즈보드", ids: [area(7), "dash-kidsboard"] },
    { label: "인쇄 · 상세 지도안", href: `/experience/weeks/${weekNo}/guide` },
  ];
  const cls = "flex min-h-11 w-full items-center gap-2 rounded-2xl bg-pop-cream px-3 py-2 text-left text-[13px] font-bold leading-snug text-pop-ink ring-1 ring-pop-ink/5 transition-colors hover:bg-pop-yellow-soft";
  return (
    <nav aria-label="수업 흐름" className="mt-5 rounded-[28px] bg-white p-4 ring-1 ring-pop-ink/5 sm:p-5">
      <p className="text-[14px] font-extrabold text-pop-ink">수업 흐름 — 차례대로 열어 보세요</p>
      <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {steps.map((s, i) => (
          <li key={s.label}>
            {s.href ? (
              <Link href={s.href} className={cls}><span className="text-pop-ink-muted">{i + 1}</span>{s.label} →</Link>
            ) : (
              <button type="button" onClick={() => goTo(s.ids ?? [])} className={cls}><span className="text-pop-ink-muted">{i + 1}</span>{s.label}</button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

const KB_TONE: Readonly<Record<KidsboardState, string>> = {
  week: "bg-pop-mint-soft text-pop-mint-deep",
  virtual: "bg-pop-lilac-soft text-pop-lilac-deep",
  pending: "bg-white text-pop-ink-muted ring-1 ring-pop-ink/10",
  saas: "bg-pop-pink-soft text-pop-pink-deep",
};

/** 키즈보드 (학부모 앱) — 이 주차 자료와 메뉴의 연결. 실제 공유 · 저장은 없다 */
export function KidsBoardPanel({ weekNo }: { weekNo: number }) {
  const set = kidsboardSetFor(weekNo);
  const rows = kidsboardRows(weekNo);
  const sets = set ? [set] : (["A", "B"] as const);
  return (
    <div id="dash-kidsboard" className="mt-4 scroll-mt-28 rounded-[24px] bg-white px-5 py-4 ring-1 ring-pop-ink/5">
      <p className="flex flex-wrap items-center gap-2 text-[14px] font-extrabold text-pop-ink">
        키즈보드 (학부모 앱) 연결
        <span className="rounded-full bg-pop-cream px-2.5 py-0.5 text-[12px] font-bold text-pop-ink-muted">
          {set ? `자료 원문 · ${KIDSBOARD_SETS[set].label}` : "세트 미정 — 9~24주 자료에 적혀 있지 않습니다 (본사 결정 필요)"}
        </span>
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-pop-ink-muted">
        메뉴 이름 · 설명 출처: {KIDSBOARD_SOURCE}. 공개 체험은 실제 사진 · 영상 · 아이 이름을 받거나 보내지 않습니다.
      </p>
      {sets.map((k) => (
        <div key={k} className="mt-3">
          {!set ? <p className="text-[13px] font-bold text-pop-ink-muted">{KIDSBOARD_SETS[k].label} 메뉴로 보면</p> : null}
          <ul className="mt-1.5 grid gap-2 sm:grid-cols-2">
            {rows.filter((r) => r.set === k).map((r) => (
              <li key={r.name} className="rounded-2xl bg-pop-cream px-4 py-3 text-[14px] leading-relaxed text-pop-ink">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{r.name}</span>
                  <span className={cx("rounded-full px-2 py-0.5 text-[11px] font-extrabold", KB_TONE[r.state])}>{KIDSBOARD_STATE_LABEL[r.state]}</span>
                </p>
                {r.desc ? <p className="text-[13px] text-pop-ink-muted">{r.desc}</p> : null}
                <p className="mt-1">{r.thisWeek}</p>
                {r.href ? (
                  <Link href={r.href} className="mt-1 inline-flex min-h-11 items-center text-[13px] font-bold text-pop-sky-deep underline-offset-4 hover:underline">
                    {r.name} 열어 보기 →
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * 그림 자리 — 파일이 없다는 것을 숨기지 않되, 수업 글보다 앞에 오지 않게 미디어 영역의 「자료 상태」 한곳에 모은다.
 * 어느 자리에 무엇이 들어갈지 PDF 의 ID 로 보인다.
 */
export function SlotStatus({ slots }: { slots: { physical0: readonly string[]; physical1: readonly string[]; art: readonly string[]; workbook: readonly string[] } }) {
  const groups = [
    ["대표 신체활동 단계 사진", slots.physical0],
    ["두 번째 대표활동 단계 사진", slots.physical1],
    ["미술 완성 · 과정 예시", slots.art],
    ["워크북 장", slots.workbook],
  ] as const;
  return (
    <dl className="mt-1.5 grid gap-1.5 text-[13px]">
      {groups.filter(([, ids]) => ids.length).map(([label, ids]) => (
        <div key={label} className="rounded-2xl bg-pop-cream px-3.5 py-2">
          <dt className="font-bold text-pop-ink">{label} · {ids.length}자리 · 자료 준비 중</dt>
          <dd className="mt-0.5 break-all font-mono text-[11px] text-pop-ink-muted">{ids.join(" · ")}</dd>
        </div>
      ))}
    </dl>
  );
}
