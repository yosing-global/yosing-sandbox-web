"use client";

import { Fragment, type ReactNode, useLayoutEffect, useState } from "react";

// 画面から離れたら、中身を作り直す（入力値・送信の結果・開閉を、次に開いたときに残さない）
//   Cache Components では、離れた画面を消さずに隠して残す（React の <Activity>。最大3つ）。
//   ログイン・登録のフォームは、毎回まっさらにする（パスワード・古いお知らせを残さないため）。
//   隠れるときに layout effect の後片付けが動くので、そこで key を変えて作り直す
//   （参考：node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md）
export function ResetWhenHidden({ children }: { children: ReactNode }) {
  const [generation, setGeneration] = useState(0);
  useLayoutEffect(() => () => setGeneration((g) => g + 1), []);
  return <Fragment key={generation}>{children}</Fragment>;
}
