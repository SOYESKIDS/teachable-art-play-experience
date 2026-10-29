"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PrintButton } from "@/components/play/PrintButton";
import { cx } from "@/components/ui/cx";
import { popButtonClass } from "@/components/play/PopButton";
import { displayFallback } from "@/components/play/display-font";
import { DEMO_SCENARIOS, type DemoScenario } from "@/data/experience/growth-demo-scenarios";
import { GROWTH_INDICATORS, REPORT_GUARDIAN_NOTES, SUPPORT_LEGEND } from "@/data/experience/report";
import type { GrowthMetricCode, SupportLevelCode } from "@/lib/curriculum/taxonomies";
import {
  analyze, bannedReasons, confirmStatement, deleteStatement, detectPII, editStatement, moveTo, nextStateBlockers,
  REVIEW_LABEL, VIRTUAL_CHILDREN, type AnalysisDraft, type DemoEvidence, type DemoObservation, type ReviewDoc, type ReviewState,
} from "@/lib/growth/demo-analysis";
import { weekStarter, type DemoWeek } from "@/lib/growth/week-starter";

/**
 * 가상 성장 분석 시연 — 관찰 기록 → 근거 → 5대 지표 → AI 초안 → 교사 검토 → 승인 → 리포트 미리보기.
 *
 * ★ 브라우저 메모리 안에서만 돈다. 저장 · 전송 · 파일 업로드 · 실제 AI 호출이 없다 (새로고침하면 사라진다).
 * ★ 원아는 가상 원아 셋 가운데 고른다 — 이름 칸이 없다. 글 칸에 실명 · 연락처가 보이면 분석을 막는다.
 * ★ 사진 · 작품은 파일이 아니라 「가상 자료 설명」 한 줄이다.
 */
export type { DemoWeek } from "@/lib/growth/week-starter";

const NAME = Object.fromEntries(GROWTH_INDICATORS.map((g) => [g.code, g.name])) as Record<GrowthMetricCode, string>;
const DEF = Object.fromEntries(GROWTH_INDICATORS.map((g) => [g.code, g.definition])) as Record<GrowthMetricCode, string>;
const SUPPORT_NAME = Object.fromEntries(SUPPORT_LEGEND.map((s) => [s.code, s.name])) as Record<SupportLevelCode, string>;
const FLOW: readonly ReviewState[] = ["ai_draft", "teacher_edited", "reviewed", "approved", "shared"];

const field = "w-full rounded-2xl border border-pop-ink/15 bg-white px-3 py-2.5 text-[15px] text-pop-ink focus:outline-none focus-visible:ring-4 focus-visible:ring-pop-sky/40";

