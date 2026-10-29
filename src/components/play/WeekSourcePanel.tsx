import { weekSource, SOURCE_STATE_LABEL } from "@/data/experience/teacher-dashboard/source-register";
import { LESSON_TIME, PDF_DURATION_LABEL, PDF_TIME_NOTE } from "@/lib/weeks/lesson-time";

/**
 * 주차 자료 상태 — 읽기 전용.
 *
 * ── 왜 두는가 ──────────────────────────────────────────────────
 *
 * 자료 PDF 가 아직 초안인 주차가 있다. 그 사실을 화면에서 가리면 교사는 확정된
 * 교안으로 읽는다. 또 2026-10-26 에 24주를 자료 기준으로 맞추며 바뀐 것이 있다 —
 * 지난 화면을 본 교사가 무엇이 바뀌었는지 알 수 있게 그대로 적는다.
 *
 * ★ 남은 확인 사항(open)과 맞춘 것(resolved)을 나눠 적는다.
 * ★ 입력란 · 저장 · 전송이 없다. 읽기만 하는 안내다.
 */
export function WeekSourcePanel({ weekNo }: { weekNo: number }) {
  const entry = weekSource(weekNo);
  if (!entry) return null;

  return (
    <section
      aria-labelledby={`week-source-${weekNo}`}
      className="mt-14 rounded-[28px] bg-white p-6 ring-1 ring-pop-ink/5 sm:p-7"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 id={`week-source-${weekNo}`} className="font-display text-[24px] text-pop-ink">
          주차 자료 상태
        </h2>
        <span
          className={`rounded-full px-3 py-1 text-[13px] font-bold ${
            entry.state === "confirmed"
              ? "bg-pop-mint-soft text-pop-mint-deep"
              : "bg-pop-cream text-pop-ink-muted"
          }`}
        >
          {SOURCE_STATE_LABEL[entry.state]}
        </span>
      </div>

      <p className="mt-2 text-[15px] leading-relaxed text-pop-ink-muted">
        받은 주차 자료 PDF 와 이 화면을 맞대어 본 결과입니다.
        {entry.state === "confirmed" ? null : (
          <>
            {" "}자료가 아직 초안이라{" "}
            <strong className="font-bold text-pop-ink">공식 교안으로 확정된 내용이 아닙니다.</strong>
          </>
        )}
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <p className="text-[13px] font-bold text-pop-ink-muted">남은 확인 사항 {entry.open.length}건</p>
          {entry.open.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-1.5">
              {entry.open.map((c) => (
                <li key={c} className="rounded-2xl bg-pop-cream px-3 py-2 text-[14px] font-semibold leading-relaxed text-pop-ink">
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[15px] font-semibold text-pop-ink">없음</p>
          )}
        </div>
        <div>
          <p className="text-[13px] font-bold text-pop-ink-muted">2026년 10월 26일 자료 기준으로 맞춘 것</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {entry.resolved.map((c) => (
              <li key={c} className="rounded-2xl bg-pop-mint-soft px-3 py-2 text-[14px] font-semibold leading-relaxed text-pop-ink">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <dl className="mt-5 flex flex-col gap-1.5 border-t border-pop-ink/5 pt-5 text-[13px] leading-relaxed text-pop-ink-muted">
        <div className="flex flex-wrap gap-x-2">
          <dt className="shrink-0 font-bold">{LESSON_TIME.label}</dt>
          <dd>운영 기준입니다. {LESSON_TIME.connectNote} 단계별 시간은 정하지 않았습니다.</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="shrink-0 font-bold">자료 표기 {PDF_DURATION_LABEL}</dt>
          <dd>{PDF_TIME_NOTE}.</dd>
        </div>
        {entry.assetSlotsOnly ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="shrink-0 font-bold">자료의 그림</dt>
            <dd>그림 자리만 있고 실제 그림은 없습니다.</dd>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-x-2">
          <dt className="shrink-0 font-bold">바꾸기 전 기록</dt>
          <dd>개발 문서(자료 대조표 · 변경 전 스냅샷)에 그대로 남겼습니다.</dd>
        </div>
      </dl>
    </section>
  );
}
