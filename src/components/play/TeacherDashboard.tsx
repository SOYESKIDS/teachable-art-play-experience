"use client";

import { useState } from "react";
import { weekDashboard } from "@/data/experience/teacher-dashboard/week-dashboards";
import type { ExperienceWeek } from "@/data/experience/types";

/**
 * 교사용 수업 준비 자료 — 읽기 전용.
 *
 * ── 무엇을 보여 주나 ───────────────────────────────────────────
 *
 * 대시보드 자료에서 뽑은 내용을 교사가 수업 순서대로 읽도록 여덟 묶음으로
 * 나눈다. 긴 설명서를 처음부터 읽지 않아도 지금 필요한 것만 펼쳐 볼 수 있다.
 *
 * ★ 자료에 없는 항목은 비워 두고 「자료에서 확인하지 못했습니다」로 적는다.
 *   지어내서 채우지 않는다 — 교사가 그대로 따라 하는 글이다.
 * ★ 음원 · 영상은 실제 파일이나 주소가 없다. 눌러도 아무 일이 없는 재생 단추를
 *   두지 않고 「자료 준비 중」으로 적는다.
 * ★ 원아 정보를 넣거나 저장하는 자리를 만들지 않는다. 관찰 문장은 예시다.
 * ★ 기본 수업 35분은 체험용 편성이고, 자료의 시간 표기는 원문 그대로 함께 둔다.
 */

const NONE = "자료에서 확인하지 못했습니다.";

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
    <details className="group rounded-[24px] bg-pop-cream ring-1 ring-pop-ink/5 open:bg-white open:shadow-pop">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 text-[17px] font-bold text-pop-ink">
        <span className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pop-ink text-[13px] font-extrabold text-white">
            {no}
          </span>
          {title}
          {typeof count === "number" && count > 0 ? (
            <span className="rounded-full bg-white px-2 py-0.5 text-[12px] font-bold text-pop-ink-muted">
              {count}
            </span>
          ) : null}
        </span>
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-pop-ink-muted transition-transform group-open:rotate-45"
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

