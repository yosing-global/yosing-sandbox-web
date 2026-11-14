"use client";

import { type ReactNode, Suspense, useLayoutEffect, useState } from "react";

// 画面から離れたら、中身を DOM から外す（ログイン中の画面に使う）
//   Cache Components では、離れた画面を隠して残す（<Activity>）。ログアウトした後も、隠れた画面に
//   ログイン ID 等が残らないようにする（戻ってきたら、もう一度出す）
//   入力値を消すだけなら ResetWhenHidden（作り直す）。こちらは、隠れている間は何も出さない
export function UnmountWhenHidden({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(true);
  useLayoutEffect(() => {
    // 隠れていた画面にまた来たとき（effect がもう一度動く）、中身を出し直す。画面に出る前（layout effect）に行うので、
    // 一瞬空になることはない。effect の中の setState は、Activity の表示・非表示に合わせるためで、わざと行っている
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
    return () => setVisible(false);
  }, []);
  // 中身は、ここで Suspense で囲む（外側の Suspense に suspend を届かせない）
  //   出直したときに中身のデータがまだ届いていないと、中身が suspend する。layout effect の中の更新は同期の更新のため、
  //   外側の Suspense が待ちの表示になると、この部品も隠れて後片付け（中身を外す）が動き、また出直す…を繰り返す
  //   （React の誤り #185。Maximum update depth exceeded）
  return visible ? <Suspense>{children}</Suspense> : null;
}
