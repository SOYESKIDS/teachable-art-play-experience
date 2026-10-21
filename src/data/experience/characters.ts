import type { CharacterKey, ExperienceImage } from "./types";

/**
 * 캐릭터 자리 — 공개 체험 사이트에는 캐릭터 그림을 싣지 않는다.
 *
 * ★ SOYE KIDS 캐릭터는 외부 공개 사용권이 확인되지 않았다 (2026-10-21).
 *   이 저장소에는 캐릭터 파일이 없고, 자리마다 자체 제작 소품 일러스트(Doodles.tsx)가 들어간다.
 */
export const CHARACTERS_ENABLED = false;

export function characterImage(key: CharacterKey): ExperienceImage | null {
  void key;
  return null;
}

export function characterGroupImage(): ExperienceImage | null {
  return null;
}
