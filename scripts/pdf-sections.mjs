// 주차 PDF 추출 텍스트 → 영역별 항목 (원문 그대로 · 정리만)
// scripts/extract-week-pdf-extra.mjs · scripts/check-pdf-coverage.mjs 가 쓴다.
// 두 형식: 1~20주 (layout · 오른쪽 그림 자리 섞임), 21~24주 (낱말 사이 두 칸 · 문장부호 앞 한 칸)
import { readFileSync } from "node:fs";
import { join } from "node:path";

export function sourcePath(root, n) {
  return n <= 20
    ? join(root, `docs/curriculum-upgrade/TAP_Curriculum_Development_Pack/TeachAble_24Week_Dashboard_DevPack/source_text/week-${String(n).padStart(2, "0")}.txt`)
    : join(root, `docs/curriculum-upgrade/dashboard-source-21-24/week-${n}.txt`);
}

const NAV = /(WK 주간 개요|LS 수업 진행 가이드|MD 미디어 라이브러리|CW 주차 연계 산출물|PR 준비 · 물류|PR 준비·물류|FM 가정 연계 \(키즈보드\)|OB 관찰 기록 입력|RP 성장 리포트)/g;
const KEYS = /\s(meta|storybook|physical|workbook|kit|family|media|teacherPoint|crossWeek|kidsnoteExample|parentNotice\[\]|materials\[\]|observation\[\]|goals\[\]|support\[\d\][^\n]*|art)\s*$/;

function normalizeLine(raw, spaced) {
  // 사용자 정의 영역 글자 — PDF 의 동그라미 번호 · 아이콘 글꼴
  let s = raw.replace(/\uFEFF/g, "").replace(/[\uE000-\uF8FF]/g, "");
  if (spaced) {
    s = s.replace(/ {2,}/g, "\u0001").replace(/ (?=[.,!?)」』”’ʼ:])/g, "").replace(/(?<=[(「『“‘]) /g, "").replace(/\u0001/g, " ");
  }
  s = s.replace(/w\d+\.[A-Za-z0-9_.]+/g, " ");
  s = s.replace(/＋\s*[^\s].*$/, "");          // 그림 자리 문구 (그 뒤는 오른쪽 단 잡음)
  s = s.replace(/\d+:?\d+ · [^\n]*?(px|썸네일|권장|PNG)[^\n]*/g, " ");
  s = s.replace(NAV, " ").replace(KEYS, " ").replace(/\s[a-zA-Z]+\[\d*\]/g, " ");
  // layout: 왼쪽 단 내용 뒤 긴 공백 + 오른쪽 단 잡음
  if (!spaced) s = s.replace(/\s{6,}\S.*$/, (m) => (/[가-힣]/.test(m) && m.trim().length > 25 ? m : ""));
  s = s.replace(/^[\s-•·▪◦\-]+/, "").replace(/\s+/g, " ").trim();
  // 추출기가 따옴표를 ʼ(U+02BC) · ˮ(U+02EE) 로 낸 곳 — 화면용 따옴표로 (앞뒤 공백 정리)
  s = s.replace(/\s?ʼ\s?(?=[가-힣])/g, "’").replace(/ʼ/g, "’").replace(/\s?ˮ/g, "”");
  return s;
}

const HEAD = [
  ["storybook", /^그림책$/],
  ["physical", /^대표활동$/],
  ["art", /^미술활동$/],
  ["workbook", /^워크북 \(\d ?장\)$/],
  ["kit", /^교구 \/ 놀이 자료 키트$/],
  ["family", /^가족연계 활동$/],
  ["homeKit", /^가정용 교구$/],
  ["nuri", /^누리과정 연계$/],
  ["media", /^동화책 음원 · 캐릭터 뮤직비디오$/],
  ["teacherPoint", /^교사 운영 포인트$/],
  ["observe", /^관찰 포인트/],
  ["kidsnote", /^키즈노트 성장기록 예시$/],
  ["parent", /^부모님께 드리는 안내/],
  ["cross", /^주차 연계$/],
];

export function sections(text, spaced) {
  const out = { meta: [] };
  let cur = "meta";
  for (const raw of text.split(/\r?\n/)) {
    if (/=== PDF PAGE/.test(raw)) continue;
    const line = normalizeLine(raw, spaced);
    if (!line) continue;
    const h = HEAD.find(([, re]) => re.test(line));
    if (h) { cur = h[0]; out[cur] ??= []; const rest = line.replace(h[1], "").trim(); if (rest) out[cur].push(rest); continue; }
    (out[cur] ??= []).push(line);
  }
  return out;
}

