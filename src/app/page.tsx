import type { Metadata } from "next";
import { PlayShell } from "@/components/play/PlayShell";
import { PlayHero } from "@/components/play/home/PlayHero";
import { AdventureMap, ClassFlow, PlayerPreview, TryFeatured } from "@/components/play/home/PlaySections";
import { AdoptionTimeline, GrowthPreview, PlayFinalCta } from "@/components/play/home/PlayClosing";
import { COMPANY, CONTACT, SITE_URL } from "@/data/site";

/**
 * 2026 공개 체험 홈 (PLAYFUL PREMIUM EDUCATION).
 *
 * ★ 설명보다 장면이 먼저다 — 큰 그림 · 24주 지도 · 수업 흐름 · 바로 체험.
 * ★ 도입 문의 위치는 #contact (전화 · 이메일 · 영업 사이트). 저장하는 폼은 없다.
 * ★ 이 페이지는 서버 데이터를 읽지 않는다 (정적 생성).
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: COMPANY.name,
  brand: COMPANY.service,
  url: SITE_URL,
  telephone: CONTACT.phone,
  email: CONTACT.email,
};

export default function Home() {
  return (
    <PlayShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD).replace(/</g, "\\u003c") }} />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <PlayHero />
        <AdventureMap />
        <ClassFlow />
        <TryFeatured />
        <PlayerPreview />
        <GrowthPreview />
        <AdoptionTimeline />
        <PlayFinalCta />
      </main>
    </PlayShell>
  );
}
