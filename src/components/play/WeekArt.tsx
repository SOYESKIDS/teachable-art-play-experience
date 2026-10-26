import Image from "next/image";
import { cx } from "@/components/ui/cx";
import { characterImage } from "@/data/experience/characters";
import type { ExperienceWeek } from "@/data/experience/types";
import { Buddy } from "./Doodles";
import { Motif } from "./Motif";
import { Sticker } from "./Stickers";
import { displayFallback } from "./display-font";

/**
 * 주차 대표 그림.
 *
 * ★ 주차 전용 사진(media.ts)이 있으면 사진, 없으면 주차 색 · 주제 그림 · 캐릭터로
 *   그린 일러스트를 쓴다. 사진이 없다고 빈칸이나 깨진 이미지를 두지 않는다.
 * ★ 색은 공식 지도의 주차 색(themeColor)을 옅게 깐다 — 24장이 서로 구분된다.
 */
export function WeekArt({
  week,
  size = "card",
  priority = false,
  className,
}: {
  week: ExperienceWeek;
  /** card · hero = 그림책 표지형, thumb = 작은 썸네일 (주제 그림만) */
  size?: "card" | "hero" | "thumb";
  priority?: boolean;
  className?: string;
}) {
  const character = characterImage(week.body.character);
  const hero = size === "hero";

  if (week.image) {
    const { width, height } = week.image;
    return (
      <div
        className={cx("relative overflow-hidden", className)}
        // ★ 큰 그림은 표지의 **원래 비율**로 둔다. 4:3 틀에 맞추면 위아래가 남거나
        //   제목이 잘린다. 표지마다 비율이 다르다 (1~8주차 거의 정사각형 · 9~16주차 16:9).
        style={{ backgroundColor: `${week.themeColor}22`, ...(hero ? { aspectRatio: `${width} / ${height}` } : null) }}
      >
        <Image
          src={week.image.src}
          alt={week.image.alt}
          fill
          // 첫 화면 큰 그림(LCP) — 미리 받고 다른 그림보다 먼저 받는다 (Next 16: priority → preload)
          preload={priority}
          fetchPriority={priority ? "high" : undefined}
          sizes={hero ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 100vw"}
          // ★ cover 가 아니라 contain — 표지의 제목과 캐릭터가 잘리면 안 된다.
          //   남는 자리는 주차 색으로 채워 카드 크기와 줄맞춤을 유지한다.
          className="object-contain"
        />
      </div>
    );
  }

  // 카드 · 큰 그림 — 그림책 표지처럼 그린다 (책등 · SOYES KIDS · 회차 · 색색의 제목 · 주제 그림).
  // ★ 사용권이 확인된 표지가 없어도 「그림책 수업」이라는 인상이 남게 한다. 전부 자체 제작이다
  //   (CSS · SVG 주제 그림 · 글자). 사용권 미확인 표지 그림을 베끼지 않는다 — 캐릭터 원화도 쓰지 않는다.
  if (!character && size !== "thumb") {
    return <BookCover week={week} hero={hero} className={className} />;
  }

  // 캐릭터가 꺼져 있으면 주제 그림을 크게 — 카드는 구도 4가지를 주차 번호로 돌려 쓴다.
  // 한 줄(4장)에 서로 다른 구도가 오도록 weekNo % 4.
  if (!character) {
    const layout = hero ? 0 : week.weekNo % 4;
    const flip = !hero && week.weekNo % 2 === 0;
    const STICKERS = ["star", "flower", "sparkle", "heart", "sun", "sprout", "cloud"] as const;
    const s1 = STICKERS[week.weekNo % STICKERS.length];
    const s2 = STICKERS[(week.weekNo + 3) % STICKERS.length];
    const L = [
      // 0 가운데 원
      { halo: "left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 " + (hero ? "h-[64%]" : "h-[70%]"), motif: "left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 " + (hero ? "h-[50%]" : "h-[54%]"), a: "left-[12%] top-[14%]", b: "bottom-[14%] right-[9%]" },
      // 1 왼쪽 아래 — 큰 그림이 땅에서 솟는다
      { halo: "-left-[6%] bottom-[2%] h-[86%]", motif: "left-[10%] bottom-[16%] h-[60%] -rotate-6", a: "right-[12%] top-[16%]", b: "right-[26%] top-[42%]" },
      // 2 오른쪽 기울임
      { halo: "-right-[8%] -top-[10%] h-[90%]", motif: "right-[12%] top-[14%] h-[60%] rotate-[8deg]", a: "left-[12%] top-[18%]", b: "left-[28%] bottom-[20%]" },
      // 3 햇살 고리 — 흰 원 대신 점선 고리
      { halo: "left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 h-[72%] bg-transparent border-[6px] border-dashed border-white/80", motif: "left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 h-[50%]", a: "left-[10%] bottom-[22%]", b: "right-[10%] top-[12%]" },
    ][layout];
    return (
      <div
        className={cx("relative isolate overflow-hidden", className)}
        style={{ background: `radial-gradient(120% 90% at ${layout === 1 ? "25% 80%" : "70% 20%"}, ${week.themeColor}55 0%, ${week.themeColor}1f 50%, #fff7e8 100%)` }}
        role="img"
        aria-label={`${week.weekNo}주차 「${week.title}」 주제 그림`}
      >
        <div aria-hidden="true" className="dots absolute inset-0 opacity-60" />
        <svg aria-hidden="true" viewBox="0 0 400 120" preserveAspectRatio="none" className={cx("absolute inset-x-0 bottom-0 h-[30%] w-full", flip && "-scale-x-100")}>
          <path d="M0 40c60-30 120-30 180 0s140 30 220-6V120H0z" fill={week.themeColor} opacity="0.22" />
          <path d="M0 70c80-26 150-20 210 4s120 22 190-8V120H0z" fill={week.themeColor} opacity="0.32" />
        </svg>
        <div aria-hidden="true" className={cx("absolute aspect-square rounded-full", layout === 3 ? "" : "bg-white/75", L.halo)} />
        <Motif motif={week.body.motif} color={week.themeColor} className={cx("absolute w-auto drop-shadow-[0_6px_0_rgba(27,37,71,0.10)]", L.motif)} />
        {hero ? <Buddy character={week.body.character} className="absolute bottom-[6%] left-[5%] w-[24%] max-w-[200px]" /> : null}
        <Sticker kind={hero ? "sparkle" : s1} color="#ffc928" className={cx("absolute", L.a, hero ? "h-10 w-10" : "h-7 w-7")} />
        <Sticker kind={hero ? "star" : s2} color="#ff4f8b" tilt={-12} className={cx("absolute", L.b, hero ? "h-9 w-9" : "h-6 w-6")} />
      </div>
    );
  }

  return (
    <div
      className={cx("relative isolate overflow-hidden", className)}
      style={{ background: `radial-gradient(120% 90% at 70% 20%, ${week.themeColor}55 0%, ${week.themeColor}1f 50%, #fff7e8 100%)` }}
      role="img"
      aria-label={`${week.weekNo}주차 「${week.title}」 주제 그림`}
    >
      <div aria-hidden="true" className="dots absolute inset-0 opacity-60" />
      <div aria-hidden="true" className={cx("absolute rounded-full bg-white/75", hero ? "-right-10 -top-10 h-72 w-72" : "-right-6 -top-6 h-40 w-40")} />
      <Motif motif={week.body.motif} color={week.themeColor} className={cx("absolute drop-shadow-[0_6px_0_rgba(27,37,71,0.10)]", hero ? "right-[8%] top-[12%] h-[58%] w-auto" : "right-[7%] top-[10%] h-[62%] w-auto")} />
      <Image
        src={character.src}
        alt=""
        width={character.width}
        height={character.height}
        sizes={hero ? "240px" : "120px"}
        className={cx("absolute bottom-0 h-auto drop-shadow-[0_8px_10px_rgba(27,37,71,0.18)]", hero ? "left-[6%] w-[30%] max-w-[260px]" : "left-[5%] w-[34%] max-w-[130px]")}
      />
    </div>
  );
}

/**
 * 표지 글씨와 자료의 그림책 제목이 다를 때 두 제목을 나눠 적는다 (3 · 7 · 8주차).
 * 같으면 아무것도 그리지 않는다.
 */
export function CoverTitleNote({ week, className }: { week: ExperienceWeek; className?: string }) {
  const cover = week.image?.coverTitle;
  if (!cover || cover === week.storybook) return null;
  return (
    <p className={cx("text-[13px] font-semibold leading-relaxed text-pop-ink-muted", className)}>
      표지 글씨 《{cover}》 · 자료의 그림책 제목 《{week.storybook}》
    </p>
  );
}

/** 표지 제목 글자색 — 원본 표지처럼 색색으로. 흰 테두리로 배경과 떨어뜨린다 (장식 · 읽는 글은 옆에 따로 있다) */
const TITLE_COLORS = ["#e2336b", "#e86a12", "#1f9d55", "#2f7fd6", "#7b5cd6"];

function BookCover({ week, hero, className }: { week: ExperienceWeek; hero: boolean; className?: string }) {
  const ep = `EP.${String(week.weekNo).padStart(2, "0")}`;
  const letters = [...week.storybook];
  let colorIndex = week.weekNo;
  return (
    <div
      // @container — 카드 표지는 표지 폭에 맞춰 글자 크기가 줄어든다 (목록 · 상단 묶음 · 휴대폰)
      className={cx("@container relative isolate overflow-hidden", className)}
      style={{ background: `linear-gradient(165deg, #fffdf6 0%, ${week.themeColor}1f 52%, ${week.themeColor}42 100%)` }}
      role="img"
      aria-label={`${week.weekNo}주차 그림책 《${week.storybook}》 표지 그림`}
    >
      <div aria-hidden="true" className="dots absolute inset-0 opacity-40" />
      {/* 책등 */}
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-[4.5%]" style={{ backgroundColor: week.themeColor }}>
        <div className="absolute inset-y-0 right-[22%] w-[10%] bg-white/40" />
      </div>
      {/* 땅 */}
      <svg aria-hidden="true" viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[30%] w-full">
        <path d="M0 40c60-30 120-30 180 0s140 30 220-6V120H0z" fill={week.themeColor} opacity="0.20" />
        <path d="M0 70c80-26 150-20 210 4s120 22 190-8V120H0z" fill={week.themeColor} opacity="0.32" />
      </svg>
      <div aria-hidden="true" className={cx("absolute inset-0 flex flex-col items-center pl-[8%] pr-[5%]", hero ? "pt-[5%]" : "pt-[6%]")}>
        <div className="flex w-full items-center justify-end gap-2">
          <span className={cx("font-extrabold tracking-wide", hero ? "text-[13px] sm:text-[15px]" : "text-[clamp(8px,3.4cqw,11px)]")} style={{ color: week.themeColor }}>SOYES KIDS ♥</span>
          {/* 카드에는 주차 번호 배지가 왼쪽 위에 따로 붙는다 — 회차 배지는 큰 그림에만 */}
          {hero ? <span className="rounded-full px-3 py-1 font-display text-[15px] leading-none text-white shadow-pop sm:text-[18px]" style={{ backgroundColor: week.themeColor }}>{ep}</span> : null}
        </div>
        {/* 제목 — 양옆 햇살 줄 */}
        <div className={cx("flex w-full items-center justify-center", hero ? "mt-[3%] gap-2 sm:gap-3" : "mt-[13%] gap-1.5")}>
          <Rays className={hero ? "h-6 w-6 sm:h-9 sm:w-9" : "size-[clamp(8px,4.5cqw,16px)]"} />
          <p className={cx("text-center font-display leading-[1.12] [text-wrap:balance]", hero ? "max-w-[15ch] text-[26px] sm:text-[40px] xl:text-[46px]" : "max-w-[86%] text-[clamp(11px,6.6cqw,22px)]", displayFallback(week.storybook))}
            style={{ textShadow: "0 2px 0 #fff, 2px 0 0 #fff, -2px 0 0 #fff, 0 -2px 0 #fff, 0 4px 0 rgba(27,37,71,0.12)" }}>
            {letters.map((ch, i) => {
              if (ch.trim() === "") return <span key={i}>{ch}</span>;
              const color = TITLE_COLORS[colorIndex++ % TITLE_COLORS.length];
              return <span key={i} style={{ color }}>{ch}</span>;
            })}
          </p>
          <Rays flip className={hero ? "h-6 w-6 sm:h-9 sm:w-9" : "size-[clamp(8px,4.5cqw,16px)]"} />
        </div>
      </div>
      <div aria-hidden="true" className={cx("absolute left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80", hero ? "top-[65%] h-[48%]" : "top-[71%] h-[42%]")} />
      <Motif motif={week.body.motif} color={week.themeColor} className={cx("absolute left-1/2 w-auto -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_6px_0_rgba(27,37,71,0.10)]", hero ? "top-[65%] h-[36%]" : "top-[71%] h-[31%]")} />
      <Buddy character={week.body.character} className={cx("absolute", hero ? "bottom-[5%] left-[8%] w-[20%] max-w-[170px]" : "bottom-[6%] left-[8%] w-[22%] max-w-[80px]")} />
      <Sticker kind="sparkle" color="#ffc928" className={cx("absolute right-[9%]", hero ? "top-[46%] h-9 w-9" : "top-[48%] h-6 w-6")} />
      <Sticker kind="heart" color="#ff4f8b" tilt={-12} className={cx("absolute right-[12%]", hero ? "bottom-[12%] h-8 w-8" : "bottom-[12%] h-5 w-5")} />
    </div>
  );
}

/** 원본 표지 제목 옆의 햇살 줄을 닮은 장식 */
function Rays({ flip = false, className }: { flip?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cx("shrink-0", flip && "-scale-x-100", className)}>
      <path d="M20 5L12 9M21 12h-9M20 19l-8-4" fill="none" stroke="#ffc928" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