const after = (lines, label, stop) => {
  const i = lines.findIndex((l) => l === label || l.startsWith(`${label} `));
  if (i < 0) return [];
  const first = lines[i].slice(label.length).trim();
  const rest = [];
  for (const l of lines.slice(i + 1)) { if (stop.some((s) => l === s || l.startsWith(`${s} `) || l.startsWith(s))) break; rest.push(l); }
  return [...(first ? [first] : []), ...rest];
};
// 한 줄 칸 — 문장이 끝나지 않았으면 다음 줄(라벨 · 목록 번호가 아닌 줄)을 이어 붙인다
const LABEL = /^(교사가 기억할 핵심|데이터 출처|수업시간|대상연령|테마 색상|제작 교구|계절 · 방문지|핵심주제|파트|성장키워드|키즈보드 메뉴|활용 방법|예시|TIP|안내|활용|구성품|기관 준비물|활동 방법|이렇게 이야기해 보세요|활동 TIP|핵심 경험|준비물|만드는 순서|사용 안내서|\d+\.\s)/;
const lineStarting = (lines, label) => {
  const i = lines.findIndex((l) => l.startsWith(`${label} `));
  if (i < 0) return null;
  let t = lines[i].slice(label.length).trim();
  for (let j = i + 1; j < lines.length && !/[.!?)」”’]$/.test(t); j++) {
    if (LABEL.test(lines[j])) break;
    t = `${t} ${lines[j]}`;
  }
  return t;
};

/** 이번에 새로 필요한 칸만 */
export function extraFields(root, n) {
  const spaced = n > 20;
  const s = sections(readFileSync(sourcePath(root, n), "utf8"), spaced);
  const meta = s.meta ?? [];
  const art = s.art ?? [];
  const kit = s.kit ?? [];
  const fam = s.family ?? [];
  const home = s.homeKit ?? [];
  const media = s.media ?? [];
  const sb = s.storybook ?? [];
  // 이전 양식(1~8주 · 10 · 16주)은 미술이 대표활동 칸 안의 「미술·교구 통합활동」 · 「미술활동 (선택 …)」 묶음이다
  const ART_MARK = /^(미술·교구 통합활동|미술활동 \(선택)/;
  const holder = [s.physical ?? [], sb].find((sec) => sec.some((l) => ART_MARK.test(l))) ?? [];
  const artSrc = art.length ? art : holder.slice(holder.findIndex((l) => ART_MARK.test(l)));
  const kitNotice = kit.find((l) => /제작 교구는 없어요|제작 교구예요|제작 교구입니다/.test(l)) ?? null;
  const kitHead = [];
  for (const l of kit) {
    if (l === kitNotice) continue;
    if (/^(구성품|기관 준비물|활동 방법|활용)( |$)/.test(l)) break;
    kitHead.push(l);
  }
  return {
    seasonPlace: lineStarting(meta, "계절 · 방문지"),
    topicElements: lineStarting(meta, "주제 요소 (원안)"),
    makesKit: lineStarting(meta, "제작 교구"),
    ebook: [...sb, ...meta].find((l) => /E-?BOOK 제공 여부/.test(l))?.replace(/^.*E-?BOOK 제공 여부\s*/, "").split(" ")[0] || null,
    artUse: after(artSrc, "활용 방법", ["예시", "TIP"]),
    artExamples: after(artSrc, "예시", ["TIP"]).map((x) => x.replace(/^\s+/, "")),
    artTip: lineStarting(artSrc, "TIP"),
    kitName: kitHead[0] ?? null,
    kitLead: kitHead.slice(1),
    kitNotice,
    familyLead: fam.length > 1 && !LABEL.test(fam[1]) && fam[1] !== "활동 방법" ? fam[1] : null,
    kitMissions: after(kit, "활동 방법 · 미션", ["활용"]),
    kitUse: lineStarting(kit, "활용"),
    familyNote: lineStarting(fam, "안내"),
    familyTip: lineStarting(fam, "TIP"),
    homeKitNote: lineStarting(home, "안내"),
    videoDesc: after(media, "캐릭터 뮤직비디오", ["영상 URL"])[0] ?? null,
    videoUrl: after(media, "영상 URL", ["교사 운영 포인트"])[0] ?? null,
    _sections: s,
  };
}
