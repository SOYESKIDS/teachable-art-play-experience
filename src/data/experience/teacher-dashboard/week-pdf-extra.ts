import { EDITED_LINES, isOfficialGuideWeek } from "./week-dashboards";

/**
 * 주차 PDF 추가 칸 — scripts/extract-week-pdf-extra.mjs 가 저장소 원문 추출 텍스트에서 만든다 (손으로 고치지 않는다).
 *
 * ★ 모두 PDF 원문이다. 값이 없으면 그 주차 PDF 에 그 칸이 없다 (1~8주는 미술 활용 · TIP 칸이 없는 이전 양식).
 * ★ 화면은 pdfExtraOf() 로 읽는다 — week-dashboards 의 EDITED_LINES(고쳐 쓴 문장)를 그대로 적용한다. WEEK_PDF_EXTRA 는 원문 그대로다.
 * ★ videoUrl 은 실제 주소일 때만 채운다. PDF 에 「개발 시 입력」처럼 적힌 것은 videoUrlNote 로 두고 화면은 「영상 준비 중」이다.
 */

export interface WeekPdfExtra {
  weekNo: number;
  /** 계절 · 방문지 */
  seasonPlace: string | null;
  /** 주제 요소 (원안) */
  topicElements: string | null;
  /** 제작 교구 (기본 정보 칸) */
  makesKit: string | null;
  /** E-BOOK 제공 여부 */
  ebook: string | null;
  /** 미술 — 활용 방법 */
  artUse: readonly string[];
  /** 미술 — 예시 (문구 · 작품 예) */
  artExamples: readonly string[];
  artTip: string | null;
  /** 교구 키트 이름 · 소개 문장 */
  kitName: string | null;
  kitLead: readonly string[];
  /** 교구 칸 첫 안내 (제작 교구 여부) */
  kitNotice: string | null;
  /** 교구 — 활동 방법 · 미션 */
  kitMissions: readonly string[];
  /** 교구 — 활용 */
  kitUse: string | null;
  /** 가족연계 소개 문장 (제목 아래 한 줄) */
  familyLead: string | null;
  familyNote: string | null;
  familyTip: string | null;
  homeKitNote: string | null;
  videoDesc: string | null;
  videoUrl: string | null;
  videoUrlNote: string | null;
}

