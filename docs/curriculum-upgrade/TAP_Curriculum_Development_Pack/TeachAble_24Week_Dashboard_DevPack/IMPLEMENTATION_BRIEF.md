# IMPLEMENTATION BRIEF — TeachAble Art Play 24주 교사용 수업 대시보드

## 0. 작업 원칙
- 프로젝트: `D:\소예키즈\tap3-public-experience`, repo `SOYESKIDS/teachable-art-play-experience`.
- 최신 보고 개발 브랜치: `exp/e4-e5-consult-share-20261022`; 작업 시 `git status`, `git fetch`, remote SHA 확인. **실제 현재 HEAD가 다르면 보고**.
- Production, main, 운영 SaaS, 영업 사이트 **변경 금지**. Preview만.
- 현재 1~8주 표지 WebP 유지, 9~24주 SVG 유지. 잘못된 9~16주 PNG 8개 복원 금지.
- 35분 기본 5단계 및 선택 확장활동, E-4 상담/E-5 공유 기능, 정적 보안 경계 유지.
- 원본 PDF 내용과 신규 교육적 보완은 필드 수준에서 분리하여 출처 표기.

## 1. 새로운 입력의 역할
- 사용자가 1~20주차 대시보드 PDF 제공. 본 패키지 JSON `weeks[].sourcePages`에 원문 전체 저장.
- 이 PDF에 있는 것은 `WK 주간 개요`, `LS 수업 진행 가이드`, `MD 미디어 라이브러리`, `PR 준비·물류`, `FM 가정 연계`, `RP 성장 리포트`, `OB 관찰 기록 입력`, `CW 연계 산출물` 등의 **콘텐츠 분류**다. 공개 체험에는 **읽기 전용 교사 지원 패널**로 변환한다.
- **21~24주차 원본 미첨부.** 기존 주차 데이터/교사용 가이드 참조하되 20개 문서 기반으로 내용 조작 금지. 완료 상태는 `awaiting_source`로 표시.

## 2. 각 주차의 데이터 스키마 권장
별도 파일에 타입을 추가하되 기존 `week-index.ts`, `official-plan.ts`, `demo-lessons.ts`의 내용과 소스 연결을 훼손하지 않는다.

```ts
type EditorialStatus = 'source_pdf' | 'editorial_proposal' | 'needs_review' | 'awaiting_source';
type MediaAsset = { slotId: string; label: string; url?: string; status: 'missing' | 'licensed' | 'needs_license_review' };
type TeacherActivity = {
  title: string;
  steps: { title: string; guide: string; teacherQuestion?: string; minutes?: number }[];
  materials: string[];
  safetyNotes: string[];
  sourcePages: number[];
  status: EditorialStatus;
};
type WeekDashboard = {
  weekNo: number;
  displayTitle: string;
  sourceTitle?: string;
  originalSourceFile?: string;
  growthKeyword?: string;
  curriculum: { officialDurationLabel?: string; coreMinutes: number; optionalActivities: string[] };
  storybook: { title?: string; summary?: string; ebookStatus: 'confirmed' | 'unknown' | 'missing' };
  physical: TeacherActivity[];
  art: TeacherActivity[];
  workbook: { title: string; detail: string; image?: MediaAsset }[];
  kits: { name: string; items: string[]; sourceStatus: EditorialStatus }[];
  family: { title?: string; instructions: string[]; status: EditorialStatus };
  nuri: { area: string; description: string }[];
  media: { title?: string; kind: 'audio' | 'video' | 'ebook'; asset?: MediaAsset }[];
  observations: { prompt: string; status: EditorialStatus }[];
  parentNotice: { text: string; status: EditorialStatus }[];
  sourceStatus: EditorialStatus;
  conflicts: string[];
};
```

## 3. 교사용 대시보드 UI — 기존 디자인 유지
**주차 개요 → 교사 준비 → 기본 35분 진행 → 확장활동 → 워크북/교구 → 가정연계 → 관찰 안내**로 읽기 쉬운 7개 섹션 구현.
- 24주 목록/주차 상세/교실 플레이어 기존 레이아웃·컬러·카드 스타일·상담 및 공유 CTA 유지.
- 교사 화면에서 기본 단계당 **선생님이 실제로 말할 한 문장, 해야 할 행동, 예상 시간, 안전, 준비물**을 빠르게 찾도록 수정.
- 큰 수업 화면에는 아이 대상 한 줄 문장만, 교사 패널에는 상세 설명. 공유·상담 연결 불변.
- `수업 시작 전 체크리스트`, `35분 시간바`, `확장활동 접힘`, `관찰 예시(실제 학생 입력 불가)`, `가정 안내 문구 복사` 추가 검토.
- PDF 속 이미지 자리표시는 **이미지 없음/준비 중** 상태로 보여 주되 가짜 이미지·실제 제공이 확인되지 않은 영상·음원 자동 생성 금지.
- 이미지 권리 확인 안 된 에셋 public 추가하지 말 것.

