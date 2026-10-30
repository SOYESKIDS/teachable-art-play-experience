/**
 * 공개 콘텐츠 보안 검사 — 공식 교사용 수업가이드 원문(회사 지식재산)이 공개 저장소 · 정적 산출물(out/)에 들어오지 않는다.
 *
 * ★ 2026-10-29: 14 · 17~24주는 공식 가이드 수업이지만, 공개 체험에는 요약(guide-summaries.ts)만 싣는다.
 *   가이드 원문 전사본 · 원본 파일명 · SHA-256 목록은 공개 저장소 밖에 비공개로 둔다.
 * ★ 이 검사에는 가이드 문장을 적지 않는다 (검사 파일도 공개된다). 원문 문장 대조는 비공개 도구가 따로 한다.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GUIDE_SUMMARIES } from "../src/data/experience/teacher-dashboard/guide-summaries.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
/** 원본 가이드 파일 이름 꼴 (회사명 + 주차 + 교사용 수업가이드) */
const SOURCE_FILE = /SOYES?_KIDS_\d+주차_교사용_수업가이드/;
const SHA_LIST = /sha256\s*:\s*"?[0-9a-f]{64}/i;

const tracked = () => {
  try {
    return execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
};

test("가이드 원문 전사본 · 전문 표시 영역이 공개 저장소에 없다", () => {
  assert.ok(!existsSync(join(ROOT, "src/lib/weeks/content")), "src/lib/weeks/content (전사본 폴더)");
  assert.ok(!existsSync(join(ROOT, "src/components/play/OfficialGuideFull.tsx")), "가이드 전문 표시 영역");
  const files = tracked();
  assert.deepEqual(files.filter((f) => /^src\/lib\/weeks\/content\/|OfficialGuideFull|official-guide-transcription|guide-sources/.test(f)), []);
});

test("공개 파일에 원본 가이드 파일명 · SHA-256 목록이 없다", () => {
  const offenders = [];
  for (const f of tracked()) {
    if (!/\.(ts|tsx|mjs|js|json|md|txt|css|html)$/.test(f) || f === "tests/public-content.test.mjs") continue;
    const p = join(ROOT, f);
    if (!existsSync(p)) continue;
    const s = readFileSync(p, "utf8");
    if (SOURCE_FILE.test(s)) offenders.push(`${f}: 원본 파일명`);
    if (SHA_LIST.test(s) && /수업가이드|guide/i.test(s)) offenders.push(`${f}: 해시 목록`);
  }
  // 아직 커밋하지 않은 새 파일도 본다 (src · tests · scripts · docs)
  const walk = (d) => readdirSync(d).flatMap((x) => (statSync(join(d, x)).isDirectory() ? walk(join(d, x)) : [join(d, x)]));
  for (const d of ["src", "scripts", "docs"]) for (const p of walk(join(ROOT, d))) {
    if (!/\.(ts|tsx|mjs|json|md|txt)$/.test(p)) continue;
    const s = readFileSync(p, "utf8");
    if (SOURCE_FILE.test(s)) offenders.push(`${p.slice(ROOT.length + 1)}: 원본 파일명`);
  }
  assert.deepEqual([...new Set(offenders)], []);
});

test("공식 가이드 공개 요약 — 정해진 칸만 · 짧은 문장만 (단계 본문 · 발문 목록 · 반응 예시 · 상황 대응 · 퀵 가이드 없음)", () => {
  const ALLOWED = ["weekNo", "title", "theme", "growthKeyword", "coreMessage", "goals", "observations", "experienceFlow", "physical", "art", "workbook", "materials", "linkedContents", "family"];
  assert.deepEqual(GUIDE_SUMMARIES.map((s) => s.weekNo), [14, 17, 18, 19, 20, 21, 22, 23, 24]);
  const strings = (v) => (typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === "object" ? Object.values(v).flatMap(strings) : []);
  for (const s of GUIDE_SUMMARIES) {
    assert.deepEqual(Object.keys(s).filter((k) => !ALLOWED.includes(k)), [], `${s.weekNo}주 허용하지 않은 칸`);
    assert.deepEqual(Object.keys(s.physical ?? {}).sort(), ["materials", "plays", "title"], `${s.weekNo}주 신체활동 칸`);
    for (const p of s.physical?.plays ?? []) assert.deepEqual(Object.keys(p).sort(), ["example", "title"], `${s.weekNo}주 놀이는 제목 + 활동 예시 한 줄`);
    assert.deepEqual(Object.keys(s.family ?? {}).sort(), s.family ? ["status", "summary", "title"] : [], `${s.weekNo}주 가정연계 칸`);
    // 요약이다 — 한 줄이 길지 않다 (가이드의 단락 · 표 원문을 통째로 옮기지 않는다)
    for (const t of strings(s)) assert.ok(t.length <= 160, `${s.weekNo}주 긴 문장 ${t.length}자`);
    // 문장 수 — 영역 이름 · 상태 같은 짧은 칸 이름(10자 미만)은 세지 않는다
    const sentences = strings(s).filter((t) => t.length >= 10).length;
    assert.ok(sentences <= 60, `${s.weekNo}주 문장 ${sentences}개 — 요약 범위를 넘는다`);
  }
});

test("정적 산출물(out/)에 가이드 원문 영역 · 원본 파일명이 없다", () => {
  const OUT = join(ROOT, "out");
  if (!existsSync(OUT)) return; // 빌드 전에는 건너뛴다 (배포 전 QA 에서 빌드 뒤 다시 돈다)
  const walk = (d) => readdirSync(d).flatMap((x) => (statSync(join(d, x)).isDirectory() ? walk(join(d, x)) : [join(d, x)]));
  const bad = [];
  for (const p of walk(OUT)) {
    if (!/\.(html|txt|js|json)$/.test(p)) continue;
    const s = readFileSync(p, "utf8");
    if (SOURCE_FILE.test(s)) bad.push(`${p.slice(OUT.length + 1)}: 원본 파일명`);
    if (s.includes("공식 교사용 수업가이드 원문")) bad.push(`${p.slice(OUT.length + 1)}: 가이드 원문 영역`);
  }
  assert.deepEqual(bad, []);
});
