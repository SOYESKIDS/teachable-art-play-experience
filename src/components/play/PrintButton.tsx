"use client";

import { popButtonClass } from "./PopButton";

/** 브라우저 인쇄 창을 연다 — 「PDF로 저장」도 같은 창에서 고른다. 인쇄물에는 단추가 찍히지 않는다. */
export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={popButtonClass("pink", "lg", "print:hidden")}>
      인쇄 · PDF로 저장
    </button>
  );
}
