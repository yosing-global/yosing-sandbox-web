"use client";

import { useSyncExternalStore } from "react";

// スマホの幅（Tailwind の md＝768px 未満）かどうか
//   CSS だけで切り替えられないもの（「QR コードを読み取れない場合」を最初から開くか）にだけ使う
//   サーバーと、ブラウザーでの最初の描画（hydration）では false（PC）として描き、その後に合わせる
const QUERY = "(max-width: 767.98px)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function useIsPhone(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