## 4. 주차별 핵심 대조 포인트
- 1 유치원 탐험/이름표; 2 도전 미션/메달; 3 마음배달/팔찌;
- 4 PDF 대시보드 제목 `씨앗과 새싹`, 그림책 `소예의 씨앗`; 현행 사이트 `소예의 씨앗`;
- 5 꽃놀이/나만의 꽃; 6 비·햇살 놀이/비밀기지; 7 나비·벌 놀이/데칼코마니;
- 8 PDF `우리가 만드는 숲`, 그림책 `모이면 숲이 되는 우리`;
- 9 봄바람 스카프/꽃다발; 10 곤충 탐색/곤충 자석(원안 미표기 선택안);
- 11 훌라 역할놀이/꽃목걸이; 12 가을 감각상자/허수아비;
- 13 강강술래/복주머니; 14 PDF `온 세상은 하얀 도화지` 눈놀이 ↔ 사이트 `말하지 않아도 괜찮아!`;
- 15 마음배지/온기벨; 16 사계절 회고/영상편지;
- 17 PDF `첨벙첨벙 안전하게!` ↔ 사이트 `짝! 우리들의 색`;
- 18 PDF `색이 섞이면 무슨 색?` ↔ 사이트 `반짝이는 물길 놀이터`;
- 19 PDF `리듬탐험대, 출발!` ↔ 사이트 `숲 속 작은 연주회`;
- 20 PDF `복을 전해요` ↔ 사이트 `주렁주렁 신나는 하루`.
- 21~24 이번 원본 없음; 기존 사이트 보존하고 `awaiting_source`로 관리.
- 17~20 문서에는 PART 3 `두근두근 세계여행`, 기존 공개 사이트는 `세계의 축제(가칭)`. 명칭 변경은 승인 전 보류.

## 5. 교육 품질 보강(제안, 공식 원본과 분리)
- 모든 차시에 관찰 가능한 행동 중심 수업 목표 1~2개와 교사 발문 2~4개 제안.
- 준비물 분류: 회사 제공 확정/제안/기관 보유/소모품/가정 준비. 출처에서 `없음`인데 키트 제안 섹션이 있으면 모순 플래그 작성.
- 아이의 정답·순위·진단 금지. 전환 말, 어려워하는 아이 대체 참여 방식, 감각 민감도/이동 안전을 교사용 주의로 별도 추가.
- 4주 씨앗·마라카스는 작은 씨앗/부품 안전, 6주 신체 접촉은 선택권, 10주 실제 곤충 무리한 채집 금지, 14주 감각 재료 피부 주의, 16주 가족영상은 공개 저장·업로드 금지, 17주 실제 물 사용 없는 역할놀이, 19주 풍선 부품 및 큰 소리 주의.
- 20주 문화 비교는 국가 전체를 하나의 정형화된 인사로 대표하지 않도록 편집 검수.
- 워크북 3~4장 전체를 기본 35분에 넣지 말고 선택 확장활동으로 분리.

## 6. 검증
- 24개 주차 존재, 1~20 PDF 원문 연결, 21~24 `awaiting_source` 분명.
- 35분(5+7+13+7+3) 및 원본 시간 출처 분리; 단축 활동의 실제 교사 시연 검토.
- PDF의 미작성 데이터는 `needs_review`, 없는 이미지/영상/음원은 `missing`; 동작하는 척하는 버튼 금지.
- 모바일 360/390, 태블릿 768, 데스크톱 1440 및 전자칠판; 교사/교실/나란히; 접근성 및 키보드 이동.
- 이미지 1~8 최신 WebP와 9~24 SVG 유지, ZIP 및 원본 이미지 공개 없음.
- `npm test`, tsc, lint, build, 브라우저 24/24, 기존 보안 테스트 통과.
- 원장·유치원 교사 1~2명 리허설에서 시간을 재고 모호한 발문 수정한 기록 작성.
- Production, main, 기존 SaaS, 홍보 사이트 변경 금지.

## 7. 개발 산출물
- `docs/curriculum/SOURCE-REGISTER-01-24.md`와 출처 차이표
- `docs/curriculum/WEEKLY-PROGRAM-REVIEW.md` 및 교사용 시연 매뉴얼
- 새 데이터 모듈(가급적 `src/data/experience/teacher-dashboard/`)
- 읽기 전용 교사 대시보드와 24주별 상세 페이지 연동
- 테스트 및 Preview URL
- `21~24주 PDF 누락`, `주제 충돌`, `사용권 미확인`을 미해결로 보고

## 8. 배포
별도 개발 브랜치/Preview에서 끝내고 Production은 명시적 승인 후. 17~20 주제 대체는 신구 콘텐츠 비교 보고 후 별도 승인 필요.
