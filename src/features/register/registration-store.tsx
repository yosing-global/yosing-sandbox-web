"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import type { RegistrationSetup } from "@/features/register/form-state";

// 新規登録の設定の値（登録 ID・QR コード・キー）の store（ブラウザーのメモリだけ）
//   Provider は app/(auth)/register/layout.tsx に置く（/register と /register/setup の間で値が残る）
//   API には設定 URI を取り直す手段が無いため、リロード・URL の直打ちで空になったら、登録をやり直す
//   sessionStorage 等には入れない（秘密情報を残さないため）

type Store = {
  setup: RegistrationSetup | null;
  save: (setup: RegistrationSetup) => void;
  clear: () => void;
};

const RegistrationStoreContext = createContext<Store | null>(null);

export function RegistrationStoreProvider({ children }: { children: ReactNode }) {
  const [setup, setSetup] = useState<RegistrationSetup | null>(null);
  // save・clear は値が変わっても同じ関数にする（effect の依存にしても、値の保存のたびに動かないように）
  const clear = useCallback(() => setSetup(null), []);
  const store = useMemo<Store>(() => ({ setup, save: setSetup, clear }), [setup, clear]);

  // 新規登録の画面から離れたら（登録の完了・ログインへの移動等）、値を消す
  //   Cache Components では、離れた画面を消さずに隠して残す（<Activity>）ため、消えるのを待たずに消す
  //   （/register と /register/setup の間の移動では、このレイアウトは隠れないので消えない）
  useLayoutEffect(() => clear, [clear]);
  return (
    <RegistrationStoreContext.Provider value={store}>{children}</RegistrationStoreContext.Provider>
  );
}

export function useRegistrationStore(): Store {
  const store = useContext(RegistrationStoreContext);
  if (store === null) {
    throw new Error("RegistrationStoreProvider の外で使われた");
  }
  return store;
}
