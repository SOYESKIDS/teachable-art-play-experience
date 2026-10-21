import { cx } from "@/components/ui/cx";
import type { ExperienceWeek } from "@/data/experience/types";
import { Motif } from "./Motif";

/**
 * 주차 주제 그림을 흩어 놓은 장면 — PART 카드 · 24주 배너의 대표 그림 (자체 제작 SVG).
 *
 * ★ 사진 대신 쓴다 (공개 체험 사이트에는 사용권이 확인된 사진이 없다).
 * ★ 위치는 고정된 배치표를 돌려 쓴다 — 빌드마다 같은 그림이 나오고 화면이 밀리지 않는다.
 * ★ 장식이다 (aria-hidden). 같은 정보가 옆 글자로 있다.
 */
const SPOTS = [
  [16, 30, 1.15], [42, 22, 0.9], [70, 30, 1.05], [88, 18, 0.75],
  [28, 64, 0.95], [56, 60, 1.2], [84, 62, 0.9], [10, 80, 0.7],
  [44, 86, 0.75], [70, 86, 0.8], [94, 84, 0.65], [6, 46, 0.6],
] as const;

export function MotifScatter({ weeks, className, size = 22 }: { weeks: ExperienceWeek[]; className?: string; size?: number }) {
  return (
    <div aria-hidden="true" className={cx("absolute inset-0 overflow-hidden", className)}>
      <div className="dots absolute inset-0 opacity-50" />
      {weeks.slice(0, SPOTS.length).map((w, i) => {
        const [x, y, s] = SPOTS[i];
        return (
          <div
            key={w.weekNo}
            className="absolute flex aspect-square -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow-pop ring-4 ring-white"
            style={{ left: `${x}%`, top: `${y}%`, height: `${size * s}%`, background: `radial-gradient(circle at 35% 30%, #fff 0%, ${w.themeColor}2e 75%)` }}
          >
            <Motif motif={w.body.motif} color={w.themeColor} className="h-[64%] w-auto" />
          </div>
        );
      })}
    </div>
  );
}
