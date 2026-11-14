import type { Metadata } from "next";
import { ResetWhenHidden } from "@/components/reset-when-hidden";
import { LoginVerifyForm } from "@/features/login/LoginVerifyForm";

export const metadata: Metadata = { title: "認証コードの入力" };

// /login/verify：ログイン（ステップ2）
//   仮認証の Cookie が無いときは、開く前に proxy が /login へ移す（src/proxy.ts）
export default function LoginVerifyPage() {
  return (
    <ResetWhenHidden>
      <LoginVerifyForm />
    </ResetWhenHidden>
  );
}
