import type { GrowthMetricCode, SupportLevelCode } from "@/lib/curriculum/taxonomies";

/**
 * 가상 성장 분석 초안 — 공개 체험용.
 *
 * ★ 실제 AI 모델을 부르지 않는다. 브라우저 안에서 도는 규칙 함수다 (외부 전송 · 저장 없음).
 *   기관용 서비스에서 실제 AI 를 쓸 때도 이 규칙이 「보내기 전 · 받은 뒤」 검사가 된다.
 * ★ 반드시 지키는 것
 *   1. 근거(교사 관찰 문장)가 없으면 분석하지 않는다 — 사진만 있으면 「근거 부족」.
 *   2. 성격 · 감정 · 내적 상태를 단정하지 않는다. 진단 · 비교 · 서열 표현을 쓰지 않는다.
 *   3. 한 번의 기록으로 성장 수준을 정하지 않는다 — 문장은 「이번 활동에서 보인 모습」으로만 쓴다.
 *   4. AI 문장과 교사가 확인한 문장을 나눈다 (origin).
 *   5. 문장마다 쓰인 관찰 기록 ID · 근거자료 ID 를 단다.
 *   6. 실명 · 연락처 같은 개인정보가 들어오면 분석 자체를 막는다.
 */

export interface DemoEvidence {
  id: string;
  kind: "photo" | "artwork" | "video";
  /** 가상 자료 설명 — 실제 사진이 아니다 */
  caption: string;
  /** 설명에 드러난 도움 방식 (있을 때만) — 교사 기록과 다르면 충돌로 본다 */
  supportHint?: SupportLevelCode;
}

export interface DemoObservation {
  id: string;
  weekNo: number;
  activityId: string;
  activityTitle: string;
  stageKey: string;
  item: string;
  indicator: GrowthMetricCode | null;
  teacherNote: string;
  childQuote?: string;
  artworkFact?: string;
  support: SupportLevelCode;
  evidenceIds: readonly string[];
  observedAt: string;
  observer: string;
}

export type StatementOrigin = "ai" | "teacher";

export interface DraftStatement {
  id: string;
  indicator: GrowthMetricCode;
  text: string;
  origin: StatementOrigin;
  observationIds: readonly string[];
  evidenceIds: readonly string[];
  /** 사실 확인이 필요한 까닭 — 비어 있어야 승인할 수 있다 */
  flags: readonly string[];
}

export interface AnalysisDraft {
  blocked: readonly string[];
  statements: readonly DraftStatement[];
  /** 근거가 없어 분석하지 않은 지표 */
  noRecord: readonly GrowthMetricCode[];
  warnings: readonly string[];
  nextObservations: readonly string[];
  /** 보호자에게 설명할 수 있는 성장 경험 — 승인 전에는 보내지 않는다 */
  parentExperience: string | null;
}

export const ALL_INDICATORS: readonly GrowthMetricCode[] = [
  "expression_variety", "form_space_composition", "creative_attempt", "engagement_immersion", "self_explanation",
];

const SUPPORT_TEXT: Record<SupportLevelCode, string> = {
  not_observed: "기록 없음",
  with_teacher: "선생님과 함께",
  after_modeling: "친구 · 선생님을 본 뒤",
  independent: "스스로",
};

/* ── 개인정보 차단 ─────────────────────────────────────────── */

const SURNAMES = "김이박최정강조윤장임한오서신권황안송류전홍고문양손배백허유남심노하곽성차주우구민진나지엄채원천방공현함변염여추도소석선설마길연위표명기반왕금옥육인맹제모탁국어은편용";
const PII_RULES: readonly { re: RegExp; reason: string }[] = [
  { re: /01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/, reason: "전화번호" },
  { re: /[\w.+-]+@[\w-]+\.[\w.]+/, reason: "이메일" },
  { re: /\d{6}[-\s]?[1-4]\d{6}/, reason: "주민등록번호" },
  { re: /(19|20)\d{2}[.\-/년 ]\s?\d{1,2}[.\-/월 ]\s?\d{1,2}일?\s?(생|출생)/, reason: "생년월일" },
  { re: /[가-힣]+(시|구|군)\s?[가-힣0-9]+(동|로|길)\s?\d*/, reason: "주소" },
  // 성 + 두 글자 + 「이가 · 이는 …」(받침 있는 이름을 부를 때) 또는 「어린이 · 원아」 — 「도와주는」 같은 낱말은 걸지 않는다.
  // ★ 받침 없는 이름(「지우가」)은 낱말과 구분할 수 없어 못 거른다. 그래서 체험은 원아 이름 칸을 두지 않고 가상 원아 셋만 고르게 한다.
  { re: new RegExp(`(^|[^가-힣])[${SURNAMES}][가-힣]{2}(이가|이는|이를|이도|이의|이와|이랑|이한테|이에게|\\s?(어린이|원아|학생))`), reason: "실명으로 보이는 이름" },
];

/** 체험에서 쓰는 가상 원아 이름 — 이것만 허용한다 */
export const VIRTUAL_CHILDREN = ["하늘 (가상)", "바다 (가상)", "구름 (가상)"] as const;

