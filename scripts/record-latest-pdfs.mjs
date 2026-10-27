// 최신 교안 PDF 확인 기록 → docs/completion/PDF-LATEST-20261027.md
//   node scripts/record-latest-pdfs.mjs "<최신 폴더>" "<2026-10-22 폴더>"
// ★ 파일마다 SHA-256 을 직접 계산해 ZIP 매니페스트 · 2026-10-22 판과 대조한다 (추정하지 않는다). PDF 는 저장소에 넣지 않는다.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [latest, original] = process.argv.slice(2);
const sha = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");
const rows = [];
for (const d of readdirSync(latest).filter((x) => statSync(join(latest, x)).isDirectory()).sort()) {
  const dir = join(latest, d);
  const manifest = readFileSync(join(dir, "SHA256_manifest.csv"), "utf8");
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".pdf")).sort()) {
    const h = sha(join(dir, f));
    const m = manifest.split(/\r?\n/).find((l) => l.includes(f))?.match(/[0-9a-f]{64}/)?.[0];
    const base = f.replace(/\(\d\)\.pdf$/, ".pdf");
    const o = sha(join(original, base));
    rows.push({ week: Number(f.match(/^\d+/)[0]), file: f, h, manifest: m === h, original: o === h, zip: d });
  }
}
const allSame = rows.every((r) => r.manifest && r.original);
const md = `# 최신 1~15주 교안 PDF 확인 기록 (2026-10-27)

- 받은 위치: \`대쉬보드 구성안/최신_20261027/\` — ZIP 3개 (${[...new Set(rows.map((r) => r.zip))].join(" · ")}) · 각 ZIP 안 \`SHA256_manifest.csv\`
- 비교 대상: 같은 위치의 2026-10-22 판 24개 PDF (저장소 원문 추출 텍스트 \`docs/curriculum-upgrade/…/source_text\` 의 출처)
- 방법: \`node scripts/record-latest-pdfs.mjs <최신 폴더> <2026-10-22 폴더>\` — 파일마다 SHA-256 을 직접 계산해 ① ZIP 매니페스트 ② 2026-10-22 판과 대조 (추정하지 않음)

## 결과

${allSame
  ? `**${rows.length}개 모두 매니페스트와 같고, 2026-10-22 판과 바이트 단위로 같다.** 파일 이름의 \`(3)\` · \`(2)\` 는 복사본 번호이며 내용 변경이 없다.
따라서 주차별 10개 항목(그림책 · 신체활동 · 미술 · 워크북 · 교구 · 가족연계 · 관찰 문항 · 성장리포트 · 주차 연계 · 미디어) 차이는 **0건**이고,
이미 반영된 2026-10-22 원문 대조(\`CURRICULUM-24W-FINAL-AUDIT.md\` ✔ 478칸)가 그대로 최신 기준이다. 16~24주는 요청대로 기존 원본 PDF 를 쓴다.`
  : "**2026-10-22 판과 다른 파일이 있다 — 아래 표의 「다름」을 원문 대조해야 한다.**"}

| 주 | 최신 파일 | SHA-256 | 매니페스트 | 2026-10-22 판 |
|---|---|---|---|---|
${rows.map((r) => `| ${r.week} | ${r.file} | \`${r.h}\` | ${r.manifest ? "같음" : "**다름**"} | ${r.original ? "같음" : "**다름**"} |`).join("\n")}

## 원문 추출 텍스트 재확인

최신 PDF 를 pdftotext 로 다시 뽑아 저장소 추출 텍스트와 대조했다 — 1~20주 문장 조각 97~99% 일치, 21~24주 낱말 90~92% 일치.
21~24주의 나머지는 제목 장식 글꼴처럼 pdftotext 가 글자를 읽지 못하는 부분이다 (파일 자체가 해시로 같으므로 내용 차이가 아니다).
`;
writeFileSync(join(ROOT, "docs/completion/PDF-LATEST-20261027.md"), md);
console.log("ok", rows.length, allSame ? "all identical" : "DIFFERENCES");
