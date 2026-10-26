import Link from "next/link";
import { BrandMark } from "@/components/layout/BrandMark";
import { COMPANY, CONTACT } from "@/data/site";

/**
 * 2026 공개 체험 바닥글.
 *
 * ★ 체험 입구 + 문의(전화 · 이메일 · 영업 사이트)만. 로그인 · 회원가입 입구는 두지 않는다.
 * ★ 이 사이트는 개인정보를 받지 않는다 — 폼 · 쿠키 · 계정이 없다.
 */
const LINKS = [
  { label: "24주 수업 만나기", href: "/experience/weeks" },
  { label: "지금 수업 체험하기", href: "/experience/classroom/4" },
  { label: "성장리포트 예시", href: "/experience/report" },
  { label: "도입 안내", href: "/#adoption" },
];

export function PlayFooter() {
  return (
    <footer data-surface="dark" className="bg-pop-ink pb-10 pt-14 text-white/75 sm:pt-16 print:hidden">
      <div className="mx-auto max-w-[1320px] 2xl:max-w-[1520px] px-4 sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-[32ch]">
            <BrandMark tone="inverse" layout="stacked" />
            <p className="mt-5 font-display text-[24px] leading-snug text-white">놀이가 예술이 되고, 예술이 성장으로.</p>
            <p className="mt-2 text-[14px] text-white/70">2026년은 누구나 로그인 없이 무료로 체험할 수 있습니다. 2027년 기관 구독형 서비스로 전환할 예정입니다.</p>
          </div>
          <nav aria-label="바닥글 바로가기" className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-1">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="inline-flex min-h-11 items-center text-[16px] font-bold text-white hover:text-pop-yellow">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col items-start gap-2 text-[15px]">
            <p className="text-[14px] font-bold text-white">우리 유치원 도입 문의</p>
            <a href={CONTACT.phoneHref} className="inline-flex min-h-11 items-center font-bold text-white hover:text-pop-yellow">☎ {CONTACT.phone}</a>
            <a href={CONTACT.emailHref} className="inline-flex min-h-11 items-center font-bold text-white hover:text-pop-yellow">✉ {CONTACT.email}</a>
            <a href={CONTACT.salesSite} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-bold text-white underline-offset-4 hover:text-pop-yellow hover:underline">
              서비스 소개 사이트 (새 창)
            </a>
          </div>
        </div>
        <div className="mt-12 border-t border-white/15 pt-6 text-[13px] leading-relaxed text-white/65">
          <p className="break-keep">
            {COMPANY.name}<span aria-hidden="true"> · </span>
            <span className="whitespace-nowrap">대표자 {COMPANY.ceo}</span><span aria-hidden="true"> · </span>
            <span className="whitespace-nowrap">사업자등록번호 {COMPANY.businessNo}</span>
          </p>
          <p className="mt-1">이 사이트는 공개 체험용입니다. 회원가입 · 로그인 · 문의 저장이 없고 개인정보를 수집하지 않습니다. 수업 진행 상태는 이 브라우저 탭 안에만 잠시 남습니다.</p>
          <p className="mt-1">화면의 그림은 모두 자체 제작 일러스트입니다. 원아 · 기록은 모두 가상입니다. 수업 활동은 공식 가이드를 바탕으로 한 체험용 구성이며 정식 교안 확정 전입니다.</p>
          <p className="mt-1">{COMPANY.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