export function GrowthDemo({ weeks }: { weeks: readonly DemoWeek[] }) {
  const [scenarioKey, setScenarioKey] = useState<string>(DEMO_SCENARIOS[0].key);
  const [childLabel, setChildLabel] = useState<string>(DEMO_SCENARIOS[0].childLabel);
  const [weekNo, setWeekNo] = useState<number>(DEMO_SCENARIOS[0].weekNo);
  const [observations, setObservations] = useState<readonly DemoObservation[]>(DEMO_SCENARIOS[0].observations);
  const [evidence, setEvidence] = useState<readonly DemoEvidence[]>(DEMO_SCENARIOS[0].evidence);
  const [draft, setDraft] = useState<AnalysisDraft | null>(null);
  const [doc, setDoc] = useState<ReviewDoc | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // 장면이 처음 가진 문장 — 고르기 선택지 · 「보인 행동만 남기기」에 쓴다
  const [originals, setOriginals] = useState<ReadonlyMap<string, DemoObservation>>(new Map(DEMO_SCENARIOS[0].observations.map((o) => [o.id, o])));
  const week = weeks.find((w) => w.weekNo === weekNo) ?? weeks[0];

  /** 교사 관찰 문장 선택지 — 장면 원래 문장 + 그 활동 이름을 넣은 가상 문장 두 가지 + 기록 없음 */
  function noteOptions(o: DemoObservation): readonly string[] {
    const first = originals.get(o.id)?.teacherNote ?? "";
    return [...new Set([first, o.teacherNote, `「${o.activityTitle}」에서 친구를 본 뒤 따라 해 보았다.`, `「${o.activityTitle}」을 처음부터 끝까지 이어 갔다.`, ""])];
  }

  /** 교사 수정 선택지 — AI 문장을 교사가 확인한 문장으로 바꾼다 */
  function rewrites(obsId: string, evIds: readonly string[]): readonly { label: string; text: string }[] {
    const o = observations.find((x) => x.id === obsId);
    if (!o) return [];
    const out = [{ label: "보인 행동만 남기기", text: `「${o.activityTitle}」 — ${o.teacherNote}${o.childQuote ? ` 아이가 한 말: “${o.childQuote}”.` : ""}` }];
    const hint = evIds.map((id) => evidence.find((e) => e.id === id)?.supportHint).find((h) => h && h !== o.support);
    if (hint) out.push({ label: "자료 설명에 맞춰 고치기", text: `「${o.activityTitle}」 — ${o.teacherNote} 자료로 다시 보니 이 부분은 ‘${SUPPORT_LEGEND.find((s) => s.code === hint)?.meaning}’ 참여했습니다.` });
    return out;
  }

  function load(s: DemoScenario) {
    setOriginals(new Map(s.observations.map((o) => [o.id, o])));
    setScenarioKey(s.key);
    setChildLabel(s.childLabel);
    setWeekNo(s.weekNo);
    setObservations(s.observations);
    setEvidence(s.evidence);
    setDraft(null);
    setDoc(null);
    setNotice(null);
  }

  /** 주차 바꾸기 — 그 주차 자료로만 만든 가상 기록에서 다시 시작한다 */
  function loadWeek(n: number) {
    const w = weeks.find((x) => x.weekNo === n);
    if (!w) return;
    const s = weekStarter(w);
    setOriginals(new Map(s.observations.map((o) => [o.id, o])));
    setScenarioKey(`week-${n}`);
    setWeekNo(n);
    setObservations(s.observations);
    setEvidence(s.evidence);
    setDraft(null);
    setDoc(null);
    setNotice(null);
  }

  // 주차 대시보드에서 넘어오면 (?week=N) 그 주차로 시작한다 — 주소만 읽고 아무것도 저장하지 않는다
  useEffect(() => {
    const n = Number(new URLSearchParams(window.location.search).get("week"));
    if (!Number.isInteger(n) || !weeks.some((w) => w.weekNo === n)) return;
    const id = window.requestAnimationFrame(() => loadWeek(n));
    return () => window.cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 처음 한 번만 주소를 읽는다
  }, []);

  function update(id: string, patch: Partial<DemoObservation>) {
    setObservations((list) => list.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    setDraft(null);
    setDoc(null);
  }

  function addObservation() {
    const act = week.activities[0];
    const item = week.items.find((x) => x.indicators.length) ?? week.items[0];
    const id = `obs-${week.weekNo}-${observations.length + 1}-${Date.now() % 1000}`;
    setObservations((list) => [
      ...list,
      { id, weekNo: week.weekNo, activityId: act.id, activityTitle: act.title, stageKey: act.stage, item: item.item, indicator: item.indicators[0] ?? null,
        teacherNote: "", support: "not_observed", evidenceIds: [], observedAt: "가상 수업", observer: "가상 담임교사" },
    ]);
    setDraft(null);
    setDoc(null);
  }

  function run() {
    const openItems = week.items.map((x) => ({ item: x.item, indicator: x.indicators[0] ?? null }));
    const d = analyze({ childLabel, weekNo, observations, evidence, indicatorName: (c) => NAME[c], indicatorDefinition: (c) => DEF[c], openItems });
    setDraft(d);
    setDoc(d.blocked.length ? null : { state: "ai_draft", statements: d.statements, demo: true });
    setNotice(null);
  }

  function go(to: ReviewState) {
    if (!doc) return;
    const blockers = nextStateBlockers(doc, to);
    if (blockers.length) setNotice(blockers.join(" "));
    else {
      setDoc((d) => (d ? moveTo(d, to) : d));
      setNotice(null);
    }
  }

  const piiLive = useMemo(() => [...new Set(observations.flatMap((o) => [o.teacherNote, o.childQuote ?? "", o.artworkFact ?? ""]).flatMap(detectPII))], [observations]);
  const evById = new Map(evidence.map((e) => [e.id, e]));

  return (
    <div className="grid gap-6">
      {/* 1. 장면 고르기 */}
      <section aria-labelledby="demo-scenes" className="rounded-[28px] bg-white p-5 shadow-pop sm:p-6">
        <h2 id="demo-scenes" className={cx("font-display text-[22px] text-pop-ink", displayFallback("1. 시연 장면 고르기"))}>1. 시연 장면 고르기</h2>
        <p className="mt-1 text-[14px] text-pop-ink-muted">분석 규칙을 하나씩 보여 주는 가상 장면입니다. 기록을 고쳐 직접 해 볼 수도 있어요.</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_SCENARIOS.map((s) => (
            <li key={s.key}>
              <button type="button" aria-pressed={scenarioKey === s.key} onClick={() => load(s)}
                className={cx("flex h-full min-h-[76px] w-full flex-col items-start gap-1 rounded-2xl px-4 py-3 text-left ring-1 ring-pop-ink/5 transition-colors",
                  scenarioKey === s.key ? "bg-pop-lilac-soft" : "bg-pop-cream hover:bg-pop-yellow-soft")}>
                <span className="text-[15px] font-bold text-pop-ink">{s.title}</span>
                <span className="text-[12px] text-pop-ink-muted">{s.weekNo}주차</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 rounded-2xl bg-pop-cream px-4 py-2.5 text-[14px] text-pop-ink">{DEMO_SCENARIOS.find((s) => s.key === scenarioKey)?.expect}</p>
      </section>

      {/* 2. 관찰 기록 */}
      <section aria-labelledby="demo-records" className="rounded-[28px] bg-white p-5 shadow-pop sm:p-6">
        <h2 id="demo-records" className={cx("font-display text-[22px] text-pop-ink", displayFallback("2. 활동별 관찰 기록 (가상)"))}>2. 활동별 관찰 기록 (가상)</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-[13px] font-bold text-pop-ink-muted">가상 원아
            <select className={field} value={childLabel} onChange={(e) => { setChildLabel(e.target.value); setDraft(null); setDoc(null); }}>
              {VIRTUAL_CHILDREN.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-[13px] font-bold text-pop-ink-muted">주차
            <select className={field} value={weekNo} onChange={(e) => loadWeek(Number(e.target.value))}>
              {weeks.map((w) => <option key={w.weekNo} value={w.weekNo}>{w.weekNo}주 「{w.title}」</option>)}
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-3 rounded-2xl bg-pop-sky-soft/60 px-4 py-3 text-[14px] leading-relaxed text-pop-ink sm:grid-cols-2">
          <div>
            <p className="text-[12px] font-extrabold text-pop-ink-muted">{week.weekNo}주 대표활동 (PDF)</p>
            <ul className="mt-1 grid gap-0.5">{week.activities.map((a) => <li key={a.id}>· {a.kind === "art" ? "미술" : "신체"} · {a.title}</li>)}</ul>
          </div>
          <div>
            <p className="text-[12px] font-extrabold text-pop-ink-muted">{week.weekNo}주 관찰 문항 ({week.itemsOrigin === "source" ? "PDF 원문" : "교사용 제안 · 원문 미작성"}) → 5대 지표 (교사용 제안)</p>
            <ul className="mt-1 grid gap-0.5">{week.items.map((x) => <li key={x.item}>· {x.item} <span className="font-bold text-pop-lilac-deep">{x.indicators.map((c) => NAME[c]).join(" · ") || "연결 없음"}</span></li>)}</ul>
          </div>
          <p className="text-[13px] sm:col-span-2">
            <Link href={`/experience/weeks/${week.weekNo}`} className="font-bold text-pop-sky-deep underline-offset-4 hover:underline">{week.weekNo}주 수업 대시보드로 돌아가기</Link>
            {" · "}
            <Link href={`/experience/weeks/${week.weekNo}/guide`} className="font-bold text-pop-sky-deep underline-offset-4 hover:underline">상세 지도안</Link>
          </p>
        </div>
        <ol className="mt-4 grid gap-4">
          {observations.map((o) => {
            const w = weeks.find((x) => x.weekNo === o.weekNo) ?? week;
            const itemLink = w.items.find((x) => x.item === o.item);
            const actItems = w.activities.find((a) => a.id === o.activityId)?.items ?? [];
            const itemChoices = [...actItems, ...w.items.filter((x) => !actItems.some((y) => y.item === x.item))];
            return (
              <li key={o.id} className="rounded-2xl bg-pop-cream p-4 ring-1 ring-pop-ink/5">
                <p className="text-[12px] font-extrabold text-pop-ink-muted">관찰 기록 {o.id} · {o.weekNo}주차 · {o.observedAt} · {o.observer}</p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-[13px] font-bold text-pop-ink-muted">활동 (PDF 대표활동)
                    <select className={field} value={o.activityId} onChange={(e) => {
                      const a = w.activities.find((x) => x.id === e.target.value)!;
                      const it = a.items.find((x) => x.indicators.length) ?? a.items[0];
                      update(o.id, { activityId: a.id, activityTitle: a.title, stageKey: a.stage, ...(it ? { item: it.item, indicator: it.indicators[0] ?? null } : {}) });
                    }}>
                      {w.activities.map((a) => <option key={a.id} value={a.id}>{a.kind === "art" ? "미술" : "신체"} · {a.title}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-1 text-[13px] font-bold text-pop-ink-muted">관찰 문항
                    <select className={field} value={o.item} onChange={(e) => { const it = w.items.find((x) => x.item === e.target.value)!; update(o.id, { item: it.item, indicator: it.indicators[0] ?? null }); }}>
                      {itemChoices.map((x) => <option key={x.item} value={x.item}>{actItems.some((y) => y.item === x.item) ? "이 활동 · " : ""}{x.item}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-1 text-[13px] font-bold text-pop-ink-muted">성장지표 (문항에 연결된 것만 · 교사용 제안)
                    <select className={field} value={o.indicator ?? ""} onChange={(e) => update(o.id, { indicator: (e.target.value || null) as GrowthMetricCode | null })}>
                      <option value="">연결 없음</option>
                      {(itemLink?.indicators ?? []).map((c) => <option key={c} value={c}>{NAME[c]}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-1 text-[13px] font-bold text-pop-ink-muted">도움 방식 (점수가 아닙니다)
                    <select className={field} value={o.support} onChange={(e) => update(o.id, { support: e.target.value as SupportLevelCode })}>
                      {SUPPORT_LEGEND.map((s) => <option key={s.code} value={s.code}>{s.name} · {s.meaning}</option>)}
                    </select>
                  </label>
                  {/* ★ 글을 직접 쓰는 칸이 없다 — 공개 체험은 개인정보를 받지 않는다 (tests/public-security). 가상 문장 가운데 고른다 */}
                  <label className="grid gap-1 text-[13px] font-bold text-pop-ink-muted sm:col-span-2">교사 관찰 문장 (가상 문장 고르기)
                    <select className={field} value={o.teacherNote} onChange={(e) => update(o.id, { teacherNote: e.target.value })}>
                      {noteOptions(o).map((t) => <option key={t || "none"} value={t}>{t || "(관찰 기록 없음)"}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-1 text-[13px] font-bold text-pop-ink-muted">아이가 한 말 (선택)
                    <select className={field} value={o.childQuote ?? ""} onChange={(e) => update(o.id, { childQuote: e.target.value })}>
                      {[...new Set(["", originals.get(o.id)?.childQuote ?? ""])].map((t) => <option key={t || "none"} value={t}>{t ? `“${t}”` : "(없음)"}</option>)}
                    </select>
                  </label>
                  <p className="grid gap-1 text-[13px] font-bold text-pop-ink-muted">작품에서 본 사실
                    <span className="rounded-2xl bg-white px-3 py-2.5 text-[15px] font-normal text-pop-ink ring-1 ring-pop-ink/10">{o.artworkFact || "(없음)"}</span>
                  </p>
                </div>
                {o.evidenceIds.length ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {o.evidenceIds.map((id) => (
                      <li key={id} className="rounded-full bg-white px-3 py-1 text-[13px] text-pop-ink ring-1 ring-pop-ink/10">
                        근거 {id} · {evById.get(id)?.kind === "photo" ? "가상 사진" : evById.get(id)?.kind === "artwork" ? "가상 작품" : "가상 영상"} — {evById.get(id)?.caption}
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-3 text-[13px] text-pop-ink-muted">연결된 사진 · 작품 근거 없음</p>}
                {bannedReasons(o.teacherNote).length ? <p className="mt-2 text-[13px] font-bold text-pop-pink-deep">표현 확인 · {bannedReasons(o.teacherNote).join(" · ")}</p> : null}
              </li>
            );
          })}
        </ol>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={addObservation} className={popButtonClass("white", "md")}>관찰 기록 더하기</button>
          <p className="text-[13px] text-pop-ink-muted">사진 · 영상 파일은 받지 않습니다. 실제 사진은 기관용 서비스에서 보호자 동의 범위 안에서만 다룹니다.</p>
        </div>
        {piiLive.length ? (
          <p role="alert" className="mt-3 rounded-2xl border-2 border-pop-pink-deep/40 bg-pop-pink-soft px-4 py-3 text-[14px] font-bold text-pop-pink-deep">
            개인정보로 보이는 내용이 있습니다 ({piiLive.join(" · ")}). 체험에는 실제 아동 이름 · 연락처를 쓰지 마세요 — 분석이 막힙니다.
          </p>
        ) : null}
      </section>

      {/* 3. 분석 초안 */}
      <section aria-labelledby="demo-draft" className="rounded-[28px] bg-white p-5 shadow-pop sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="demo-draft" className={cx("font-display text-[22px] text-pop-ink", displayFallback("3. 성장 분석 초안 (가상 AI)"))}>3. 성장 분석 초안 (가상 AI)</h2>
          <button type="button" onClick={run} className={popButtonClass("pink", "md")}>분석 초안 만들기</button>
        </div>
        <p className="mt-1 text-[13px] text-pop-ink-muted">실제 AI 모델을 부르지 않는 체험용 규칙입니다. 교사 관찰 문장이 있는 기록만 씁니다.</p>
        {draft ? (
          <div className="mt-4 grid gap-3" aria-live="polite">
            {draft.blocked.length ? (
              <div role="alert" className="rounded-2xl border-2 border-pop-pink-deep/40 bg-pop-pink-soft px-4 py-3 text-[14px] text-pop-ink">
                <p className="font-extrabold text-pop-pink-deep">분석을 막았습니다</p>
                <ul className="mt-1 grid gap-1">{draft.blocked.map((b) => <li key={b}>· {b}</li>)}</ul>
              </div>
            ) : null}
            {draft.warnings.length ? <ul className="grid gap-1 rounded-2xl bg-pop-yellow-soft px-4 py-3 text-[14px] text-pop-ink">{draft.warnings.map((w) => <li key={w}>· {w}</li>)}</ul> : null}
            {doc?.statements.map((s) => (
              <article key={s.id} className="rounded-2xl bg-pop-cream p-4 ring-1 ring-pop-ink/5">
                <p className="flex flex-wrap items-center gap-2 text-[12px] font-extrabold">
                  <span className="rounded-full bg-pop-lilac-soft px-2.5 py-0.5 text-pop-lilac-deep">{NAME[s.indicator]}</span>
                  <span className={cx("rounded-full px-2.5 py-0.5", s.origin === "ai" ? "bg-pop-sky-soft text-pop-sky-deep" : "bg-pop-mint-soft text-pop-mint-deep")}>{s.origin === "ai" ? "AI 초안 문장" : "교사 확인 문장"}</span>
                  <span className="text-pop-ink-muted">근거 · 관찰 {s.observationIds.join(", ")}{s.evidenceIds.length ? ` · 자료 ${s.evidenceIds.join(", ")}` : ""}</span>
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-pop-ink">{s.text}</p>
                {s.flags.length ? <ul className="mt-2 grid gap-1 text-[13px] font-bold text-pop-pink-deep">{s.flags.map((f) => <li key={f}>· {f}</li>)}</ul> : null}
                {/* 고치기는 고르는 방식 — 글 칸 없이 교사 수정 흐름을 보인다 */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {rewrites(s.observationIds[0], s.evidenceIds).map((r) => (
                    <button key={r.label} type="button" className={popButtonClass("white", "md")} onClick={() => setDoc((d) => (d ? editStatement(d, s.id, r.text) : d))}>{r.label}</button>
                  ))}
                  <button type="button" className={popButtonClass("white", "md")} onClick={() => setDoc((d) => (d ? confirmStatement(d, s.id) : d))}>사실 확인했어요</button>
                  <button type="button" className={popButtonClass("ghost", "md")} onClick={() => setDoc((d) => (d ? editStatement(d, s.id, `${s.text} 또래보다 빨리 해냈습니다.`) : d))}>잘못된 표현 넣어 보기</button>
                  <button type="button" className={popButtonClass("ghost", "md")} onClick={() => setDoc((d) => (d ? deleteStatement(d, s.id) : d))}>삭제</button>
                </div>
              </article>
            ))}
            {!draft.blocked.length ? (
              <dl className="grid gap-2 text-[14px] text-pop-ink sm:grid-cols-2">
                <div className="rounded-2xl bg-pop-cream px-4 py-3"><dt className="font-bold">기록 없음 (분석하지 않은 지표)</dt><dd className="mt-1 text-pop-ink-muted">{draft.noRecord.map((c) => NAME[c]).join(" · ") || "없음"} — 못했다는 뜻이 아닙니다.</dd></div>
                <div className="rounded-2xl bg-pop-cream px-4 py-3"><dt className="font-bold">다음 활동에서 관찰하면 좋은 것</dt><dd className="mt-1 text-pop-ink-muted">{draft.nextObservations.join(" · ") || "이번 주 문항 가운데 남은 것이 없습니다."}</dd></div>
              </dl>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* 4. 검토 · 승인 */}
      {doc ? (
        <section aria-labelledby="demo-flow" className="rounded-[28px] bg-white p-5 shadow-pop sm:p-6">
          <h2 id="demo-flow" className={cx("font-display text-[22px] text-pop-ink", displayFallback("4. 교사 검토 · 승인"))}>4. 교사 검토 · 승인</h2>
          <ol className="mt-3 flex flex-wrap items-center gap-2" aria-label="리포트 상태">
            {FLOW.map((st, i) => (
              <li key={st} aria-current={doc.state === st ? "step" : undefined}
                className={cx("rounded-full px-3 py-1.5 text-[13px] font-bold", doc.state === st ? "bg-pop-ink text-white" : FLOW.indexOf(doc.state) > i ? "bg-pop-mint-soft text-pop-mint-deep" : "bg-pop-cream text-pop-ink-muted")}>
                {i + 1}. {REVIEW_LABEL[st]}
              </li>
            ))}
          </ol>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={popButtonClass("white", "md")} onClick={() => go("reviewed")}>검토 완료로</button>
            <button type="button" className={popButtonClass("ink", "md")} onClick={() => go("approved")}>승인</button>
            <button type="button" className={popButtonClass("ghost", "md")} onClick={() => go("shared")}>보호자에게 공유</button>
          </div>
          {notice ? <p role="status" className="mt-3 rounded-2xl bg-pop-yellow-soft px-4 py-3 text-[14px] font-semibold text-pop-ink">{notice}</p> : null}
        </section>
      ) : null}

      {/* 5. 리포트 미리보기 — 승인 뒤에만 */}
      {doc && (doc.state === "approved" || doc.state === "shared") ? (
        <section aria-labelledby="demo-report" className="relative overflow-hidden rounded-[28px] bg-white p-5 shadow-pop ring-4 ring-pop-lilac-soft sm:p-6">
          <p className="absolute right-4 top-4 rounded-full bg-pop-orange px-3 py-1 text-[13px] font-extrabold text-pop-ink">가상 예시 · 실제 아동 아님</p>
          <h2 id="demo-report" className={cx("font-display text-[22px] text-pop-ink", displayFallback("5. 주간 성장리포트 미리보기"))}>5. 주간 성장리포트 미리보기</h2>
          <dl className="mt-3 grid gap-3 text-[14px] leading-relaxed text-pop-ink">
            <div><dt className="font-bold text-pop-ink-muted">주차</dt><dd>{week.weekNo}주차 「{week.title}」 · 동화책 《{week.storybook}》 · {childLabel}</dd></div>
            <div><dt className="font-bold text-pop-ink-muted">이번 주 대표활동</dt><dd>{week.activities.map((a) => a.title).join(" · ")}</dd></div>
            <div><dt className="font-bold text-pop-ink-muted">관찰된 행동 · 발언 (교사 기록)</dt>
              <dd><ul className="grid gap-1">{observations.filter((o) => o.teacherNote.trim()).map((o) => <li key={o.id}>· [{o.id}] {o.activityTitle} — {o.teacherNote}{o.childQuote ? ` “${o.childQuote}”` : ""}</li>)}</ul></dd></div>
            <div><dt className="font-bold text-pop-ink-muted">작품 · 사진 근거</dt><dd>{evidence.length ? evidence.map((e) => `[${e.id}] ${e.caption}`).join(" · ") : "없음"}</dd></div>
            <div><dt className="font-bold text-pop-ink-muted">5대 성장지표 관련 관찰 · 교사의 해석</dt>
              <dd><ul className="grid gap-1.5">{doc.statements.map((s) => <li key={s.id}>· <span className="font-bold">{NAME[s.indicator]}</span> — {s.text} <span className="text-[12px] text-pop-ink-muted">(근거 {[...s.observationIds, ...s.evidenceIds].join(", ")} · {s.origin === "teacher" ? "교사 확인" : "AI 초안"})</span></li>)}</ul></dd></div>
            <div><dt className="font-bold text-pop-ink-muted">다음 활동에서 관찰할 점</dt><dd>{draft?.nextObservations.join(" · ") || "—"}</dd></div>
            <div><dt className="font-bold text-pop-ink-muted">가정연계 활동</dt><dd>{week.familyTitle ?? "—"}</dd></div>
            <div><dt className="font-bold text-pop-ink-muted">보호자께 드리는 안내</dt><dd><ul className="grid gap-1">{REPORT_GUARDIAN_NOTES.map((x) => <li key={x}>· {x}</li>)}</ul></dd></div>
            {week.parentNotice.length ? (
              <div><dt className="font-bold text-pop-ink-muted">{week.weekNo}주 부모님께 드리는 안내 (자료 원문)</dt><dd><ul className="grid gap-1">{week.parentNotice.map((x) => <li key={x}>· {x}</li>)}</ul></dd></div>
            ) : null}
            <div><dt className="font-bold text-pop-ink-muted">{week.weekNo}주 성장기록 예시 (자료 원문 · 다른 아이의 기록이 아닌 작성 예시)</dt><dd>{week.kidsnote ?? "자료에 성장기록 예시가 없습니다 (원문 미작성)."}</dd></div>
            <div><dt className="font-bold text-pop-ink-muted">검토 · 승인 상태</dt><dd>{REVIEW_LABEL[doc.state]} · 체험에서는 보내지 않습니다 (도움 방식 표시: {SUPPORT_NAME.independent} · {SUPPORT_NAME.after_modeling} · {SUPPORT_NAME.with_teacher} · {SUPPORT_NAME.not_observed} — 점수가 아닙니다)</dd></div>
          </dl>
          <div className="mt-4 flex flex-wrap items-center gap-2 print:hidden">
            <PrintButton />
            <Link href={`/experience/weeks/${week.weekNo}/guide`} className={popButtonClass("white", "md")}>{week.weekNo}주 상세 지도안 인쇄</Link>
            <Link href={`/experience/weeks/${week.weekNo}`} className={popButtonClass("ghost", "md")}>{week.weekNo}주 대시보드</Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
