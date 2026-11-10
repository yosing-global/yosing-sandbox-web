"use client";

import { ErrorView } from "@/components/error-views";

// 想定外のエラーの画面（500）。画面の表示・Server Action で投げられたエラー（API につながらない等）を受け止める
//   ルートのレイアウトの下の、すべての画面（ログイン・登録・ダッシュボード）を囲む
//   エラーの中身（message 等）は出さない（本番では Next.js も中身をブラウザーに渡さない）
export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <>
      <title>エラー | sandbox</title>
      <ErrorView onRetry={retry} />
    </>
  );
}