export const WEEK_PDF_EXTRA: readonly WeekPdfExtra[] = [
  {
    "weekNo": 1,
    "seasonPlace": null,
    "topicElements": null,
    "makesKit": null,
    "ebook": null,
    "artUse": [],
    "artExamples": [
      "완성 예시: 지유",
      "캐릭터 예시: 소예, 북극이, 푸푸, 마루"
    ],
    "artTip": null,
    "kitName": "유치원 탐험 미션 카드",
    "kitLead": [
      "교실과 어린이집 곳곳의 사진을 보며 미션을 수행해요!"
    ],
    "kitNotice": "이번 주 제작 교구는 없어요. 도안·소모품과 원 보유 자료로 운영해요.",
    "familyLead": "첫 등원 날의 소중한 순간을 액자에 담아 부모님과 함께 꾸며 보내주세요!",
    "kitMissions": [
      "선생님에게 인사하기",
      "내 사물함 찾기",
      "좋아하는 놀이 찾기",
      "친구와 손잡고 이동하기"
    ],
    "kitUse": null,
    "familyNote": "아이에게 처음 유치원 가는 날의 추억을 선물해 주세요!",
    "familyTip": null,
    "homeKitNote": null,
    "videoDesc": "소예키즈 친구들과 함께 부르고 춤추며 이야기를 더 신나게 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 2,
    "seasonPlace": null,
    "topicElements": null,
    "makesKit": null,
    "ebook": null,
    "artUse": [],
    "artExamples": [
      "메달 문구: 끝까지 해낸 용감한 나!"
    ],
    "artTip": null,
    "kitName": "마루 도전 키트 (유치원·가정 활용)",
    "kitLead": [
      "여러 가지 도전 미션으로 집중력과 끈기를 길러요!"
    ],
    "kitNotice": "이번 주 제작 교구는 없어요. 도안·소모품과 원 보유 자료로 운영해요.",
    "familyLead": "일주일 동안 아이가 끝까지 해낼 미션을 정하고 함께 도전해요!",
    "kitMissions": [],
    "kitUse": "어린이집에서도 활용하고, 집으로 가져가 가족과 함께 도전해요!",
    "familyNote": null,
    "familyTip": null,
    "homeKitNote": "응원 메시지 예: 사랑하는 OO아! 끝까지 해내는 너를 응원해! 최고야!",
    "videoDesc": "마루와 친구들의 도전 이야기를 신나는 뮤직비디오로 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 3,
    "seasonPlace": null,
    "topicElements": null,
    "makesKit": null,
    "ebook": null,
    "artUse": [],
    "artExamples": [
      "고마워.",
      "친구가 되어줘서 고마워.",
      "같이 놀아서 즐거웠어.",
      "내일도 같이 놀자."
    ],
    "artTip": null,
    "kitName": "마음을 말해요 카드",
    "kitLead": [
      "표정·상황·해결방법·마음표현 카드를 활용하여 다양한 상황에서 반복적으로 놀아요!"
    ],
    "kitNotice": "이번 주 제작 교구는 없어요. 도안·소모품과 원 보유 자료로 운영해요.",
    "familyLead": "어린이집에서 받은 우체통을 집으로 가져가, 가족에게 마음을 전해요!",
    "kitMissions": [],
    "kitUse": "신체활동과 자유놀이에서도 반복 활용 가능!",
    "familyNote": "매일 마음을 전하며 가족의 사랑을 느껴봐요! (우체통 안 선물: 선생님 마음 카드 2장 · 가족 마음 카드 2장 · 선생님께 보내는 카드 1장)",
    "familyTip": null,
    "homeKitNote": "가족에게 마음을 전하는 ‘마음배달 우체통’으로 활용해요!",
    "videoDesc": "노래와 함께 소예키즈 친구들의 이야기를 만나보아요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 4,
    "seasonPlace": null,
    "topicElements": null,
    "makesKit": null,
    "ebook": null,
    "artUse": [
      "완성된 마라카스는 음악 활동에 계속 활용해요!"
    ],
    "artExamples": [],
    "artTip": null,
    "kitName": "씨앗 마라카스 · 가정연계 교구",
    "kitLead": [
      "원에서 만들어 가정으로 가져가는 가정연계 교구",
      "씨앗 탐험 키트",
      "여러 씨앗을 탐색하고 비교 관찰하며 생명의 소중함을 느껴요!"
    ],
    "kitNotice": null,
    "familyLead": "씨앗 도안과 새싹 도안에 우리 아이의 특별한 순간을 붙이고 가족의 사랑과 마음을 나눠요!",
    "kitMissions": [],
    "kitUse": "어린이집에서도 다양한 탐험 놀이로 활용해요!",
    "familyNote": "우리 가족의 시작과 사랑을 함께 이야기해요!",
    "familyTip": null,
    "homeKitNote": "아이의 특별한 순간을 담아 소중한 추억을 만들어보세요!",
    "videoDesc": "노래와 함께 소예키즈 친구들의 이야기를 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 5,
    "seasonPlace": null,
    "topicElements": null,
    "makesKit": null,
    "ebook": null,
    "artUse": [
      "교실 벽면에 전시해요.",
      "친구들과 서로의 꽃을 보며 칭찬해요!"
    ],
    "artExamples": [],
    "artTip": "스티커, 색연필, 싸인펜, 풀, 반짝이 등을 활용해요.",
    "kitName": "꽃 만들기 키트",
    "kitLead": [
      "여러 가지 재료로 나만의 꽃을 만들어요!"
    ],
    "kitNotice": "이번 주 제작 교구는 없어요. 도안·소모품과 원 보유 자료로 운영해요.",
    "familyLead": "씨앗이 자라 꽃처럼 아름답게 피어난 우리 가족을 함께 이야기 나눠요!",
    "kitMissions": [
      "자유롭게 꾸며 나만의 꽃 만들기",
      "친구의 꽃을 보며 칭찬하기",
      "완성된 꽃으로 전시 활동"
    ],
    "kitUse": null,
    "familyNote": "우리 가족의 사랑과 성장을 함께 나눠요!",
    "familyTip": null,
    "homeKitNote": null,
    "videoDesc": "노래와 함께 소예키즈 친구들의 이야기를 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 6,
    "seasonPlace": null,
    "topicElements": null,
    "makesKit": null,
    "ebook": null,
    "artUse": [],
    "artExamples": [],
    "artTip": "완성 후 실제 비밀기지에 들어가 함께 놀아요. 자유놀이 공간으로 활용해요!",
    "kitName": "비밀기지 만들기 · 유치원 활동 교구",
    "kitLead": [
      "우리들의 비밀기지 KIT"
    ],
    "kitNotice": null,
    "familyLead": "작은 씨앗이 혼자 자라지 않듯 우리도 가족의 사랑 속에서 함께 자라고 있어요.",
    "kitMissions": [],
    "kitUse": null,
    "familyNote": "보내주신 작품은 8주차 ‘우리 반 성장 숲’ 대형 현수막에 함께 붙여 최종 작품을 완성해요!",
    "familyTip": null,
    "homeKitNote": null,
    "videoDesc": "노래와 함께 소예키즈 친구들의 이야기를 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 7,
    "seasonPlace": null,
    "topicElements": null,
    "makesKit": null,
    "ebook": null,
    "artUse": [],
    "artExamples": [],
    "artTip": "다양한 색을 사용하면 더 멋진 나비가 완성돼요!",
    "kitName": "나비·벌 놀이 KIT",
    "kitLead": [],
    "kitNotice": "이번 주 제작 교구는 없어요. 도안·소모품과 원 보유 자료로 운영해요.",
    "familyLead": "우리 선생님을 떠올려보고, 선생님이 나비와 벌 중 누구를 닮았는지 이야기해요!",
    "kitMissions": [],
    "kitUse": null,
    "familyNote": "도안은 교사용 출력 자료입니다. 아이들이 보낸 내용을 바탕으로 선생님 사진을 붙여 8주차에 완성되는 우리 반 숲에 함께 전시합니다!",
    "familyTip": null,
    "homeKitNote": null,
    "videoDesc": "노래와 함께 소예키즈 친구들의 나비와 벌 이야기를 만나봐요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 8,
    "seasonPlace": null,
    "topicElements": null,
    "makesKit": "나무 펠트지 (숲 꾸미기) · 유치원 활동 교구",
    "ebook": null,
    "artUse": [],
    "artExamples": [],
    "artTip": "4~7주차 활동물 뒷면에 양면테이프 등을 미리 준비하여 아이들이 쉽게 붙일 수 있도록 해주세요.",
    "kitName": "나무 펠트지 (숲 꾸미기) · 유치원 활동 교구",
    "kitLead": [
      "안내 이미지에는 ‘대형 성장 숲 현수막’으로 표기되어 있어 확인이 필요해요",
      "우리 반 숲 완성 KIT"
    ],
    "kitNotice": null,
    "familyLead": "이번 주, 원에서 친구들과 함께 완성해가는 우리 반 숲의 모습을 영상으로 보내드려요.",
    "kitMissions": [],
    "kitUse": null,
    "familyNote": null,
    "familyTip": "원에서 보내드리는 영상을 보며 아이와 함께 이야기 나눠주세요. 아이의 경험을 듣고, 함께 즐거워해 주는 것이 가장 큰 응원이 됩니다.",
    "homeKitNote": null,
    "videoDesc": "노래와 함께 소예키즈 친구들의 숲 이야기를 만나봐요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 9,
    "seasonPlace": "봄",
    "topicElements": null,
    "makesKit": null,
    "ebook": "미정",
    "artUse": [
      "교실에 전시했다가 가정으로 보내요.",
      "소중한 사람에게 직접 전해요."
    ],
    "artExamples": [
      "“엄마, 봄이 왔어요!”",
      "“할머니 드리려고 만들었어요.”"
    ],
    "artTip": "찍을 때마다 모양이 달라요. 번진 자국도 그대로 두면 더 예뻐요.",
    "kitName": "봄 활동 자료 (별도 교구 없음)",
    "kitLead": [
      "이번 주는 제작 교구 없이 원 보유 자료와 소모품으로 운영해요."
    ],
    "kitNotice": "이번 주 제작 교구는 없어요. 도안·소모품과 원 보유 자료로 운영해요.",
    "familyLead": "아이가 만든 꽃다발을 가족에게 전하고, 그 순간의 표정을 사진으로 남겨요!",
    "kitMissions": [
      "봄바람 스카프 놀이",
      "봄바람이 불어옵니다 놀이",
      "벚꽃 꽃다발 만들기"
    ],
    "kitUse": "스카프가 없으면 얇은 보자기나 손수건으로 대체해도 돼요. 이번 주 제작 교구는 없어요.",
    "familyNote": "보내주신 사진은 교실 ‘봄 표정 사진판’에 함께 전시해요.",
    "familyTip": "잘 찍은 사진보다 웃는 순간이 더 소중해요.",
    "homeKitNote": "메시지는 아이가 말한 그대로 적어주세요.",
    "videoDesc": "노래와 함께 소예키즈 친구들의 봄 이야기를 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 10,
    "seasonPlace": "여름",
    "topicElements": null,
    "makesKit": null,
    "ebook": "미정",
    "artUse": [
      "가정연계 ‘여름 곤충 자석’과 그대로 이어져요."
    ],
    "artExamples": [],
    "artTip": "실제 색과 달라도 괜찮아요. 아이가 고른 색을 존중해주세요.",
    "kitName": "곤충채집 키트 · 유치원 활동 교구",
    "kitLead": [
      "곤충채집 키트 (유치원 활동 교구 · 확정)",
      "찾고, 관찰하고, 흉내내며 여름 곤충과 친해져요!"
    ],
    "kitNotice": null,
    "familyLead": "가정에서 곤충 자석을 꾸며 냉장고에 붙이고, 매일 곤충 이야기를 나눠요!",
    "kitMissions": [
      "곤충 찾기 미션",
      "돋보기 관찰 놀이",
      "곤충 흉내내기"
    ],
    "kitUse": "자유놀이 시간에도 반복해 활용해요.",
    "familyNote": "산책길에 만난 곤충을 사진으로 찍어 보내주셔도 좋아요.",
    "familyTip": "곤충을 무서워하는 아이에게는 사진과 모형으로 천천히 접근해 주세요.",
    "homeKitNote": "완성한 자석 사진을 보내주시면 교실에서 함께 나눠요.",
    "videoDesc": "노래와 함께 소예키즈 친구들의 여름 곤충 이야기를 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 11,
    "seasonPlace": "여행",
    "topicElements": null,
    "makesKit": null,
    "ebook": "미정",
    "artUse": [
      "신체활동 훌라댄스에 그대로 입고 참여해요.",
      "완성 후 가정으로 보내 가족에게 보여줘요."
    ],
    "artExamples": [],
    "artTip": "꽃 개수와 색 순서는 아이가 정하게 해주세요.",
    "kitName": "꽃목걸이 키트 · 가정연계 교구",
    "kitLead": [
      "알로하 여행 자료 (가정 교구 ‘꽃목걸이’ 연계)",
      "꽃목걸이는 가정연계 교구로 제작되고, 나머지는 도안·소모품으로 준비해요."
    ],
    "kitNotice": null,
    "familyLead": "집에서 여권을 완성하고, 가족과 가고 싶은 곳을 이야기해요!",
    "kitMissions": [
      "공항·탑승 역할놀이",
      "훌라댄스",
      "여행 사진 찍기"
    ],
    "kitUse": "여권과 탑승권은 자유놀이에서도 반복해 활용해요.",
    "familyNote": "보내주신 여권은 교실 ‘우리 반 공항’에 전시해요.",
    "familyTip": "실제 여행 계획이 아니어도 괜찮아요. 상상한 곳이면 충분해요.",
    "homeKitNote": "꽃목걸이는 가정연계 교구로 제작되는 품목이에요. 여권·탑승권 도안이 함께 들어가요.",
    "videoDesc": "노래와 함께 소예키즈 친구들의 여행 이야기를 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 12,
    "seasonPlace": "가을",
    "topicElements": null,
    "makesKit": null,
    "ebook": "미정",
    "artUse": [
      "교실 벽면에 전시해요.",
      "가을 산물을 더 모아 계속 꾸며요."
    ],
    "artExamples": [],
    "artTip": "자연물이 떨어지지 않도록 목공풀이나 글루건(교사)을 사용해 주세요.",
    "kitName": "허수아비 만들기 키트 · 유치원 활동 교구",
    "kitLead": [
      "허수아비 만들기 키트 (유치원 활동 교구 · 확정)",
      "가을 산물을 붙여 우리 반 허수아비를 완성하는 원내 활동 교구예요."
    ],
    "kitNotice": null,
    "familyLead": "가족과 산책하며 가을 산물을 모아 원으로 보내주세요!",
    "kitMissions": [
      "촉감 상자 놀이",
      "색깔 분류 놀이",
      "허수아비 꾸미기"
    ],
    "kitUse": "가정에서 보내온 가을 산물을 함께 사용하면 더 풍성해요.",
    "familyNote": "보내주신 가을 산물은 허수아비 꾸미기에 함께 사용해요.",
    "familyTip": "많이 모으기보다 아이가 직접 고른 것 몇 개면 충분해요.",
    "homeKitNote": "젖은 낙엽은 잘 말려서 보내주세요.",
    "videoDesc": "노래와 함께 소예키즈 친구들의 가을 이야기를 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 13,
    "seasonPlace": "보름달",
    "topicElements": null,
    "makesKit": null,
    "ebook": "미정",
    "artUse": [
      "가족에게 전하며 마음을 말해요.",
      "교실에 걸어 함께 감상해요."
    ],
    "artExamples": [
      "“할머니 건강하세요.”",
      "“우리 가족 행복하게 해주세요.”"
    ],
    "artTip": "소원은 아이가 말한 그대로 적어주세요.",
    "kitName": "보름달 활동 자료 (별도 교구 없음)",
    "kitLead": [
      "제작 교구 없이 도안·소모품과 원 보유 자료로 운영해요."
    ],
    "kitNotice": "이번 주 제작 교구는 없어요. 도안·소모품과 원 보유 자료로 운영해요.",
    "familyLead": "아이가 만든 복주머니를 가족에게 전하며 마음을 나눠요!",
    "kitMissions": [
      "강강술래 놀이",
      "소원 말하기",
      "복주머니 만들기"
    ],
    "kitUse": "보름달 소품은 교실 벽면 전시에도 활용해요.",
    "familyNote": "달이 뜬 밤에 함께 달을 보며 이야기하면 더 좋아요.",
    "familyTip": "소원의 내용보다 마음을 전하는 과정이 중요해요.",
    "homeKitNote": "전달하는 순간을 사진으로 남겨주세요.",
    "videoDesc": "노래와 함께 소예키즈 친구들의 보름달 이야기를 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 14,
    "seasonPlace": "겨울",
    "topicElements": null,
    "makesKit": null,
    "ebook": "미정",
    "artUse": [
      "교실 창문에 걸어 겨울 풍경을 만들어요.",
      "가정으로 보내 함께 걸어요."
    ],
    "artExamples": [],
    "artTip": "눈 결정은 모두 모양이 달라요. 똑같이 만들지 않아도 된다고 말해주세요.",
    "kitName": "겨울 놀이 자료 (별도 교구 없음)",
    "kitLead": [
      "제작 교구 없이 소모품과 원 보유 자료로 운영해요."
    ],
    "kitNotice": "이번 주 제작 교구는 없어요. 도안·소모품과 원 보유 자료로 운영해요.",
    "familyLead": "아이 이름을 쓴 개인 장갑을 준비해 겨울 놀이를 더 안전하고 따뜻하게!",
    "kitMissions": [
      "눈 감각 놀이",
      "발자국·손자국 찍기",
      "눈 결정 만들기"
    ],
    "kitUse": "알레르기·피부 민감 아동은 장갑을 끼고 참여하게 해주세요.",
    "familyNote": "장갑은 눈놀이와 바깥놀이에 계속 사용해요.",
    "familyTip": "여벌 장갑을 함께 보내주시면 젖었을 때 바꿔 낄 수 있어요.",
    "homeKitNote": "방수가 되는 장갑이면 더 좋아요.",
    "videoDesc": "노래와 함께 소예키즈 친구들의 겨울 이야기를 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 15,
    "seasonPlace": "온기",
    "topicElements": null,
    "makesKit": null,
    "ebook": "미정",
    "artUse": [
      "교실 문에 걸어 오갈 때 소리를 들어요.",
      "가정으로 보내 함께 걸어요."
    ],
    "artExamples": [],
    "artTip": "방울 개수에 따라 소리가 달라져요. 아이가 직접 비교해 고르게 해주세요.",
    "kitName": "온기벨 키트 · 가정연계 교구",
    "kitLead": [
      "온기 나눔 자료 (가정 교구 ‘온기벨’ 연계)",
      "온기벨은 가정연계 교구로 제작되고, 마음배지는 도안·소모품으로 준비해요."
    ],
    "kitNotice": null,
    "familyLead": "집과 동네의 어른께 마음배지를 전하며 감사한 마음을 표현해요!",
    "kitMissions": [
      "마음배지 전달 놀이",
      "온기벨 만들기",
      "고마운 마음 말하기"
    ],
    "kitUse": "배지는 원 선생님, 조리사님, 주변 어른께도 전할 수 있어요.",
    "familyNote": "경비 아저씨, 이웃, 조부모님 등 아이가 직접 떠올린 분이면 좋아요.",
    "familyTip": "아이가 직접 말로 전할 수 있도록 곁에서 기다려 주세요.",
    "homeKitNote": "온기벨은 가정연계 교구로 제작되는 품목이에요.",
    "videoDesc": "노래와 함께 소예키즈 친구들의 나눔 이야기를 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 16,
    "seasonPlace": "사계절",
    "topicElements": null,
    "makesKit": null,
    "ebook": "미정",
    "artUse": [
      "수료 선물로 가정에 보내요.",
      "교실에 전시한 뒤 보내드려요."
    ],
    "artExamples": [],
    "artTip": "사진이 부족한 계절은 아이가 그림으로 채워도 좋아요.",
    "kitName": "사계절 회고 자료 (별도 교구 없음)",
    "kitLead": [
      "9~15주 사진·작품과 원 보유 자료로 운영해요."
    ],
    "kitNotice": "이번 주 제작 교구는 없어요. 도안·소모품과 원 보유 자료로 운영해요.",
    "familyLead": "부모님이 아이 몰래 1분 영상편지를 찍어 보내주시면, 원에서 함께 상영해요!",
    "kitMissions": [
      "사계절 사진 전시",
      "영상편지 촬영",
      "사진 액자 만들기"
    ],
    "kitUse": "9~15주차 사진을 미리 인화해 두시면 진행이 훨씬 수월해요.",
    "familyNote": "아이가 모르게 준비하면 더 큰 감동이 돼요.",
    "familyTip": "길이보다 마음이에요. 30초도 충분해요.",
    "homeKitNote": "제출 기한을 미리 안내해 주세요.",
    "videoDesc": "노래와 함께 소예키즈 친구들의 사계절 이야기를 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 17,
    "seasonPlace": "물놀이터 · 바닷가 (여행의 첫 출발)",
    "topicElements": "안전 — 물놀이 안전, 여름철 전기·선풍기 안전 / 동화 내용은 물놀이 안전",
    "makesKit": null,
    "ebook": "미정",
    "artUse": [
      "교실에 걸어 물놀이 약속을 함께 봐요.",
      "여름 물놀이를 가기 전에 다시 꺼내 약속을 확인해요."
    ],
    "artExamples": [
      "“준비운동을 해요.”",
      "“어른과 함께 들어가요.”",
      "“뛰지 않고 걸어요.”"
    ],
    "artTip": "약속 문구는 아이가 말한 표현을 그대로 적어주세요.",
    "kitName": "물놀이 안전 놀이 KIT",
    "kitLead": [
      "물 없이도 교실에서 배우는 물놀이 안전!"
    ],
    "kitNotice": "이번 주 제작 교구는 없어요. 도안·소모품과 원 보유 자료로 운영해요.",
    "familyLead": "원에서는 물놀이 안전을, 가정에서는 선풍기·콘센트 안전을 나누어 살펴봐요!",
    "kitMissions": [
      "물놀이 안전 약속 놀이",
      "안전 상황 카드 놀이",
      "안전 튜브 만들기"
    ],
    "kitUse": "17주에 ‘우리 반 세계지도’를 교실에 걸고 출발지(우리나라)를 표시해요. 24주까지 사용해요.",
    "familyNote": "여름철 전기·선풍기 안전은 이번 주 가정연계에서 다뤄요. 아이가 직접 찾고 붙이게 해주세요.",
    "familyTip": "정한 약속을 냉장고에 붙여 두면 계속 이야기할 수 있어요.",
    "homeKitNote": "작성한 약속 카드를 사진으로 보내주시면 교실에서 함께 나눠요.",
    "videoDesc": "노래와 함께 소예키즈 친구들의 물놀이 안전 이야기를 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 18,
    "seasonPlace": "인도 · 색의 축제",
    "topicElements": "섞이며 만드는 색 — 색깔 알기, 색 조합 알기, 창의",
    "makesKit": null,
    "ebook": "미정",
    "artUse": [
      "교실 벽에 ‘우리 반 색 지도’로 전시해요.",
      "자유놀이에서 색 이름 맞히기로 활용해요."
    ],
    "artExamples": [
      "“딸기우유색”",
      "“개구리색”",
      "“노을색”"
    ],
    "artTip": "실제 색 이름과 달라도 괜찮아요. 아이가 지은 이름을 그대로 적어주세요.",
    "kitName": "색 섞기 놀이 KIT",
    "kitLead": [
      "섞고, 발견하고, 이름 붙이는 색 탐구 놀이!"
    ],
    "kitNotice": "이번 주 제작 교구는 없어요. 도안·소모품과 원 보유 자료로 운영해요.",
    "familyLead": "집 안에서 같은 색 물건을 모아 사진으로 남겨요!",
    "kitMissions": [
      "색 스카프 축제",
      "색 섞기 실험",
      "색 카드 만들기"
    ],
    "kitUse": "옷에 물감이 묻을 수 있으니 앞치마와 여벌 옷을 준비해 주세요.",
    "familyNote": "보내주신 사진은 교실 ‘우리 반 색 지도’에 함께 붙여요.",
    "familyTip": "많이 모으기보다 아이가 직접 고르는 과정이 중요해요.",
    "homeKitNote": "일주일 동안 하루 한 장씩 해보셔도 좋아요.",
    "videoDesc": "노래와 함께 소예키즈 친구들의 색 축제 이야기를 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 19,
    "seasonPlace": "아프리카 · 브라질 · 한국",
    "topicElements": "리듬탐험대, 소리여행 — 다양한 악기 소리를 따라가 세계의 악기 알기",
    "makesKit": null,
    "ebook": "미정",
    "artUse": [
      "신체활동 합주에 바로 사용해요.",
      "자유놀이 음악 영역에 두고 계속 활용해요."
    ],
    "artExamples": [],
    "artTip": "풍선을 씌우는 부분은 교사가 도와주세요. 무늬는 아이가 자유롭게 그리게 해주세요.",
    "kitName": "세계 악기 세트 · 유치원 활동 교구 · 제안",
    "kitLead": [
      "세계 악기 탐험 KIT",
      "듣고, 찾고, 두드리며 세계의 소리를 만나요!"
    ],
    "kitNotice": null,
    "familyLead": "집 안 물건으로 리듬 악기를 만들어 가족 합주를 해요!",
    "kitMissions": [
      "소리 따라가기 놀이",
      "악기 비교 관찰",
      "젬베 만들기와 합주"
    ],
    "kitUse": "소리가 큰 활동이에요. 옆 반 일정과 시간을 조율해 주세요.",
    "familyNote": "보내주신 영상은 교실에서 친구들과 함께 봐요.",
    "familyTip": "잘 맞추지 않아도 괜찮아요. 소리를 즐기는 것이 목적이에요.",
    "homeKitNote": "짧게 5분씩 자주 해보시면 좋아요.",
    "videoDesc": "노래와 함께 소예키즈 친구들의 소리 여행 이야기를 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 20,
    "seasonPlace": "한국 · 중국 · 베트남",
    "topicElements": "복 (추석, 명절), 새해 인사 등 나라별 주요 명절 알기",
    "makesKit": null,
    "ebook": "미정",
    "artUse": [
      "교실에 ‘우리 반 명절 밥상’으로 전시해요.",
      "역할놀이 음식 소품으로 활용해요."
    ],
    "artExamples": [
      "송편(한국)",
      "월병(중국)",
      "반쫑(베트남)"
    ],
    "artTip": "모양이 달라도 괜찮아요. 아이가 만든 것을 그대로 인정해 주세요.",
    "kitName": "세계 명절 KIT",
    "kitLead": [
      "인사, 음식, 옷으로 만나는 나라별 명절!"
    ],
    "kitNotice": "이번 주 제작 교구는 없어요. 도안·소모품과 원 보유 자료로 운영해요.",
    "familyLead": "우리 가족의 명절 모습을 사진과 이야기로 나눠요!",
    "kitMissions": [
      "명절 인사 여행",
      "명절 음식 만들기",
      "명절 역할놀이"
    ],
    "kitUse": "가정의 문화가 다양할 수 있어요. 아이 가족의 명절 방식도 함께 소개해 주세요.",
    "familyNote": "보내주신 사진은 교실 ‘우리 반 명절 이야기’에 전시해요.",
    "familyTip": "명절을 지내지 않는 가정은 가족이 모이는 특별한 날 이야기로 대신해 주세요.",
    "homeKitNote": "아이가 말한 표현을 그대로 적어주세요.",
    "videoDesc": "노래와 함께 소예키즈 친구들의 세계 명절 이야기를 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 21,
    "seasonPlace": "스페인 · 토마토 축제",
    "topicElements": "토마토 이야기 — 토마토가 자라나는 방법, 세계 토마토 축제",
    "makesKit": "방울토마토 키우기 키트 · 가정연계 교구 (제안)",
    "ebook": "미정",
    "artUse": [
      "교실에 ‘우리 반 토마토밭’으로 전시해요.",
      "완성 후 가정으로 보내요."
    ],
    "artExamples": [],
    "artTip": "찍을 때마다 모양이 달라요. 실패한 자국도 그대로 두면 더 재미있어요.",
    "kitName": "방울토마토 키우기 키트 · 가정연계 교구 · 제안",
    "kitLead": [
      "토마토 탐험 KIT",
      "자라는 과정부터 수확 축제까지 한 번에!"
    ],
    "kitNotice": null,
    "familyLead": "집에서 방울토마토를 심고 자라는 모습을 함께 관찰해요!",
    "kitMissions": [
      "성장 과정 표현 놀이",
      "토마토 축제 놀이",
      "토마토 도장 찍기"
    ],
    "kitUse": "실제 토마토를 사용할 때는 알레르기 여부를 미리 확인해 주세요.",
    "familyNote": "보내주신 사진으로 교실에 ‘우리 반 토마토 성장 일기’를 만들어요.",
    "familyTip": "싹이 나지 않아도 괜찮아요. 기다리는 경험 자체가 배움이에요.",
    "homeKitNote": "물은 매일 조금씩, 흙이 마르지 않을 정도로 주세요.",
    "videoDesc": "노래와 함께 소예키즈 친구들의 토마토 이야기를 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 22,
    "seasonPlace": "미국 · 아일랜드 · 세계의 축제",
    "topicElements": "할로윈 — 할로윈 파티, 세계 나라 축제 소개, 파티 장식 만들기",
    "makesKit": "없음",
    "ebook": "미정",
    "artUse": [
      "대표활동 파티장 꾸미기에 바로 사용해요.",
      "파티 후 교실 창가에 걸어 전시해요."
    ],
    "artExamples": [
      "호박 가랜드",
      "유령 모빌",
      "웃는 잭오랜턴 가면"
    ],
    "artTip": "무서운 모양만 있는 게 아니에요. 웃는 호박, 알록달록 유령도 좋다고 말해주세요.",
    "kitName": "할로윈 파티 KIT",
    "kitLead": [
      "세계의 축제를 만나고, 우리 손으로 파티를 여는 한 세트!"
    ],
    "kitNotice": "이번 주 제작 교구는 없어요. 도안 · 소모품과 원 보유 자료로 운영해요.",
    "familyLead": "아이가 만든 초대장을 가족에게 전하고, 집에서도 작은 파티를 열어요!",
    "kitMissions": [
      "세계 축제 알아보기",
      "파티 장식 만들기",
      "할로윈 파티 열기"
    ],
    "kitUse": "실제 사탕 대신 모형을 사용해요. 간식을 제공하실 경우 알레르기를 미리 확인해 주세요.",
    "familyNote": "보내주신 사진은 교실 ‘우리 반 파티 전시회’에 함께 붙여요.",
    "familyTip": "특별한 의상이 없어도 괜찮아요. 모자와 보자기면 충분해요.",
    "homeKitNote": "아이가 무서워하면 가면을 쓰지 않고 들고만 있어도 좋아요.",
    "videoDesc": "노래와 함께 소예키즈 친구들의 할로윈 파티 이야기를 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 23,
    "seasonPlace": "핀란드 · 독일",
    "topicElements": "크리스마스",
    "makesKit": "크리스마스 오너먼트 키트 · 가정연계 교구 (제안)",
    "ebook": "미정",
    "artUse": [
      "교실 트리에 걸어 함께 감상해요.",
      "학기 마무리에 가정으로 보내요."
    ],
    "artExamples": [
      "“가족 모두 건강하게”",
      "“친구들이랑 또 놀고 싶어요”"
    ],
    "artTip": "트리는 한 사람의 장식이 아니라 모두의 장식으로 완성된다는 것을 이야기해 주세요.",
    "kitName": "크리스마스 오너먼트 키트 · 가정연계 교구 · 제안",
    "kitLead": [
      "크리스마스 KIT",
      "배달하고, 꾸미고, 함께 완성하는 크리스마스!"
    ],
    "kitNotice": null,
    "familyLead": "가족이 함께 크리스마스 카드를 만들어 서로에게 전해요!",
    "kitMissions": [
      "선물 배달 릴레이",
      "트리 장식 만들기",
      "우리 반 트리 완성"
    ],
    "kitUse": "가정의 문화 · 종교가 다를 수 있어요. 참여 방식을 선택할 수 있게 안내해 주세요.",
    "familyNote": "아이가 말한 문장을 그대로 적어주세요.",
    "familyTip": "선물보다 말로 전하는 마음이 더 오래 남아요.",
    "homeKitNote": "종교 · 문화에 따라 ‘연말 감사 카드’로 활용하셔도 좋아요.",
    "videoDesc": "노래와 함께 소예키즈 친구들의 크리스마스 이야기를 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  },
  {
    "weekNo": 24,
    "seasonPlace": "지구 · 우주",
    "topicElements": "지구 (친구야, 너는 어디 별에서 왔니?) — 상상력 / 핵심 주제는 ‘각기 다른 우리들이 모여 아름다운 지구를 만든다’",
    "makesKit": "우리 지구 퍼즐 보드 · 유치원 활동 교구 (제안)",
    "ebook": "미정",
    "artUse": [
      "완성한 지구는 교실에 전시하고 세계지도 옆에 걸어요.",
      "수료식 배경으로 사용해요."
    ],
    "artExamples": [
      "“나는 그림별에서 왔어요”",
      "“나는 달리기별에서 왔어요”",
      "“나는 웃음별에서 왔어요”"
    ],
    "artTip": "조각마다 색과 그림이 다 달라야 더 아름다운 지구가 돼요. 똑같이 꾸미지 않도록 해주세요.",
    "kitName": "우리 지구 퍼즐 보드 · 유치원 활동 교구 · 제안",
    "kitLead": [
      "우리 지구 KIT",
      "다 다른 조각이 모여 하나의 지구가 되는 공동작품 세트!"
    ],
    "kitNotice": null,
    "familyLead": "가족은 각자 어떤 별에서 왔을지 상상하며, 서로의 다른 점과 좋은 점을 이야기해요!",
    "kitMissions": [
      "내 별 소개 놀이",
      "지구 조각 꾸미기",
      "우리 반 지구 완성"
    ],
    "kitUse": "조각 수는 원아 수에 맞춰 준비해 주세요. 결석한 아이의 조각도 자리를 비워 두었다가 나중에 채우면 의미가 더 살아나요.",
    "familyNote": "보내주신 편지는 수료식에서 아이에게 전해드려요.",
    "familyTip": "다른 점을 ‘틀린 것’이 아니라 ‘좋은 점’으로 이야기해 주시면 이번 주 주제와 이어져요.",
    "homeKitNote": "수료식에서 아이에게 직접 전해드립니다.",
    "videoDesc": "노래와 함께 소예키즈 친구들의 지구 이야기를 만나요!",
    "videoUrl": null,
    "videoUrlNote": "개발 시 입력"
  }
];

export function pdfExtraOf(weekNo: number): WeekPdfExtra | undefined {
  // 14 · 17~24주는 공식 가이드 기준 수업이다 — 같은 주차 PDF 의 추가 칸(다른 주제)은 화면에 쓰지 않는다
  if (isOfficialGuideWeek(weekNo)) return undefined;
  const w = WEEK_PDF_EXTRA.find((x) => x.weekNo === weekNo);
  const edits = EDITED_LINES.filter((e) => e.weekNo === weekNo);
  if (!w || !edits.length) return w;
  const fix = (s: string) => edits.find((e) => e.original === s)?.text ?? s;
  return Object.fromEntries(Object.entries(w).map(([k, v]) => [k, Array.isArray(v) ? v.map(fix) : typeof v === "string" ? fix(v) : v])) as unknown as WeekPdfExtra;
}
