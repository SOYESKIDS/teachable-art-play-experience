import { weekSource, SOURCE_STATE_LABEL } from "@/data/experience/teacher-dashboard/source-register";

/**
 * 주차 자료 상태 — 읽기 전용.
 *
 * ── 왜 두는가 ──────────────────────────────────────────────────
 *
 * 교사가 이 화면의 수업을 그대로 따라 준비하면 안 되는 주차가 있다. 받은 원본
 * 자료와 제목 · 주제 · 시간이 다른 곳이 있고, 자료 자체가 초안이다. 그 사실을
 * 화면에서 가리면 교사는 확정된 교안으로 읽는다.
 *
 * ★ 사이트의 주차명 · 키워드 · 수업 내용을 여기서 바꾸지 않는다. 다른 점만 적는다.
 * ★ 원본 자료의 제목은 담지 않는다 — 제목 변경은 승인 전 보류이고, 일부 글자를
 *   제목 글꼴이 그리지 못한다. 원문은 docs/curriculum 대조표에 있다.
 * ★ 입력란 · 저장 · 전송이 없다. 읽기만 하는 안내다.
 */
export function WeekSourcePanel({ weekNo }: { weekNo: number }) {
  const entry = weekSource(weekNo);
  if (!entry) return null;

  const hasConflicts = entry.conflicts.length > 0;
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
            entry.state === "source_pdf"
              ? "bg-pop-mint-soft text-pop-mint-deep"
              : "bg-pop-cream text-pop-ink-muted"
          }`}
        >
          {SOURCE_STATE_LABEL[entry.state]}
        </span>
      </div>

      <p className="mt-2 text-[15px] leading-relaxed text-pop-ink-muted">
        받은 원본 자료와 이 화면을 맞대어 본 결과입니다. 자료는 아직 초안이라{" "}
        <strong className="font-bold text-pop-ink">공식 교안으로 확정된 내용이 아닙니다.</strong>
      </p>

      {hasConflicts ? (
        <>
          <p className="mt-5 text-[13px] font-bold text-pop-ink-muted">
            다른 점 {entry.conflicts.length}건
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {entry.conflicts.map((c) => (
              <li
                key={c}
                className="rounded-full bg-pop-cream px-3 py-1.5 text-[14px] font-semibold text-pop-ink"
              >
                {c}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-5 text-[15px] font-semibold text-pop-ink">다른 점 없음</p>
      )}

      <dl className="mt-5 flex flex-col gap-1.5 border-t border-pop-ink/5 pt-5 text-[13px] leading-relaxed text-pop-ink-muted">
        <div className="flex gap-2">
          <dt className="shrink-0 font-bold">기본 수업 35분</dt>
          <dd>체험용으로 줄인 편성입니다. 원본 자료의 시간 표기는 따로 보존합니다.</dd>
        </div>
        {entry.assetSlotsOnly ? (
          <div className="flex gap-2">
            <dt className="shrink-0 font-bold">자료의 그림</dt>
            <dd>그림 자리만 있고 실제 그림은 없습니다.</dd>
          </div>
        ) : null}
        <div className="flex gap-2">
          <dt className="shrink-0 font-bold">자세한 대조</dt>
          <dd>개발 문서에 적었습니다.</dd>
        </div>
      </dl>
    </section>
  );
}
