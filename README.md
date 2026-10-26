# TeachAble Art Play — 2026 공개 체험 사이트

유치원 원장님 · 선생님이 **로그인 없이** 24주 통합예술 수업을 둘러보고 교실 플레이어로 직접 체험하는 정적 사이트입니다.

- 운영 SaaS(교사 · 원장 · 관리자 · 학부모 공유)와 **완전히 분리된 저장소 · 배포**입니다.
- DB · 로그인 · 서버 API · 문의 저장 폼이 없습니다. `next build` 결과는 `out/` 의 정적 파일뿐입니다 (`output: "export"`).
- 수업 플레이어 진행 상태는 그 브라우저 탭의 `sessionStorage` 에만 잠시 남습니다.

## 경로

| 경로 | 내용 |
|---|---|
| `/` | 홈 — 24주 모험 길 · PART 1~3 · 수업 흐름 · 체험 · 성장 리포트 예시 · 도입 안내 · 문의 |
| `/experience` | 체험 안내 |
| `/experience/weeks` | 24주 수업 지도 |
| `/experience/weeks/1` ~ `/24` | 주차 안내 (24개) |
| `/experience/classroom/1` ~ `/24` | 5단계 교실 플레이어 (24개) |
| `/experience/report` | 가상 성장 리포트 |

## 콘텐츠 상태

- 주차 제목 · 그림책 · PART · 성장 키워드 · 대표 활동은 **주차별 대시보드 자료 PDF 24개 기준**입니다 (`src/lib/weeks/week-index.ts`, 2026-10-26 동기화).
  9~24주 자료는 초안이라 화면에 「개편 후보 · 검수 전」을 표시합니다. 동기화 기록: `docs/curriculum/PDF-SYNC-2026-10-26.md`.
- 수업 시간은 **기본 수업 35분(5 + 7 + 13 + 7 + 3)** 하나이며 `src/lib/weeks/lesson-time.ts` 한 곳에서만 정합니다. 원본 표기(CORE 45분 · 이전 가이드 50~70분)는 출처 기록으로만 보입니다.
- 활동 · 발문 · 준비물은 근거 자료를 바탕으로 한 **체험용 구성(adapted) · 정식 교안 확정 전**이며 화면에 그렇게 표시합니다.
- 교사 대시보드의 관찰 문항 · 목표는 「공식 원문 / 교사용 제안 / 검수 필요」 배지로 출처를 구분합니다.
- 원아 · 기록은 모두 가상입니다.

## 그림 · 글꼴

- 그림은 자체 제작 SVG(`HeroScene` · `WeekArt` · `Motif` · `Stickers` · `Doodles` · `MotifScatter`)입니다. 캐릭터 파일은 없습니다.
- 1~8주 그림책 표지(`public/images/week-covers-web`)는 **사용권 확인 전이라 싣지 않습니다** — `media.ts` `LICENSE_STATUS`, 빌드 뒤 `postbuild` 가 배포본에서 뺍니다.
- 글꼴: Pretendard · Jua 의 사용 글자 서브셋(SIL OFL 1.1, 이름 변경 `TAP Play Sans` · `TAP Play Display`). 라이선스: `src/fonts/play/OFL-*.txt`.
  문구를 바꾸면 `python scripts/subset-play-fonts.py <Jua-Regular.ttf> <PretendardVariable.woff2>` 로 다시 만듭니다 (`tests/play-fonts.test.mjs` 가 검사).
  Jua 원본이 없으면 `-` 를 넘겨 본문 글꼴만 다시 만듭니다. 제목 글꼴에 없는 글자를 쓰는 제목은 문장 전체를 본문 글꼴로 그립니다 (`display-font.ts`).

## 문의 동선

전화 02-303-4420 · 이메일 soyes2013@gmail.com · 서비스 소개 사이트 https://teachable-art-play-sales.vercel.app/ — 사이트는 아무 정보도 받지 않습니다.

## 개발 · 검증

```bash
npm ci
npx tsc --noEmit
npm run lint
npm test        # 콘텐츠 규칙 · 글꼴 · 보안 경계(의존성 · 정적 export · 금지 코드 · 비밀값 · public 파일)
npm run build   # out/ 생성 (postbuild: 사용권 미확인 표지 제외)
node scripts/serve-out.mjs 3131                 # out/ 을 vercel.json 헤더(CSP)와 함께 로컬에서
node scripts/qa-public.mjs http://localhost:3131 # 6개 폭 · 24주 · 플레이어 · 주제 일치 · CSP 위반 브라우저 검사
```

배포: Vercel 프로젝트 `teachable-art-play-experience` (환경변수 없음 · 보안 헤더와 CSP 는 `vercel.json`).
