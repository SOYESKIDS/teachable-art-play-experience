"use client";

import { useState } from "react";
import { SHARE_MESSAGE, shareHref } from "@/data/site";
import { popButtonClass, type PopSize, type PopTone } from "./PopButton";

/**
 * 「원장님께 전하기」 (E-5).
 *
 * ── 무엇을 보내나 ────────────────────────────────────────────────
 *
 * 링크와 고정 문구뿐이다. 누가 썼는지 · 몇 번 썼는지 **남기지도 보내지도 않는다.**
 * 이 사이트가 아무것도 저장하지 않는다는 전제를 공유 기능이 깨면 안 된다.
 *
 * ── 왜 두 갈래인가 ───────────────────────────────────────────────
 *
 * ★ 휴대폰은 navigator.share 로 기본 공유창을 연다 — 교사가 늘 쓰는 카카오톡이 거기 있다.
 * ★ PC 는 공유창이 없는 브라우저가 많아 글과 링크를 복사해 준다. 복사가 막힌 환경
 *   (권한 거부 · 보안 설정)에서는 **조용히 실패하지 않고** 주소를 글로 띄워 직접
 *   복사하게 한다. 눌러도 아무 일이 없는 버튼은 고장으로 읽힌다.
 * ★ 카카오 공식 공유 SDK 는 앱 키가 필요해 이번 범위 밖이다 (문서 E-5).
 */
export function ShareButton({
  path,
  children = "원장님께 전하기",
  tone = "white",
  size = "md",
  className,
}: {
  /** 공유할 체험 화면 경로 (예: /experience/classroom/4) */
  path: string;
  children?: string;
  tone?: PopTone;
  size?: PopSize;
  className?: string;
}) {
  const [note, setNote] = useState<string | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  async function onShare() {
    const url = shareHref(path);
    const text = `${SHARE_MESSAGE}\n${url}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "TeachAble Art Play", text: SHARE_MESSAGE, url });
        return;
      } catch {
        // 공유창을 닫은 것일 수도 있다. 실패로 단정하지 않고 복사로 넘어간다.
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setNote("문구와 링크를 복사했어요. 원장님께 붙여넣어 보내세요.");
      setFallbackUrl(null);
      return;
    } catch {
      // 복사 권한이 없는 환경 — 직접 복사할 수 있게 주소를 보여 준다.
      setNote("자동 복사가 막혀 있어요. 아래 주소를 길게 눌러 복사해 주세요.");
      setFallbackUrl(url);
    }
  }

  return (
    <span className="inline-flex flex-col items-center gap-2">
      <button type="button" onClick={onShare} className={popButtonClass(tone, size, className)}>
        {children}
      </button>
      {note ? (
        <span role="status" className="max-w-[34ch] text-center text-[13px] font-semibold leading-relaxed text-pop-ink-muted">
          {note}
          {fallbackUrl ? <span className="mt-1 block break-all font-normal text-pop-ink">{fallbackUrl}</span> : null}
        </span>
      ) : null}
    </span>
  );
}
