import { ConsultButton } from "@/components/play/ConsultButton";
import { EmailInquiryButton } from "@/components/play/EmailInquiryButton";
import { ShareButton } from "@/components/play/ShareButton";
import { DemoNotice } from "@/components/play/Badges";
import { Sticker } from "@/components/play/Stickers";
import { WeekExplorer } from "@/components/play/WeekExplorer";
import { WeekArt } from "@/components/play/WeekArt";
import { MotifScatter } from "@/components/play/MotifScatter";
import { EXPERIENCE_PARTS, EXPERIENCE_WEEKS } from "@/data/experience/weeks";

export const metadata = {
  title: "24주 수업 둘러보기 | TeachAble Art Play",
  description: "씨앗과 숲 · 우리 그리고 모두의 사계절 · 두근두근 세계여행 — 24주 통합예술교육 수업을 큰 카드로 둘러보세요.",
  alternates: { canonical: "/experience/weeks" },
};

export default function ExperienceWeeksPage() {
  return (
    <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
      <section aria-labelledby="weeks-title" className="relative isolate overflow-hidden">
        <div className="relative h-[300px] sm:h-[380px] lg:h-[440px]">
          {/* 24주 주제 그림 배너 (자체 제작 SVG) — 글이 놓이는 왼쪽은 남색으로 덮어 읽기 쉽게 */}
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(120deg,#e6fbf7_0%,#e8f2ff_50%,#ffe9f1_100%)]">
            <MotifScatter weeks={EXPERIENCE_WEEKS.filter((_, i) => i % 2 === 0)} size={24} className="left-[30%] md:opacity-30" />
          </div>
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,37,71,0.92)_0%,rgba(27,37,71,0.8)_38%,rgba(27,37,71,0)_72%)] max-md:bg-[linear-gradient(90deg,rgba(27,37,71,0.92)_0%,rgba(27,37,71,0.75)_100%)]" />
          <div className="absolute inset-0">
            <div className="mx-auto flex h-full max-w-[1320px] 2xl:max-w-[1520px] flex-col justify-center px-4 sm:px-6">
              <DemoNotice tone="light" className="w-fit" />
              <h1 id="weeks-title" className="mt-5 font-display text-[40px] leading-tight text-white sm:text-[58px]">
                24주, 아이들의
                <br />
                <span className="text-pop-yellow">큰 모험</span>
              </h1>
              <p className="mt-3 max-w-[34ch] text-[17px] font-medium text-white/90 sm:text-[19px]">PART를 골라 주차를 둘러보고, 마음에 드는 수업을 바로 체험해 보세요.</p>
            </div>
          </div>
          {/* 대표 그림 — PART 마다 그림책 표지 한 장 (1 · 9 · 17주차, 자체 제작 표지형 그림). 제목이 가리지 않게 나란히 */}
          <div aria-hidden="true" className="absolute right-[3%] top-1/2 hidden h-[70%] w-[50%] -translate-y-1/2 md:block lg:right-[4%] lg:w-[46%]">
            {[1, 9, 17].map((n, i) => {
              const w = EXPERIENCE_WEEKS.find((x) => x.weekNo === n)!;
              return (
                <div key={n} className={["absolute left-0 top-[22%] w-[32%] -rotate-[5deg]", "absolute left-[34%] top-[6%] w-[32%] rotate-[1deg]", "absolute right-0 top-[26%] w-[32%] rotate-[5deg]"][i]}>
                  <WeekArt week={w} className="aspect-[4/3] w-full rounded-[22px] shadow-pop-lg ring-4 ring-white" />
                </div>
              );
            })}
          </div>
          <Sticker kind="star" color="#ffc928" float className="absolute right-[28%] top-10 hidden h-12 w-12 md:block" />
        </div>
      </section>
      <div className="mx-auto max-w-[1320px] 2xl:max-w-[1520px] px-4 pb-20 pt-6 sm:px-6">
        <WeekExplorer parts={EXPERIENCE_PARTS} weeks={EXPERIENCE_WEEKS} />

        {/* 둘러보기를 마친 다음 행동 (E-4 · E-5) */}
        <div className="mx-auto mt-10 flex max-w-[640px] flex-col items-center justify-center gap-3 rounded-[28px] bg-white/70 p-4 sm:flex-row">
          <ShareButton path="/experience/weeks" tone="white" size="md" />
          <EmailInquiryButton screen="weeks" tone="white" size="md" />
          <ConsultButton medium="weeks" tone="ink" size="md">도입 상담 안내</ConsultButton>
        </div>
      </div>
    </main>
  );
}