export function detectPII(text: string): readonly string[] {
  const clean = VIRTUAL_CHILDREN.reduce((t, n) => t.replaceAll(n.replace(" (가상)", ""), ""), text);
  return PII_RULES.filter((r) => r.re.test(clean)).map((r) => r.reason);
}

/* ── 쓰면 안 되는 표현 ─────────────────────────────────────── */

const BANNED: readonly { re: RegExp; reason: string }[] = [
  // 「틱」은 낱말 첫머리일 때만 — 「스틱」(19주 「나만의 북과 스틱 꾸미기」) 같은 낱말 속 글자를 진단 표현으로 잡지 않는다
  { re: /장애|ADHD|자폐|발달\s?지연|우울|불안\s?장애|(?<![가-힣])틱|과잉\s?행동|진단/, reason: "진단 · 의학적 판단 표현" },
  { re: /또래보다|다른 (아이|친구)(들)?보다|반에서 (가장|제일)|1등|꼴찌|뒤처|앞서/, reason: "비교 · 서열 표현" },
  { re: /점수|등급|레벨|\d+\s?점/, reason: "점수 · 등급 표현" },
  { re: /성격이|원래 .*아이|타고난|내성적|외향적|기질/, reason: "성격 단정 표현" },
  { re: /(속으로|마음속으로|내심) .*(느꼈|생각했)|(행복|슬퍼|화가 나|불안해)(했|한 것 같)/, reason: "감정 · 내적 상태 단정" },
  { re: /항상|언제나|절대|완벽하게|확실히 (성장|발달)/, reason: "한 번의 기록으로 단정하는 표현" },
];

export function bannedReasons(text: string): readonly string[] {
  return BANNED.filter((b) => b.re.test(text)).map((b) => b.reason);
}

/* ── 분석 ─────────────────────────────────────────────────── */

export interface AnalyzeInput {
  childLabel: string;
  weekNo: number;
  observations: readonly DemoObservation[];
  evidence: readonly DemoEvidence[];
  indicatorName: (c: GrowthMetricCode) => string;
  indicatorDefinition: (c: GrowthMetricCode) => string;
  /** 이 주차 관찰 문항 가운데 아직 기록하지 않은 것 — 다음 관찰 제안에 쓴다 */
  openItems?: readonly { item: string; indicator: GrowthMetricCode | null }[];
}

export function analyze(input: AnalyzeInput): AnalysisDraft {
  const texts = [input.childLabel, ...input.observations.flatMap((o) => [o.teacherNote, o.childQuote ?? "", o.artworkFact ?? ""]), ...input.evidence.map((e) => e.caption)];
  const pii = [...new Set(texts.flatMap(detectPII))];
  if (!VIRTUAL_CHILDREN.includes(input.childLabel as (typeof VIRTUAL_CHILDREN)[number])) pii.push("가상 원아가 아닌 이름");
  if (pii.length) {
    return { blocked: pii.map((r) => `${r} — 체험에서는 실제 아동 정보를 넣을 수 없습니다. 가상 원아 · 가상 기록만 써 주세요.`), statements: [], noRecord: ALL_INDICATORS, warnings: [], nextObservations: [], parentExperience: null };
  }

  const ev = new Map(input.evidence.map((e) => [e.id, e]));
  const warnings: string[] = [];
  const statements: DraftStatement[] = [];
  const covered = new Set<GrowthMetricCode>();
  const activities = new Set<string>();

  input.observations.forEach((o, i) => {
    const note = o.teacherNote.trim();
    const refs = o.evidenceIds.map((id) => ev.get(id)).filter((x): x is DemoEvidence => !!x);
    if (!note) {
      warnings.push(refs.length
        ? `${o.id}: 사진 · 작품 자료만 있고 교사 관찰 기록이 없어 분석하지 않았습니다. 사진으로는 아이의 생각 · 감정을 알 수 없습니다.`
        : `${o.id}: 교사 관찰 기록이 없어 분석하지 않았습니다.`);
      return;
    }
    if (o.support === "not_observed") {
      warnings.push(`${o.id}: 도움 방식이 「기록 없음」이라 이 장면은 분석하지 않았습니다.`);
      return;
    }
    if (!o.indicator) {
      warnings.push(`${o.id}: 이 관찰 문항에 연결된 성장지표가 없어 지표 문장을 만들지 않았습니다 (억지로 연결하지 않음).`);
      return;
    }
    const flags: string[] = [];
    for (const r of refs) {
      if (r.supportHint && r.supportHint !== o.support) {
        flags.push(`교사 기록(${SUPPORT_TEXT[o.support]})과 자료 설명 ${r.id}(${SUPPORT_TEXT[r.supportHint]})이 다릅니다 — 사실을 확인해 주세요.`);
      }
    }
    flags.push(...bannedReasons(note).map((r) => `교사 기록에 ${r}이 있습니다 — 고쳐 주세요.`));
    activities.add(`${o.weekNo}:${o.activityId}`);
    covered.add(o.indicator);
    const quote = o.childQuote?.trim() ? ` 아이가 한 말: “${o.childQuote.trim()}”.` : "";
    const fact = o.artworkFact?.trim() ? ` 작품에서 본 사실: ${o.artworkFact.trim()}.` : "";
    const cross = o.weekNo !== input.weekNo ? ` (${o.weekNo}주차 결과물을 이번 주에 함께 씀)` : "";
    statements.push({
      id: `st-${i + 1}`,
      indicator: o.indicator,
      origin: "ai",
      text: `「${o.activityTitle}」${cross}에서 「${o.item.replace(/\?$/, "")}」 장면을 기록했습니다. 이 모습은 ${input.indicatorName(o.indicator)}(${input.indicatorDefinition(o.indicator)})과 이어집니다. 이번 활동에서는 ‘${SUPPORT_TEXT[o.support]}’ 참여했습니다.${quote}${fact} 한 번의 기록이므로 다음 활동에서도 함께 살펴봅니다.`,
      observationIds: [o.id],
      evidenceIds: refs.map((r) => r.id),
      flags,
    });
  });

  if (activities.size > 1) warnings.push(`대표활동 ${activities.size}개의 기록을 함께 썼습니다 — 문장마다 어느 활동인지 적었습니다.`);
  const noRecord = ALL_INDICATORS.filter((c) => !covered.has(c));
  const nextObservations = (input.openItems ?? [])
    .filter((x) => x.indicator && noRecord.includes(x.indicator))
    .slice(0, 3)
    .map((x) => `${x.item} (${input.indicatorName(x.indicator!)})`);
  const clean = statements.filter((s) => s.flags.length === 0);
  return {
    blocked: [],
    statements,
    noRecord,
    warnings,
    nextObservations,
    parentExperience: clean.length
      ? `이번 주 ${clean.map((s) => input.indicatorName(s.indicator)).filter((v, i, a) => a.indexOf(v) === i).join(" · ")}과 이어지는 장면을 수업에서 볼 수 있었습니다. 점수나 비교가 아니라, 아이가 활동에 참여한 방식을 담은 기록입니다.`
      : null,
  };
}

