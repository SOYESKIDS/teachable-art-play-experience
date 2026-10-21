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

- 주차명 · PART · 성장 키워드 · 수업 시간은 공식 지도 값(`src/lib/weeks/week-index.ts`)을 그대로 씁니다.
- 활동 · 발문 · 준비물은 공식 가이드를 바탕으로 한 **체험용 구성(adapted) · 정식 교안 확정 전**이며 화면에 그렇게 표시합니다.
- 원아 · 기록은 모두 가상입니다.

## 그림 · 글꼴

- 그림은 모두 자체 제작 SVG(`HeroScene` · `WeekArt` · `Motif` · `Stickers` · `Doodles` · `MotifScatter`)입니다. 사진 · 캐릭터 파일은 없습니다 (`public/` 에는 회사 로고만).
- 글꼴: Pretendard · Jua 의 사용 글자 서브셋(SIL OFL 1.1, 이름 변경 `TAP Play Sans` · `TAP Play Display`). 라이선스: `src/fonts/play/OFL-*.txt`.
  문구를 바꾸면 `python scripts/subset-play-fonts.py <Jua-Regular.ttf> <PretendardVariable.woff2>` 로 다시 만듭니다 (`tests/play-fonts.test.mjs` 가 검사).

## 문의 동선

전화 02-303-4420 · 이메일 soyes2013@gmail.com · 서비스 소개 사이트 https://teachable-art-play-sales.vercel.app/ — 사이트는 아무 정보도 받지 않습니다.

## 개발 · 검증

```bash
npm ci
npx tsc --noEmit
npm run lint
npm test        # 콘텐츠 규칙 · 글꼴 · 보안 경계(의존성 · 정적 export · 금지 코드 · 비밀값 · public 파일)
npm run build   # out/ 생성
```

배포: Vercel 프로젝트 `teachable-art-play-experience` (환경변수 없음).
