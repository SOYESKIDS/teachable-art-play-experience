// PDF ↔ 웹 화면 대조 — 주차 PDF 원문 줄이 실제로 만들어진 화면(HTML)에 있는가
//   npm run build && node --import ./tests/register-hooks.mjs scripts/check-pdf-coverage.mjs   → docs/completion/PDF-WEB-COVERAGE.md
// ★ 데이터 파일이 아니라 out/ 의 HTML 글자(스크립트 · 태그 제외)와 비교한다 — 화면에 실제로 보이는지 본다.
//   대상 화면: 주차 상세(교사 대시보드 12개 영역) + 상세 수업 지도안(/guide).
// ★ 줄 판정: ① 문장 그대로 있음 ② (layout 추출본은 단이 섞인다) 낱말 85% 이상 있음 ③ 영역 이름 · 칸 이름(라벨)
//   ④ 화면에 싣지 않는 칸(테마 색상 · 이미지 크기 표기 등) — 이유를 적는다 ⑤ 없음 → 실패
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { sections, sourcePath } from "./pdf-sections.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { EDITED_LINES } = await import(pathToFileURL(join(ROOT, "src/data/experience/teacher-dashboard/week-dashboards.ts")).href);
const sq = (s) => (s ?? "").normalize("NFC").replace(/[\s?.!,·ˮʼ”“"'‘’()~\-–:;/「」『』…《》#○]/g, "");
const htmlText = (f) =>
  readFileSync(f, "utf8")
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, " ");

// 영역 이름 · 칸 이름 — 화면은 같은 뜻의 제목으로 나눠 보인다
const LABELS = /^(주차 기본 정보|데이터 출처|만드는 순서|기관 준비물|활동 방법 · 미션|활동 방법|이렇게 이야기해 보세요|동화책 음원 \(\d ?곡\)|캐릭터 뮤직비디오|영상 URL|구성품|활용 방법|예시|준비물|핵심 경험|활동 목표|교사 운영 포인트|사용 안내서|E-?BOOK 제공( 여부)?|미술·교구 통합활동|미술활동 \(선택 · 원안 미표기\)|((의사소통|사회관계|예술경험|자연탐구|신체운동 ?· ?건강) ?(주영역|연계영역)? ?)+)$/;
// 칸 이름이 앞에 붙은 줄 — 화면은 같은 뜻의 다른 이름으로 보인다 (예: 「계절 · 방문지」 → 「계절 · 장소」)
const PREFIX = /^(계절 · 방문지|핵심 메시지|핵심주제|성장키워드|파트|대상연령|수업시간|데이터 출처|교사가 기억할 핵심|주제 요소 \(원안\)|제작 교구|활동 TIP|TIP|안내|활용|핵심 경험|E-?BOOK 제공 여부)\s+/;
const NOT_SHOWN = [
  [/^테마 색상/, "테마 색상 값 — 화면 색으로 쓴다"],
  [/^예시 문장 미작성/, "원문 「미작성」 표시 — 화면은 「자료 원문에 미작성으로 적혀 있습니다」로 보인다"],
  [/^검수 메모/, "자료 작성자의 검수 메모 (이미지 판 비교) — 수업 내용이 아니다"],
  [/복\(福\)글달/, "PDF 추출 글자 깨짐 — 화면은 검수한 제목 「복을 담은 복주머니」와 「검수 필요」 표시"],
  [/^키즈보드 메뉴/, "키즈보드 메뉴 구성 — 운영 SaaS 화면 구성이라 공개 체험에 싣지 않는다"],
  [/\d+ ?· ?\d+ ?px|A4 세로|썸네일/, "그림 자리 크기 표기 — 그림 자리는 「자료 준비 중」으로 보인다"],
];

// 14 · 17~24주 — 2026-10-29 승인 제목이 공식 교사용 수업가이드의 수업이라 화면은 가이드의 공개 요약을 쓴다
// (가이드 원문 전사본은 비공개 — 공개 저장소에 없다). 그 주차의 자료 PDF 줄은 「보관(다른 주제)」으로 세고,
// 대신 공개 요약 문장이 화면에 있는지 본다.
const { GUIDE_SUMMARIES } = await import(pathToFileURL(join(ROOT, "src/data/experience/teacher-dashboard/guide-summaries.ts")).href);
const GUIDE = Object.fromEntries(GUIDE_SUMMARIES.map((s) => [s.weekNo, s]));
const strings = (v) => (typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === "object" ? Object.values(v).flatMap(strings) : []);
const guideRows = [];
const rows = [];
const missing = [];
for (let n = 1; n <= 24; n++) {
  const web = sq(htmlText(join(ROOT, `out/experience/weeks/${n}.html`)) + htmlText(join(ROOT, `out/experience/weeks/${n}/guide.html`)));
  if (GUIDE[n]) {
    const g = { n, total: 0, whole: 0, missing: 0 };
    for (const t of [...new Set(strings(GUIDE[n]))]) {
      if (!/[가-힣]/.test(t) || sq(t).length < 3) continue;
      g.total++;
      if (web.includes(sq(t))) { g.whole++; continue; }
      g.missing++;
      missing.push({ n, area: "공식 가이드", line: t, hit: "-" });
    }
    guideRows.push(g);
  }
  const s = sections(readFileSync(sourcePath(ROOT, n), "utf8"), n > 20);
  const r = { n, total: 0, whole: 0, words: 0, label: 0, edited: 0, notShown: 0, archived: 0, missing: 0 };
  for (const [area, lines] of Object.entries(s)) {
    for (const raw of lines) {
      const l = raw.replace(/^\d+[.)]?\s+/, "").trim();
      if (!/[가-힣]/.test(l) || sq(l).length < 3) continue;
      r.total++;
      if (GUIDE[n]) { r.archived++; continue; }
      if (web.includes(sq(l)) || web.includes(sq(l.replace(PREFIX, "")))) { r.whole++; continue; }
      if (EDITED_LINES.some((e) => e.weekNo === n && sq(e.original) === sq(l))) { r.edited++; continue; }
      if (LABELS.test(l) || LABELS.test(l.replace(/\s*\S+\[\d*\]$/, ""))) { r.label++; continue; }
      const why = NOT_SHOWN.find(([re]) => re.test(l));
      if (why) { r.notShown++; continue; }
      const ws = l.replace(PREFIX, "").split(/\s+/).map(sq).filter((w) => w.length >= 2 && !/^\d+$/.test(w));
      const hit = ws.filter((w) => web.includes(w)).length;
      if (ws.length && hit / ws.length >= 0.85) {
        r.words++;
        if (process.argv.includes("--words")) console.log(`words\t${n}\t${area}\t${hit}/${ws.length}\t${l}`);
        continue;
      }
      r.missing++;
      missing.push({ n, area, line: l, hit: `${hit}/${ws.length}` });
    }
  }
  rows.push(r);
}

