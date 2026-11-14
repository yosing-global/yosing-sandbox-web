import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { FormEventHandler } from "react";
import { Notice } from "@/components/notice";
import { OtpCodeField } from "@/components/otp-code-field";
import { Steps } from "@/components/steps";
import { Button } from "@/components/ui/button";
import { LOGIN_STEPS } from "@/features/login/LoginView";
import { NOTICE_MESSAGES } from "@/shared/messages";
import type { FieldErrorKind } from "@/shared/validation";

// ログイン（ステップ2：認証コード）の見た目

type Props = {
  notice?: "otp-invalid";
  fieldErrors: { code?: FieldErrorKind };
  pending: boolean;
  action: (formData: FormData) => void;
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

const NOTICE_ID = "login-verify-notice";

export function LoginVerifyView({ notice, fieldErrors, pending, action, onSubmit }: Props) {
  return (
    <div className="flex flex-col gap-7 md:gap-8">
      <Steps label="ログインの手順" steps={LOGIN_STEPS} current={1} />

      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-2xl font-bold md:text-[28px]">認証コードの入力</h1>
        <p className="m-0 text-[15px] leading-[1.7] text-muted-foreground">
          認証アプリに表示されている6桁のコードを入力してください。
        </p>
      </div>

      {notice && (
        <div id={NOTICE_ID}>
          <Notice variant="danger">{NOTICE_MESSAGES.otpInvalid}</Notice>
        </div>
      )}

      <form action={action} onSubmit={onSubmit} noValidate className="m-0 flex flex-col gap-5">
        <OtpCodeField error={fieldErrors.code} describedBy={notice ? NOTICE_ID : undefined} />
        <Button type="submit" disabled={pending} className="h-12 text-base font-bold">
          ログイン
        </Button>
      </form>

      <div className="border-t border-border pt-3 text-sm">
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center gap-1.5 text-link underline hover:text-blue-800"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          ログイン ID・パスワードの入力に戻る
        </Link>
      </div>
    </div>
  );
}
