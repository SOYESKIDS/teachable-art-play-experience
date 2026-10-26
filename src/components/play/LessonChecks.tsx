"use client";

import { useState } from "react";
import { cx } from "@/components/ui/cx";
import { OriginTag } from "@/components/play/OriginTag";
import { CHECK_STATE_NOTE, MEDIA_STATE_LABEL, type CheckGroup, type MediaRow } from "@/data/experience/lesson-labels";

/**
 * 수업 전 · 수업 뒤 확인 목록 — 교실 플레이어 · 교사 대시보드가 같은 모양을 쓴다.
 * ★ 체크는 이 컴포넌트 안의 상태일 뿐이다. 저장 · 전송하지 않고, 새로고침하면 사라진다 (안내 문구를 함께 보인다).
 */
export function LessonChecks({ groups, className }: { groups: readonly CheckGroup[]; className?: string }) {
  const [done, setDone] = useState<ReadonlySet<string>>(new Set());
  const toggle = (id: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  return (
    <div className={cx("grid gap-4", className)}>
      <p className="text-[13px] font-semibold text-pop-ink-muted" aria-live="polite">
        {done.size} / {total} 확인 · {CHECK_STATE_NOTE}
      </p>
      {groups.map((g) => (
        <div key={g.key}>
          <p className="text-[13px] font-extrabold text-pop-ink">{g.label}</p>
          <ul className="mt-1 grid gap-0.5">
            {g.items.map((it, i) => {
              const id = `${g.key}-${i}`;
              const on = done.has(id);
              return (
                <li key={id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(id)}
                    className="flex min-h-11 w-full items-start gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-pop-cream"
                  >
                    <span
                      aria-hidden="true"
                      className={cx(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-[12px] font-bold",
                        on ? "border-pop-mint-deep bg-pop-mint-deep text-white" : "border-pop-ink/20 text-transparent",
                      )}
                    >
                      ✓
                    </span>
                    <span className={cx("text-[15px] leading-relaxed", on ? "text-pop-ink-muted line-through" : "text-pop-ink")}>
                      {it.text} <OriginTag origin={it.origin} className="align-middle" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

const STATE_TONE: Record<MediaRow["state"], string> = {
  ready: "bg-pop-mint-soft text-pop-mint-deep",
  listed: "bg-pop-sky-soft text-pop-sky-deep",
  pending: "bg-pop-cream text-pop-ink-muted",
};

/** 미디어 보유 상태 — 빈 그림 칸을 늘어놓지 않고 한 줄씩 상태만 보인다 */
export function MediaStatusTable({ rows }: { rows: readonly MediaRow[] }) {
  return (
    <ul className="grid gap-1.5">
      {rows.map((r) => (
        <li key={r.key} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-white px-3.5 py-2.5 ring-1 ring-pop-ink/5">
          <span className="w-32 shrink-0 text-[14px] font-bold text-pop-ink">{r.label}</span>
          <span className={cx("rounded-full px-2.5 py-0.5 text-[12px] font-extrabold", STATE_TONE[r.state])}>{MEDIA_STATE_LABEL[r.state]}</span>
          <span className="text-[13px] text-pop-ink-muted">{r.detail}</span>
        </li>
      ))}
    </ul>
  );
}
