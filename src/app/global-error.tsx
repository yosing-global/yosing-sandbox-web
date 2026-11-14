"use client";

import { ErrorView } from "@/components/error-views";
import { notoSansJp } from "./fonts";
import "./globals.css";

// ルートのレイアウトで起きたエラーの画面（ルートのレイアウトの代わりに出すため、html・body・文字・色を自分で持つ）
//   ふだんは error.tsx が受け止める。ここに来るのは、ルートのレイアウトそのものが失敗したときだけ
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="ja" className={`${notoSansJp.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <title>エラー | sandbox</title>
        <ErrorView onRetry={retry} />
      </body>
    </html>
  );
}
