"use client";

import { useState } from "react";
import { weekDashboard } from "@/data/experience/teacher-dashboard/week-dashboards";
import type { ExperienceWeek } from "@/data/experience/types";

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
 * ★ 자료의 수업시간(CORE 45분)과 사이트의 기본 35분을 나란히 보여 준다.
 *   어느 하나로 덮어쓰지 않는다.
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

/** 준비물 체크리스트 — 교사가 눈으로 보는 용도. 아무것도 저장하지 않는다. */
function CheckList({ items }: { items: readonly string[] }) {
  const [done, setDone] = useState<readonly number[]>([]);
  if (items.length === 0) return <p className="text-[14px] text-pop-ink-muted">{NONE}</p>;
  return (
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

      {d.missingInSource.length > 0 ? (
        <p className="mt-3 rounded-2xl border-2 bg-pop-cream px-4 py-3 text-[14px] leading-relaxed text-pop-ink" style={tone}>
          이 주차 자료에는 {d.missingInSource.join(" · ")}이(가) 비어 있습니다. 검수가 필요합니다.
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3">
        <Fold no={1} title="주차 기본 정보와 교육 목표" count={d.goals.length}>
          <dl>
            <Row label="핵심 주제" value={d.coreTheme} />
            <Row label="성장 키워드" value={d.keyword} />
            <Row label="기억할 것" value={d.teacherKey} />
            <Row label="파트" value={d.part} />
            <Row label="계절 · 장소" value={d.place} />
            <Row label="대상 연령" value={d.ageRange} />
            <Row label="자료 출처" value={d.dataSource} />
          </dl>
          <Head>교육 목표</Head>
          <List items={d.goals} empty={NONE} />
          <div className="mt-4 rounded-2xl border-2 bg-white px-4 py-3" style={tone}>
            <p className="text-[13px] font-bold text-pop-ink-muted">수업 시간</p>
            <p className="mt-1">
              이 사이트에서 운영하는 <strong className="font-bold">기본 수업 {week.totalMinutes}분</strong> +
              선택 확장활동
            </p>
            {d.pdfDuration ? (
              <p className="mt-1 text-[14px] text-pop-ink-muted">자료 원본 표기 · {d.pdfDuration}</p>
            ) : null}
            <p className="mt-1 text-[14px] text-pop-ink-muted">
              원본 표기는 지우지 않고 함께 적었습니다. 운영 기준은 {week.totalMinutes}분입니다.
            </p>
          </div>
        </Fold>

        <Fold no={2} title="그림책">
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
          <Head>교사 발문</Head>
          <List items={week.body.teacherQuestions} empty={NONE} />
        </Fold>

        <Fold no={3} title="대표 신체활동과 단계별 진행" count={d.physicalSteps.length}>
          {d.physicalTitle ? (
            <>
              <p className="font-display text-[19px] text-pop-ink">{d.physicalTitle}</p>
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
          <Head>이 사이트의 기본 수업 {week.totalMinutes}분</Head>
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
              <p className="font-display text-[19px] text-pop-ink">{d.artTitle}</p>
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
            <p className="font-display text-[19px] text-pop-ink">{d.workbookTitle}</p>
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
            워크북은 선택 확장활동입니다. 기본 수업 {week.totalMinutes}분 안에 넣지 않습니다.
          </p>
        </Fold>

        <Fold no={6} title="교구와 놀이자료 키트" count={d.kitItems.length}>
          <Head>키트 구성품</Head>
          <List items={d.kitItems} empty={NONE} />
          {d.orgItems.length > 0 ? (
            <>
              <Head>기관 준비물</Head>
              <List items={d.orgItems} />
            </>
          ) : null}
          <Head>활동 준비물 체크리스트</Head>
          <CheckList items={d.physicalMaterials} />
          {week.body.safety.length > 0 ? (
            <>
              <Head>안전 주의사항</Head>
              <List items={week.body.safety} />
            </>
          ) : null}
        </Fold>

        <Fold no={7} title="가족연계 활동" count={d.familyHow.length}>
          {d.familyTitle ? (
            <p className="font-display text-[19px] text-pop-ink">{d.familyTitle}</p>
          ) : (
            <p className="text-[14px] text-pop-ink-muted">{NONE}</p>
          )}
          {d.familyHow.length > 0 ? (
            <>
              <Head>활동 방법</Head>
              <List items={d.familyHow} />
            </>
          ) : null}
          {d.familyTalk.length > 0 ? (
            <>
              <Head>이렇게 이야기해 보세요</Head>
              <List items={d.familyTalk} />
            </>
          ) : null}
        </Fold>

        <Fold no={8} title="가정용 교구" count={d.homeKitItems.length}>
          {d.homeKitName ? (
            <>
              <p className="font-display text-[19px] text-pop-ink">{d.homeKitName}</p>
              {d.homeKitLead ? <p className="mt-1">{d.homeKitLead}</p> : null}
              <Head>구성품</Head>
              <List items={d.homeKitItems} empty={NONE} />
              {d.homeKitHow.length > 0 ? (
                <>
                  <Head>활동 방법</Head>
                  <List items={d.homeKitHow} />
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
          <Head>음원</Head>
          <List items={d.media} empty={NONE} />
          <p className="mt-3 rounded-2xl bg-pop-cream px-4 py-3 text-[14px] leading-relaxed text-pop-ink">
            음원 · 영상 · 그림은 <strong className="font-bold">자료 준비 중</strong>입니다. 자료에
            자리만 있고 실제 파일이 없어, 눌러도 열리지 않는 단추를 두지 않았습니다.
          </p>
        </Fold>

        <Fold no={11} title="관찰 포인트" count={d.observations.length}>
          <List items={d.observations} empty={NONE} />
          <p className="mt-3 text-[13px] leading-relaxed text-pop-ink-muted">
            보기 예시입니다. 이 화면에는 원아 정보를 적거나 저장하는 자리가 없습니다.
          </p>
          {d.teacherPoint ? (
            <>
              <Head>교사 운영 포인트</Head>
              <p className="mt-1">{d.teacherPoint}</p>
            </>
          ) : null}
        </Fold>

        <Fold no={12} title="성장기록 예시와 가정 안내" count={d.parentNotice.length}>
          <Head>성장기록 예시</Head>
          {d.kidsnote ? (
            <p className="mt-1 rounded-2xl bg-pop-cream px-4 py-3 leading-relaxed">{d.kidsnote}</p>
          ) : (
            <p className="mt-1 text-[14px] text-pop-ink-muted">{NONE}</p>
          )}
          {d.parentNotice.length > 0 ? (
            <>
              <Head>부모님께 드리는 안내</Head>
              <List items={d.parentNotice} />
              <CopyBlock lines={d.parentNotice} />
            </>
          ) : null}
          {d.crossWeek ? (
            <>
              <Head>다음 주차로 이어지는 것</Head>
              <p className="mt-1">{d.crossWeek}</p>
            </>
          ) : null}
        </Fold>
      </div>
    </section>
  );
}
