// 주차 PDF 의 그림 자리 ID(w4.physical0.step.0 …)를 모아 등록부를 만든다
//   node scripts/gen-media-slots.mjs  →  src/data/experience/lesson-engine/media-slots-generated.ts
//
// ★ ID 는 PDF 원문 그대로다. 새 ID 를 만들지 않는다.
// ★ 파일이 있는지는 여기서 정하지 않는다 — lesson-engine/assets.ts 가 media.ts(공개 확인 표지)와 맞춰 본다.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "docs/curriculum-upgrade/TAP_Curriculum_Development_Pack/TeachAble_24Week_Dashboard_DevPack/source_text");
const sourceText = (n) => readFileSync(n <= 20 ? join(SRC_DIR, `week-${String(n).padStart(2, "0")}.txt`) : join(ROOT, `docs/curriculum-upgrade/dashboard-source-21-24/week-${n}.txt`), "utf8");

const out = {};
for (let n = 1; n <= 24; n++) {
  const ids = [...new Set(sourceText(n).match(new RegExp(`w${n}\\.[A-Za-z0-9_]+(?:\\.[A-Za-z0-9_]+)*`, "g")) ?? [])];
  out[n] = ids;
}
const body = Object.entries(out).map(([n, ids]) => `  ${n}: [\n${ids.map((x) => `    "${x}",`).join("\n")}\n  ],`).join("\n");
writeFileSync(
  join(ROOT, "src/data/experience/lesson-engine/media-slots-generated.ts"),
  `// 자동 생성 — node scripts/gen-media-slots.mjs (손으로 고치지 않는다)\n// 주차 PDF 원문에 적힌 그림 자리 ID. 파일 보유 여부는 assets.ts 에서 정한다.\nexport const MEDIA_SLOT_IDS: Readonly<Record<number, readonly string[]>> = {\n${body}\n};\n`,
);
console.log("ok", Object.values(out).reduce((s, x) => s + x.length, 0), "slots");
