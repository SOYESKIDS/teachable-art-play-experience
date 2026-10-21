import type { NextConfig } from "next";

/**
 * 공개 체험 전용 — 정적 export.
 *
 * ★ 서버가 없다. 빌드하면 out/ 에 HTML · JS · CSS · 글꼴 · 로고만 남는다.
 *   API · 서버 액션 · 미들웨어 · DB 연결을 만들 수 없는 구성이다 (만들면 빌드가 실패한다).
 * ★ 이미지 최적화 서버도 없다 → unoptimized. 쓰는 그림은 로고 한 장뿐이고 나머지는 SVG 다.
 */
const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
  images: { unoptimized: true },
};

export default nextConfig;
