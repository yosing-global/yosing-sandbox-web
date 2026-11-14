import type { Metadata } from "next";
import { ResetWhenHidden } from "@/components/reset-when-hidden";
import { RegisterSetupForm } from "@/features/register/RegisterSetupForm";

export const metadata: Metadata = { title: "認証アプリの設定" };

// /register/setup：新規登録（ステップ2）。設定の値はブラウザーの store から出す（サーバーは何も読まない）
export default function RegisterSetupPage() {
  return (
    <ResetWhenHidden>
      <RegisterSetupForm />
    </ResetWhenHidden>
  );
}
