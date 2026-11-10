// ダッシュボードのメニューと、ホームの機能のカード
//   機能を足すときは、FEATURES に1つ足す（メニューの「機能」とホームのカードの両方に出る）
//   href の無いものは、画面がまだ無い仮置き（リンクにしない）。名前（AAAAAA 等）は UI/UX 設計の仮置きのまま

export type MenuItem = {
  name: string;
  /** 画面の URL。無ければ、まだ画面が無い（リンクにしない） */
  href?: string;
  /** ホームのカードに出す説明 */
  description?: string;
};

export const FEATURES: readonly MenuItem[] = [
  { name: "AAAAAA", description: "AAAAAA の説明が入ります。" },
  { name: "BBBBBB", description: "BBBBBB の説明が入ります。" },
  { name: "CCCCCC", description: "CCCCCC の説明が入ります。" },
];

export const SETTINGS: readonly MenuItem[] = [{ name: "アカウント" }];
