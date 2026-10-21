import type { ReactNode } from "react";
import { playDisplay, playSans } from "@/fonts/play";
import { PlayFooter } from "./PlayFooter";
import { PlayHeader } from "./PlayHeader";

/**
 * 2026 공개 체험 틀 — 모든 페이지.
 *
 * ★ `.play` 범위에서 PLAYFUL 디자인 값이 적용된다 (`.public-v4` 는 기존 공개 토큰 호환용).
 * ★ 글꼴은 이 틀에서만 싣는 자체 서브셋이다 (src/fonts/play).
 * ★ 서버 데이터 · 로그인 · 폼이 없다. 도입 문의는 홈 #contact 의 전화 · 이메일 · 영업 사이트로.
 */
export function PlayShell({ children }: { children: ReactNode }) {
  return (
    <div className={`public-v4 play ${playSans.variable} ${playDisplay.variable} flex min-h-full flex-1 flex-col`}>
      <PlayHeader />
      {children}
      <PlayFooter />
    </div>
  );
}
