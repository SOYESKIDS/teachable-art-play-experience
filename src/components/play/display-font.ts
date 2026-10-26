import { DISPLAY_GLYPHS } from "@/fonts/play/display-glyphs";

/**
 * 둥근 제목 글꼴로 그릴 수 없는 제목은 **문장 전체를** 본문 글꼴 굵은체로 그린다.
 *
 * ★ 왜 — 제목 글꼴 서브셋에 없는 글자(예: 「첨벙」 「섞」)는 브라우저가 글자 단위로
 *   다른 글꼴을 쓴다. 한 제목 안에서 두 글꼴이 섞이면 줄이 갈라져 보이고 읽기 어렵다.
 * ★ 제목 글꼴(Jua) 원본이 없어 서브셋을 늘리지 않는다. 바이너리를 손으로 고치지 않는다.
 * ★ 쓰는 법: className={cx("font-display", displayFallback(text), …)}
 *   대체 스타일은 globals.css `.play .display-fallback`.
 */
const SET = new Set(DISPLAY_GLYPHS);

export function fitsDisplayFont(text: string): boolean {
  for (const ch of text) {
    if (ch.trim() !== "" && !SET.has(ch)) return false;
  }
  return true;
}

/** 다 그릴 수 있으면 빈 문자열, 아니면 대체 클래스 */
export function displayFallback(...texts: Array<string | number | null | undefined>): string {
  return texts.every((t) => t === null || t === undefined || fitsDisplayFont(String(t))) ? "" : "display-fallback";
}
