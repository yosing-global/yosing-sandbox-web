import type { Metadata } from "next";
import { notoSansJp } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "sandbox", template: "%s | sandbox" },
  // 公開しない前提のため、検索エンジンに載せない
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${notoSansJp.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
