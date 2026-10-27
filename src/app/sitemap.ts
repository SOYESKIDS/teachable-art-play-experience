import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/site";

export const dynamic = "force-static";

/** 공개 체험 페이지 전체 — 24주 안내 · 24주 플레이어 포함 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/experience", "/experience/weeks", "/experience/report", "/experience/growth-demo"];
  for (let n = 1; n <= 24; n++) paths.push(`/experience/weeks/${n}`, `/experience/classroom/${n}`);
  return paths.map((p) => ({ url: p === "/" ? SITE_URL : `${SITE_URL}${p}`, changeFrequency: "monthly", priority: p === "/" ? 1 : 0.7 }));
}