function List({ items, empty }: { items: readonly string[]; empty: string }) {
  if (items.length === 0) {
    return <p className="text-[14px] text-pop-ink-muted">{empty}</p>;
  }
  return (
    <ul className="flex flex-col gap-1.5">
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

export function TeacherDashboard({ week }: { week: ExperienceWeek }) {
  const d = weekDashboard(week.weekNo);
  if (!d) return null;

  return (
    <section aria-labelledby="teacher-dash" className="mt-14">
      <h2 id="teacher-dash" className="font-display text-[30px] text-pop-ink sm:text-[36px]">
        교사 준비 자료
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-pop-ink-muted">
        수업 순서대로 묶어 두었어요. 필요한 것만 펼쳐 보세요. 자료는 아직 초안이라{" "}
        <strong className="font-bold text-pop-ink">공식 교안으로 확정된 내용이 아닙니다.</strong>
      </p>

      {d.missingInSource.length > 0 ? (
        <p className="mt-3 rounded-2xl bg-pop-cream px-4 py-3 text-[14px] leading-relaxed text-pop-ink">
          이 주차 자료에는 {d.missingInSource.join(" · ")}이(가) 비어 있습니다. 검수가 필요합니다.
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3">
        <Fold no={1} title="주차 수업 개요">
          <dl>
            <Row label="핵심 주제" value={d.coreTheme} />
            <Row label="성장 키워드" value={d.keyword} />
            <Row label="기억할 것" value={d.teacherKey} />
            <Row label="파트" value={d.part} />
            <Row label="계절 · 장소" value={d.place} />
            <Row label="대상 연령" value={d.ageRange} />
            <Row label="기본 수업" value={`${week.totalMinutes}분 (체험용 편성)`} />
            <Row label="자료의 시간" value={d.pdfDuration} />
            <Row label="자료 출처" value={d.dataSource} />
          </dl>
        </Fold>

        <Fold no={2} title="수업 전 준비" count={d.physicalMaterials.length + d.orgItems.length}>
          <p className="text-[13px] font-bold text-pop-ink-muted">활동 준비물</p>
          <div className="mt-1.5">
            <List items={d.physicalMaterials} empty={NONE} />
          </div>
          {d.orgItems.length > 0 ? (
            <>
              <p className="mt-4 text-[13px] font-bold text-pop-ink-muted">기관 준비물</p>
              <div className="mt-1.5">
                <List items={d.orgItems} empty={NONE} />
              </div>
            </>
          ) : null}
          {d.activityTip ? (
            <p className="mt-4 rounded-2xl bg-pop-mint-soft px-4 py-3 text-[14px] leading-relaxed text-pop-ink">
              {d.activityTip}
            </p>
          ) : null}
        </Fold>

        <Fold no={3} title="그림책과 이야기 나누기">
          {d.storybookTitle ? (
            <p className="font-display text-[20px] text-pop-ink">《{d.storybookTitle}》</p>
          ) : (
            <p className="text-[14px] text-pop-ink-muted">{NONE}</p>
          )}
          {d.storySummary ? <p className="mt-2">{d.storySummary}</p> : null}
          {d.storyMessage ? (
            <p className="mt-3 rounded-2xl bg-pop-sky-soft px-4 py-3 text-[15px] font-semibold text-pop-ink">
              {d.storyMessage}
            </p>
          ) : null}
        </Fold>

        <Fold no={4} title="수업 진행" count={d.physicalSteps.length}>
          <p className="text-[13px] font-bold text-pop-ink-muted">
            이 사이트의 기본 수업 {week.totalMinutes}분 다섯 단계
          </p>
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
          {d.physicalTitle ? (
            <>
              <p className="mt-4 text-[13px] font-bold text-pop-ink-muted">자료의 대표활동</p>
              <p className="mt-1 font-display text-[19px] text-pop-ink">{d.physicalTitle}</p>
              {d.physicalLead ? <p className="mt-1">{d.physicalLead}</p> : null}
              <ol className="mt-3 flex flex-col gap-2.5">
                {d.physicalSteps.map((s, i) => (
                  <li key={i} className="rounded-2xl bg-pop-cream p-3.5">
                    <p className="font-bold text-pop-ink">
                      {i + 1}. {s.title}
                    </p>
                    <p className="mt-0.5 text-[14px] leading-relaxed text-pop-ink-muted">{s.guide}</p>
                  </li>
                ))}
              </ol>
            </>
          ) : null}
          {d.coreExperience ? (
            <p className="mt-3 text-[14px] leading-relaxed text-pop-ink-muted">
              핵심 경험 · {d.coreExperience}
            </p>
          ) : null}
        </Fold>

        <Fold
          no={5}
          title="미술 · 워크북 · 확장활동"
          count={d.artSteps.length + d.workbookSheets.length}
        >
          {d.artTitle ? (
            <>
              <p className="font-display text-[19px] text-pop-ink">{d.artTitle}</p>
              {d.artLead ? <p className="mt-1">{d.artLead}</p> : null}
              <div className="mt-2">
                <List items={d.artSteps} empty={NONE} />
              </div>
            </>
          ) : (
            <p className="text-[14px] text-pop-ink-muted">{NONE}</p>
          )}
          {d.workbookSheets.length > 0 ? (
            <>
              <p className="mt-4 text-[13px] font-bold text-pop-ink-muted">
                워크북{d.workbookTitle ? ` · ${d.workbookTitle}` : ""} (선택 확장활동)
              </p>
              <ul className="mt-1.5 flex flex-col gap-1.5">
                {d.workbookSheets.map((s, i) => (
                  <li key={i}>
                    <span className="font-semibold">{s.title}</span> — {s.guide}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </Fold>

        <Fold no={6} title="교구와 안전" count={d.kitItems.length}>
          <p className="text-[13px] font-bold text-pop-ink-muted">키트 구성품</p>
          <div className="mt-1.5">
            <List items={d.kitItems} empty={NONE} />
          </div>
          {week.body.safety.length > 0 ? (
            <>
              <p className="mt-4 text-[13px] font-bold text-pop-ink-muted">안전 주의</p>
              <div className="mt-1.5">
                <List items={week.body.safety} empty={NONE} />
              </div>
            </>
          ) : null}
        </Fold>

        <Fold no={7} title="관찰과 가정연계" count={d.observations.length}>
          <p className="text-[13px] font-bold text-pop-ink-muted">관찰 포인트 (예시)</p>
          <div className="mt-1.5">
            <List items={d.observations} empty={NONE} />
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-pop-ink-muted">
            이 화면에는 원아 정보를 적거나 저장하는 자리가 없습니다.
          </p>
          {d.goals.length > 0 ? (
            <>
              <p className="mt-4 text-[13px] font-bold text-pop-ink-muted">활동 목표</p>
              <div className="mt-1.5">
                <List items={d.goals} empty={NONE} />
              </div>
            </>
          ) : null}
          {d.familyTitle ? (
            <>
              <p className="mt-4 text-[13px] font-bold text-pop-ink-muted">
                가정연계 · {d.familyTitle}
              </p>
              <div className="mt-1.5">
                <List items={d.familyHow} empty={NONE} />
              </div>
            </>
          ) : null}
          {d.parentNotice.length > 0 ? (
            <>
              <p className="mt-4 text-[13px] font-bold text-pop-ink-muted">가정 안내 문구</p>
              <div className="mt-1.5">
                <List items={d.parentNotice} empty={NONE} />
              </div>
              <CopyBlock lines={d.parentNotice} />
            </>
          ) : null}
        </Fold>

        <Fold no={8} title="수업 자료" count={d.media.length}>
          <p className="text-[13px] font-bold text-pop-ink-muted">음원</p>
          <div className="mt-1.5">
            <List items={d.media} empty={NONE} />
          </div>
          <p className="mt-3 rounded-2xl bg-pop-cream px-4 py-3 text-[14px] leading-relaxed text-pop-ink">
            음원 · 영상 · 그림은 <strong className="font-bold">자료 준비 중</strong>입니다. 자료에
            자리만 있고 실제 파일이 없어, 눌러도 열리지 않는 단추를 두지 않았습니다.
          </p>
          {d.teacherPoint ? (
            <>
              <p className="mt-4 text-[13px] font-bold text-pop-ink-muted">교사 운영 포인트</p>
              <p className="mt-1">{d.teacherPoint}</p>
            </>
          ) : null}
        </Fold>
      </div>
    </section>
  );
}
