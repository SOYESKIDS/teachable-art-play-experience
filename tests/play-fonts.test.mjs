/**
 * 공개 체험 글꼴 서브셋 검사 (정적).
 *
 * ★ 공개 체험 화면 소스에 든 글자가 모두 서브셋 글자 목록에 있는지 본다.
 *   문구를 고치고 서브셋을 다시 만들지 않으면 여기서 실패한다 →
 *   python scripts/subset-play-fonts.py <Jua-Regular.ttf> <PretendardVariable.woff2>
 *   (빠진 글자도 Pretendard 로 대체되어 깨지지는 않지만, 제목 글꼴이 한 글자만 달라진다)
 * ★ 루트 layout 이 다시 무거운 글꼴(명조 · Jua 전체 조각)을 모든 페이지에 싣지 않는지 본다.
 * ★ 명조를 쓰는 화면이 있는 구역은 SerifFontScope 로 감싸져 있는지 본다.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { EXPERIENCE_WEEKS, EXPERIENCE_PARTS } from "../src/data/experience/weeks.ts";
import { STAGE_LABEL } from "../src/data/experience/types.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FONT_DIR = join(ROOT, "src", "fonts", "play");

// scripts/subset-play-fonts.py 의 SOURCE_GLOBS 와 같은 범위
const SOURCES = [
  "src/app/page.tsx",
  "src/app/experience",
  "src/components/play",
  "src/components/layout/BrandMark.tsx",
  "src/data/experience",
  "src/lib/weeks/week-index.ts",
  "src/lib/weeks/week-types.ts",
  "src/lib/curriculum/taxonomies.ts",
];

function walk(p) {
  const abs = join(ROOT, p);
  if (statSync(abs).isFile()) return [abs];
  return readdirSync(abs, { recursive: true })
    .map((f) => join(abs, f))
    .filter((f) => /\.(ts|tsx)$/.test(f));
}

const dataFiles = readdirSync(join(ROOT, "src", "data"))
  .filter((f) => f.endsWith(".ts"))
  .map((f) => join(ROOT, "src", "data", f));

test("공개 체험 소스의 모든 글자가 서브셋 글자 목록에 있다", () => {
  const glyphs = new Set(readFileSync(join(FONT_DIR, "play-glyphs.txt"), "utf8"));
  const missing = new Map();
  for (const file of [...SOURCES.flatMap(walk), ...dataFiles]) {
    for (const ch of readFileSync(file, "utf8")) {
      const cp = ch.codePointAt(0);
      if (cp < 0x20 || cp >= 0x1f000 || ch === "﻿") continue;
      if (!glyphs.has(ch)) missing.set(ch, relative(ROOT, file));
    }
  }
  assert.deepEqual(
    [...missing].map(([c, f]) => `${c} (${f})`),
    [],
    "서브셋을 다시 만드세요: python scripts/subset-play-fonts.py <Jua-Regular.ttf> <PretendardVariable.woff2>",
  );
});

test("서브셋 글꼴 파일 · 라이선스가 있고 크기가 예산 안이다", () => {
  for (const [file, maxKb] of [["tap-play-sans.woff2", 220], ["tap-play-display.woff2", 190]]) {
    const abs = join(FONT_DIR, file);
    assert.ok(existsSync(abs), file);
    assert.ok(statSync(abs).size < maxKb * 1024, `${file} ${Math.round(statSync(abs).size / 1024)}KB > ${maxKb}KB`);
  }
  assert.match(readFileSync(join(FONT_DIR, "OFL-Pretendard.txt"), "utf8"), /Reserved Font Name 'Pretendard'/);
  assert.match(readFileSync(join(FONT_DIR, "OFL-Jua.txt"), "utf8"), /SIL Open Font License/);
  // OFL 예약 이름 — 수정본(서브셋)은 Pretendard 라는 이름을 쓰지 않는다
  assert.doesNotMatch(readFileSync(join(FONT_DIR, "index.ts"), "utf8"), /src:\s*"[^"]*pretendard/i);
});

test("루트 layout 은 Google 글꼴을 싣지 않는다 (자체 서브셋만)", () => {
  const layout = readFileSync(join(ROOT, "src", "app", "layout.tsx"), "utf8");
  assert.doesNotMatch(layout, /next\/font\/google/);
});

test("둥근 제목 글꼴 — 고정 이름은 모두 그리고, 못 그리는 주차 제목 · 교실 문장은 문장 전체를 본문 글꼴로 대체한다", async () => {
  const path = join(FONT_DIR, "display-glyphs.txt");
  assert.ok(existsSync(path), "node scripts/collect-play-display-glyphs.mjs 로 만든다");
  const display = new Set(readFileSync(path, "utf8"));
  const sans = new Set(readFileSync(join(FONT_DIR, "play-glyphs.txt"), "utf8"));
  // 화면이 읽는 글자 목록(display-glyphs.ts)이 서브셋 목록과 같아야 한다
  const { DISPLAY_GLYPHS } = await import("../src/fonts/play/display-glyphs.ts");
  assert.deepEqual([...new Set(DISPLAY_GLYPHS)].sort(), [...display].filter((c) => c !== "\n" && c !== "\r").sort(),
    "node scripts/write-display-glyph-module.mjs 로 다시 만드세요");
  const { fitsDisplayFont, displayFallback } = await import("../src/components/play/display-font.ts");

  // PART 이름 · 단계 이름 · 「N주차」는 제목 글꼴 안에서만 쓴다 (대체 없이 그대로 그린다)
  const fixed = [...EXPERIENCE_PARTS.map((p) => p.title), ...Object.values(STAGE_LABEL), ...EXPERIENCE_WEEKS.map((w) => `${w.weekNo}주차`)];
  assert.deepEqual(fixed.filter((t) => !fitsDisplayFont(t)), [], "고정 이름이 제목 글꼴 밖 글자를 쓴다");

  // 주차 제목 · 그림책 · 교실 문장은 자료 문장이라 제목 글꼴에 없는 글자가 있다 — 대체 클래스가 붙는다
  for (const t of EXPERIENCE_WEEKS.flatMap((w) => [w.title, w.storybook, ...w.stages.map((s) => s.childLine)])) {
    assert.equal(displayFallback(t), fitsDisplayFont(t) ? "" : "display-fallback", t);
  }

  // 자료 문장을 제목 글꼴로 그리는 자리는 모두 displayFallback 을 거친다
  const DYNAMIC = /\{(week|w|prev|next)\.(title|storybook)\}|\.childLine\}|\{d\.\w+\}/;
  const offenders = [];
  for (const file of SOURCES.flatMap(walk).filter((f) => f.endsWith(".tsx"))) {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      if (line.includes("font-display") && DYNAMIC.test(line) && !line.includes("displayFallback(")) offenders.push(`${relative(ROOT, file)}: ${line.trim().slice(0, 90)}`);
    }
  }
  assert.deepEqual(offenders, [], "제목 글꼴로 자료 문장을 그리는데 대체 처리가 없다");
  // 대체 스타일이 있다
  assert.match(readFileSync(join(ROOT, "src", "app", "globals.css"), "utf8"), /\.play \.display-fallback\s*\{[^}]*font-family:\s*var\(--font-sans\)/);
  // 제목 글꼴 글자는 본문 서브셋에도 있어야 한다 (빠진 글자의 대체 글꼴)
  assert.deepEqual([...display].filter((c) => !sans.has(c)), []);
});

test("공개 체험 화면은 서브셋 굵기 범위(400~800) 밖의 굵기를 쓰지 않는다", () => {
  for (const file of SOURCES.flatMap(walk)) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /\bfont-(thin|extralight|light|black)\b|font-\[(1|2|3|9)00\]/, relative(ROOT, file));
  }
});
