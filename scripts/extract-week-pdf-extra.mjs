// 주차 PDF 의 추가 칸 → src/data/experience/teacher-dashboard/week-pdf-extra.ts
//   node scripts/extract-week-pdf-extra.mjs
// ★ week-dashboards.ts 에 아직 없던 PDF 칸(미술 활용 · 예시 · TIP, 교구 안내 · 미션 · 활용, 가족연계 안내 · TIP,
//   가정용 교구 안내, 뮤직비디오 설명 · 영상 주소, E-BOOK, 제작 교구, 주제 요소, 계절 · 방문지, 교구 이름 · 소개, 가족연계 소개)만 원문 그대로 옮긴다. 손으로 고치지 않는다.
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { extraFields } from "./pdf-sections.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const weeks = [];
for (let n = 1; n <= 24; n++) {
  const { _sections, videoUrl, ...x } = extraFields(ROOT, n);
  const url = videoUrl && /^https?:\/\//.test(videoUrl) ? videoUrl : null;
  weeks.push({ weekNo: n, ...x, videoUrl: url, videoUrlNote: url ? null : videoUrl });
}
const ts = `import { EDITED_LINES, isOfficialGuideWeek } from "./week-dashboards";

/**
 * 주차 PDF 추가 칸 — scripts/extract-week-pdf-extra.mjs 가 저장소 원문 추출 텍스트에서 만든다 (손으로 고치지 않는다).
 *
 * ★ 모두 PDF 원문이다. 값이 없으면 그 주차 PDF 에 그 칸이 없다 (1~8주는 미술 활용 · TIP 칸이 없는 이전 양식).
 * ★ 화면은 pdfExtraOf() 로 읽는다 — week-dashboards 의 EDITED_LINES(고쳐 쓴 문장)를 그대로 적용한다. WEEK_PDF_EXTRA 는 원문 그대로다.
 * ★ videoUrl 은 실제 주소일 때만 채운다. PDF 에 「개발 시 입력」처럼 적힌 것은 videoUrlNote 로 두고 화면은 「영상 준비 중」이다.
 */

export interface WeekPdfExtra {
  weekNo: number;
  /** 계절 · 방문지 */
  seasonPlace: string | null;
  /** 주제 요소 (원안) */
  topicElements: string | null;
  /** 제작 교구 (기본 정보 칸) */
  makesKit: string | null;
  /** E-BOOK 제공 여부 */
  ebook: string | null;
  /** 미술 — 활용 방법 */
  artUse: readonly string[];
  /** 미술 — 예시 (문구 · 작품 예) */
  artExamples: readonly string[];
  artTip: string | null;
  /** 교구 키트 이름 · 소개 문장 */
  kitName: string | null;
  kitLead: readonly string[];
  /** 교구 칸 첫 안내 (제작 교구 여부) */
  kitNotice: string | null;
  /** 교구 — 활동 방법 · 미션 */
  kitMissions: readonly string[];
  /** 교구 — 활용 */
  kitUse: string | null;
  /** 가족연계 소개 문장 (제목 아래 한 줄) */
  familyLead: string | null;
  familyNote: string | null;
  familyTip: string | null;
  homeKitNote: string | null;
  videoDesc: string | null;
  videoUrl: string | null;
  videoUrlNote: string | null;
}

export const WEEK_PDF_EXTRA: readonly WeekPdfExtra[] = ${JSON.stringify(weeks, null, 2)};

export function pdfExtraOf(weekNo: number): WeekPdfExtra | undefined {
  // 14 · 17~24주는 공식 가이드 기준 수업이다 — 같은 주차 PDF 의 추가 칸(다른 주제)은 화면에 쓰지 않는다
  if (isOfficialGuideWeek(weekNo)) return undefined;
  const w = WEEK_PDF_EXTRA.find((x) => x.weekNo === weekNo);
  const edits = EDITED_LINES.filter((e) => e.weekNo === weekNo);
  if (!w || !edits.length) return w;
  const fix = (s: string) => edits.find((e) => e.original === s)?.text ?? s;
  return Object.fromEntries(Object.entries(w).map(([k, v]) => [k, Array.isArray(v) ? v.map(fix) : typeof v === "string" ? fix(v) : v])) as unknown as WeekPdfExtra;
}
`;
writeFileSync(join(ROOT, "src/data/experience/teacher-dashboard/week-pdf-extra.ts"), ts);
const filled = (k) => weeks.filter((w) => (Array.isArray(w[k]) ? w[k].length : w[k])).length;
console.log("ok", Object.keys(weeks[0]).filter((k) => k !== "weekNo").map((k) => `${k}:${filled(k)}`).join(" "));
