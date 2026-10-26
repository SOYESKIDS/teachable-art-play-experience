/**
 * src/fonts/play/display-glyphs.txt → src/fonts/play/display-glyphs.ts
 *
 * ★ 왜 — 화면이 「이 제목을 둥근 제목 글꼴로 다 그릴 수 있는가」를 알아야 한다.
 *   한 글자라도 없으면 그 제목 전체를 본문 글꼴 굵은체로 그린다 (글자마다 글꼴이
 *   섞여 한 줄이 갈라져 보이지 않게). 목록은 제목 글꼴 서브셋과 같은 파일에서 온다.
 * ★ 제목 글꼴(Jua) 원본이 저장소에 없어 서브셋을 다시 만들 수 없다. 그래서 목록도
 *   지금 서브셋 그대로다. tests/play-fonts.test.mjs 가 두 파일이 같은지 검사한다.
 *
 *   node scripts/write-display-glyph-module.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "src", "fonts", "play");
const glyphs = [...new Set(readFileSync(join(DIR, "display-glyphs.txt"), "utf8"))]
  .filter((c) => c !== "\n" && c !== "\r")
  .sort()
  .join("");

const body = `/**
 * 둥근 제목 글꼴(TAP Play Display) 서브셋이 그릴 수 있는 글자 — 자동 생성 파일.
 * 원본: display-glyphs.txt · 만들기: node scripts/write-display-glyph-module.mjs
 */
export const DISPLAY_GLYPHS = ${JSON.stringify(glyphs)};
`;
writeFileSync(join(DIR, "display-glyphs.ts"), body);
console.log(`display-glyphs.ts: ${[...glyphs].length} chars`);