/* ── 검토 · 승인 흐름 — AI 초안 → 교사 수정 → 검토 완료 → 승인 → 공유 ── */

export type ReviewState = "ai_draft" | "teacher_edited" | "reviewed" | "approved" | "shared";
export const REVIEW_LABEL: Record<ReviewState, string> = {
  ai_draft: "AI 초안",
  teacher_edited: "교사 수정",
  reviewed: "검토 완료",
  approved: "승인",
  shared: "공유",
};

export interface ReviewDoc {
  state: ReviewState;
  statements: readonly DraftStatement[];
  /** 체험에서는 언제나 true — 공유 단계는 보내지 않고 미리보기만 한다 */
  demo: boolean;
}

export function editStatement(doc: ReviewDoc, id: string, text: string): ReviewDoc {
  const statements = doc.statements.map((s) =>
    s.id === id ? { ...s, text, origin: "teacher" as const, flags: bannedReasons(text).map((r) => `고친 문장에 ${r}이 있습니다.`) } : s,
  );
  return { ...doc, statements, state: doc.state === "ai_draft" ? "teacher_edited" : doc.state };
}

export function deleteStatement(doc: ReviewDoc, id: string): ReviewDoc {
  return { ...doc, statements: doc.statements.filter((s) => s.id !== id), state: doc.state === "ai_draft" ? "teacher_edited" : doc.state };
}

/** 사실 확인 표시를 교사가 직접 풀었다 (확인했다) */
export function confirmStatement(doc: ReviewDoc, id: string): ReviewDoc {
  const statements = doc.statements.map((s) => (s.id === id && bannedReasons(s.text).length === 0 ? { ...s, flags: [], origin: "teacher" as const } : s));
  return { ...doc, statements, state: doc.state === "ai_draft" ? "teacher_edited" : doc.state };
}

export function nextStateBlockers(doc: ReviewDoc, to: ReviewState): readonly string[] {
  const b: string[] = [];
  const order: ReviewState[] = ["ai_draft", "teacher_edited", "reviewed", "approved", "shared"];
  if (order.indexOf(to) !== order.indexOf(doc.state) + 1 && !(doc.state === "ai_draft" && to === "reviewed")) b.push("순서대로만 넘어갈 수 있습니다.");
  if (to === "reviewed" || to === "approved") {
    if (!doc.statements.length) b.push("남은 문장이 없습니다.");
    if (doc.statements.some((s) => s.flags.length)) b.push("사실 확인 · 표현 수정이 필요한 문장이 남아 있습니다.");
  }
  if (to === "approved" && doc.statements.some((s) => s.origin === "ai")) b.push("교사가 확인하지 않은 AI 문장이 남아 있습니다 — 문장마다 확인하거나 고쳐 주세요.");
  if (to === "shared" && doc.demo) b.push("체험에서는 보호자에게 보내지 않습니다 — 보호자 공유는 기관용 서비스에서만 합니다.");
  return b;
}

export function moveTo(doc: ReviewDoc, to: ReviewState): ReviewDoc {
  return nextStateBlockers(doc, to).length ? doc : { ...doc, state: to };
}
