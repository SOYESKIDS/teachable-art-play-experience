import type { Metadata } from "next";
import { SITE_URL } from "@/data/site";
import "./globals.css";

/**
 * TeachAble Art Play — 2026 공개 체험 사이트 (정적).
 *
 * ★ 로그인 · 회원가입 · DB · 서버 API 가 없다. 수업 플레이어의 진행 상태는 이 브라우저 탭의
 *   sessionStorage 에만 남는다. 운영 SaaS(교사 · 원장 · 관리자)는 별도 서비스다.
 * ★ 글꼴은 PlayShell 이 싣는 자체 서브셋(src/fonts/play)만 쓴다.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "TeachAble Art Play | 2026 공개 체험 — 유치원 24주 통합예술 수업",
  description:
    "로그인 없이 24주 통합예술교육 수업을 둘러보고 교실 플레이어로 직접 체험해 보세요. 체험 화면은 가상 데이터이며 아무것도 저장하지 않습니다.",
  applicationName: "TeachAble Art Play",
  authors: [{ name: "SOYESKIDS" }],
  formatDetection: { telephone: false, email: false, address: false },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "TeachAble Art Play",
    locale: "ko_KR",
    url: SITE_URL,
    title: "놀이가 예술이 되고, 예술이 성장으로 — TeachAble Art Play 2026 공개 체험",
    description: "담임선생님이 교실 플레이어로 진행하는 유치원 24주 통합예술 수업. 로그인 없이 바로 체험하세요.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
