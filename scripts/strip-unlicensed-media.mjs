/**
 * 빌드 뒤(postbuild) — 사용권이 확인되지 않은 주차 표지를 배포 폴더(out/)에서 뺀다.
 *
 * ★ 왜 — 화면이 표지를 싣지 않아도 public/ 의 파일은 out/ 에 그대로 복사되어
 *   주소만 알면 받을 수 있다. 사용권 증빙 전에는 배포본에 남기지 않는다.
 * ★ 기준은 src/data/experience/media.ts 의 LICENSE_STATUS 하나다.
 *   "confirmed" 로 바꾸면 이 스크립트는 아무것도 지우지 않는다.
 * ★ 원본(public/)은 건드리지 않는다. 빌드 결과물에서만 뺀다.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const media = readFileSync(join(ROOT, "src", "data", "experience", "media.ts"), "utf8");
const status = media.match(/export const LICENSE_STATUS: LicenseStatus = "(\w+)"/)?.[1];
if (!status) {
  console.error("media.ts 에서 LICENSE_STATUS 를 읽지 못했습니다");
  process.exit(1);
}

const dir = join(ROOT, "out", "images", "week-covers-web");
if (status === "confirmed") {
  console.log("표지 사용권 확인됨 — 배포본에 표지를 남깁니다");
} else if (existsSync(dir)) {
  rmSync(dir, { recursive: true, force: true });
  console.log(`표지 사용권 ${status} — out/images/week-covers-web 을 배포본에서 뺐습니다`);
} else {
  console.log(`표지 사용권 ${status} — 배포본에 표지가 없습니다`);
}