const sum = (k) => rows.reduce((a, r) => a + r[k], 0);
const md = `# PDF ↔ 웹 화면 대조 (2026-10-27)

- 만든 방법: \`npm run build && node scripts/check-pdf-coverage.mjs\` — 저장소 원문 추출 텍스트(24개 PDF)의 줄마다, 만들어진 HTML(주차 상세 + 상세 수업 지도안)의 **보이는 글자**에서 찾는다 (스크립트 · 태그 제외).
- 원문 PDF: 2026-10-27 받은 24주 묶음 = 2026-10-22 판과 SHA-256 동일 (\`PDF-LATEST-20261027.md\`).
- 판정: 문장 그대로 · 낱말 85% 이상 (1~20주 추출본은 두세 단이 한 줄로 섞여 문장 그대로 찾을 수 없는 줄이 있다) · 칸 이름 · 고쳐 쓴 원문 · 화면에 싣지 않는 칸 (이유 표시) · **없음**

## 결과 — 확인한 줄 ${sum("total")}개 · 없음 **${sum("missing")}개**

| 주 | 줄 | 문장 그대로 | 낱말 85%+ | 칸 이름 | 고쳐 쓴 원문 | 싣지 않는 칸 | 보관 (공식 가이드 주차) | 없음 |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${rows.map((r) => `| ${r.n} | ${r.total} | ${r.whole} | ${r.words} | ${r.label} | ${r.edited} | ${r.notShown} | ${r.archived} | ${r.missing ? `**${r.missing}**` : 0} |`).join("\n")}
| 합계 | ${sum("total")} | ${sum("whole")} | ${sum("words")} | ${sum("label")} | ${sum("edited")} | ${sum("notShown")} | ${sum("archived")} | ${sum("missing")} |

## 공식 교사용 수업가이드 공개 요약 ↔ 웹 화면 (14 · 17~24주, 2026-10-29)

승인 제목이 공식 가이드의 수업이라 이 주차는 가이드의 **공개 요약**(\`src/data/experience/teacher-dashboard/guide-summaries.ts\`)이 원문이다. 가이드 원문 전체는 회사 지식재산이라 공개 저장소에 없다. 같은 주차 자료 PDF 줄은 위 표의 「보관」이다 (다른 주제 · 화면에 쓰지 않음).
공개 요약 문장(한글이 있는 모든 문자열)이 주차 상세 · 상세 수업 지도안 화면에 그대로 있는지 본다.

| 주 | 요약 문장 | 화면에 그대로 | 없음 |
|---:|---:|---:|---:|
${guideRows.map((g) => `| ${g.n} | ${g.total} | ${g.whole} | ${g.missing ? `**${g.missing}**` : 0} |`).join("\n")}
| 합계 | ${guideRows.reduce((a, g) => a + g.total, 0)} | ${guideRows.reduce((a, g) => a + g.whole, 0)} | ${guideRows.reduce((a, g) => a + g.missing, 0)} |

## 고쳐 쓴 원문 (화면은 고친 문장 + 「편집」 표시 + 원문 · 까닭)

${EDITED_LINES.map((e) => `- ${e.weekNo}주 「${e.original}」 → 「${e.text}」 — ${e.reason}`).join("\n")}

## 화면에 싣지 않는 칸

${NOT_SHOWN.map(([re, why]) => `- \`${re.source}\` — ${why}`).join("\n")}

## 없음 (화면에서 찾지 못한 원문 줄)

${missing.length ? missing.map((m) => `- ${m.n}주 · ${m.area} · ${m.line.replace(/\|/g, "/")} (낱말 ${m.hit})`).join("\n") : "없음 — 24주 모든 원문 줄이 화면에 있다."}
`;
writeFileSync(join(ROOT, "docs/completion/PDF-WEB-COVERAGE.md"), md);
console.log("lines", sum("total"), "missing", sum("missing"));
if (process.argv.includes("--list")) for (const m of missing) console.log(`${m.n}\t${m.area}\t${m.hit}\t${m.line}`);
process.exitCode = missing.length ? 1 : 0;
