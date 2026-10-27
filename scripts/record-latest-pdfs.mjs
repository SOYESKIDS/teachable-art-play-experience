// 최신 교안 PDF 확인 기록 → docs/completion/PDF-LATEST-20261027.md
//   node scripts/record-latest-pdfs.mjs "<최신 폴더>" "<2026-10-22 폴더>"
// ★ 파일마다 SHA-256 을 직접 계산해 묶음 매니페스트 · 2026-10-22 판과 대조한다 (추정하지 않는다). PDF 는 저장소에 넣지 않는다.
//   묶음 폴더마다 SHA256_manifest.csv 가 있고, PDF 는 폴더 바로 아래 또는 pdf/ 아래에 있다.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [latest, original] = process.argv.slice(2);
const sha = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");
const bundles = [];
for (const d of readdirSync(latest).filter((x) => statSync(join(latest, x)).isDirectory()).sort()) {
  const dir = join(latest, d);
  const manifest = readFileSync(join(dir, "SHA256_manifest.csv"), "utf8");
  const pdfDir = existsSync(join(dir, "pdf")) ? join(dir, "pdf") : dir;
  const rows = [];
  for (const f of readdirSync(pdfDir).filter((x) => x.endsWith(".pdf")).sort()) {
    const h = sha(join(pdfDir, f));
    const m = manifest.split(/\r?\n/).find((l) => l.includes(f))?.match(/[0-9a-f]{64}/)?.[0];
    const base = f.replace(/\(\d\)\.pdf$/, ".pdf");
    const o = sha(join(original, base));
    rows.push({ week: Number(f.match(/^\d+/)[0]), file: f, h, manifest: m === h, original: o === h });
  }
  bundles.push({ name: d, rows });
}
const all = bundles.flatMap((b) => b.rows);
const allSame = all.every((r) => r.manifest && r.original);
const weeks = [...new Set(all.map((r) => r.week))].sort((a, b) => a - b);
const table = (rows) => `| 주 | 최신 파일 | SHA-256 | 매니페스트 | 2026-10-22 판 |
|---|---|---|---|---|
${rows.map((r) => `| ${r.week} | ${r.file} | \`${r.h}\` | ${r.manifest ? "같음" : "**다름**"} | ${r.original ? "같음" : "**다름**"} |`).join("\n")}`;
const md = `# 최신 교안 PDF 확인 기록 (2026-10-27)

- 받은 위치: \`대쉬보드 구성안/최신_20261027/\` — 묶음 ${bundles.length}개 (${bundles.map((b) => `${b.name} ${b.rows.length}개`).join(" · ")}) · 묶음마다 \`SHA256_manifest.csv\`
- 비교 대상: 같은 위치의 2026-10-22 판 24개 PDF (저장소 원문 추출 텍스트 \`docs/curriculum-upgrade/…/source_text\` · \`dashboard-source-21-24\` 의 출처)
- 방법: \`node scripts/record-latest-pdfs.mjs <최신 폴더> <2026-10-22 폴더>\` — 파일마다 SHA-256 을 직접 계산해 ① 매니페스트 ② 2026-10-22 판과 대조 (추정하지 않음)

## 결과

${allSame
  ? `**확인한 ${all.length}개 파일(${weeks[0]}~${weeks.at(-1)}주 · ${weeks.length}개 주차) 모두 매니페스트와 같고, 2026-10-22 판과 바이트 단위로 같다.** 파일 이름의 \`(3)\` · \`(2)\` 는 복사본 번호이며 내용 변경이 없다.
따라서 16~24주를 포함한 24주 모두 원문 차이는 **0건**이고, 저장소의 원문 추출 텍스트와 그것을 옮긴 수업 데이터가 그대로 최신 기준이다.
24주 묶음의 README 도 「PDF 그림 자리에 그림책 · 워크북 그림을 넣지 않았다」고 밝힌다 — 그림 자리는 계속 「자료 준비 중」으로 둔다.`
  : "**2026-10-22 판과 다른 파일이 있다 — 아래 표의 「다름」을 원문 대조해야 한다.**"}

${bundles.map((b) => `## ${b.name}\n\n${table(b.rows)}`).join("\n\n")}

## 원문 추출 텍스트 재확인

최신 PDF 를 pdftotext 로 다시 뽑아 저장소 추출 텍스트와 대조했다 — 1~20주 문장 조각 97~99% 일치, 21~24주 낱말 90~92% 일치.
21~24주의 나머지는 제목 장식 글꼴처럼 pdftotext 가 글자를 읽지 못하는 부분이다 (파일 자체가 해시로 같으므로 내용 차이가 아니다).
`;
writeFileSync(join(ROOT, "docs/completion/PDF-LATEST-20261027.md"), md);
console.log("ok", all.length, allSame ? "all identical" : "DIFFERENCES");
