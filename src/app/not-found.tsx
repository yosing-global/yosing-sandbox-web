import type { Metadata } from "next";
import { NotFoundView } from "@/components/error-views";

export const metadata: Metadata = { title: "ページが見つかりません" };

// 存在しない URL の画面（404）
export default function NotFound() {
  return <NotFoundView />;
}
