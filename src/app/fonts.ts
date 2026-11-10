import { Noto_Sans_JP } from "next/font/google";

// フォントはビルドの時に取り込み、自分のサーバーから配る（ブラウザーから Google に通信しない）
//   ルートのレイアウトと global-error（ルートのレイアウトの代わりに出す）の両方で使う
export const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});
