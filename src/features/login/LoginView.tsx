import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { FormEventHandler } from "react";
import { FormField, inputClassName } from "@/components/form-field";
import { Notice } from "@/components/notice";
import { PasswordInput } from "@/components/password-input";
import { Steps } from "@/components/steps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fieldErrorMessage, NOTICE_MESSAGES } from "@/shared/messages";
import type { FieldErrorKind } from "@/shared/validation";

// ログイン（ステップ1：ログイン ID・パスワード）の見た目

export const LOGIN_STEPS = ["パスワード", "認証コード"] as const;

/** invalid-credentials・retry-later は赤、expired は青（利用者のせいではないため） */
export type LoginViewNotice = "invalid-credentials" | "retry-later" | "expired";

type Props = {
  notice?: LoginViewNotice;
  fieldErrors: { loginId?: FieldErrorKind; password?: FieldErrorKind };
  /** 入力欄に残すログイン ID */
  defaultLoginId: string;
  pending: boolean;
  action: (formData: FormData) => void;
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

const NOTICES = {
  "invalid-credentials": { variant: "danger", message: NOTICE_MESSAGES.invalidCredentials },
  "retry-later": { variant: "danger", message: NOTICE_MESSAGES.retryLater },
  expired: { variant: "info", message: NOTICE_MESSAGES.loginExpired },
} as const;

export function LoginView({
  notice,
  fieldErrors,
  defaultLoginId,
  pending,
  action,
  onSubmit,
}: Props) {
  return (
    <div className="flex flex-col gap-7 md:gap-8">
      <Steps label="ログインの手順" steps={LOGIN_STEPS} current={0} />

      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-2xl font-bold md:text-[28px]">ログイン</h1>
        <p className="m-0 text-[15px] leading-[1.7] text-muted-foreground">
          ログイン ID とパスワードを入力してください。
        </p>
      </div>

      {notice && <Notice variant={NOTICES[notice].variant}>{NOTICES[notice].message}</Notice>}

      <form action={action} onSubmit={onSubmit} noValidate className="m-0 flex flex-col gap-5">
        <FormField
          id="login-id"
          label="ログイン ID"
          hint="英字・数字・_・- で3〜32文字"
          error={fieldErrorMessage("loginId", fieldErrors.loginId)}
        >
          {(control) => (
            <Input
              {...control}
              key={defaultLoginId}
              name="loginId"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              defaultValue={defaultLoginId}
              className={inputClassName}
            />
          )}
        </FormField>
        <FormField
          id="password"
          label="パスワード"
          error={fieldErrorMessage("password", fieldErrors.password)}
        >
          {(control) => (
            <PasswordInput
              {...control}
              name="password"
              autoComplete="current-password"
              className={inputClassName}
            />
          )}
        </FormField>
        <Button type="submit" disabled={pending} className="h-12 gap-2 text-base font-bold">
          次へ
          <ArrowRight aria-hidden="true" className="size-[18px]" />
        </Button>
      </form>

      <p className="m-0 border-t border-border pt-5 text-sm text-muted-foreground">
        アカウントをお持ちでない方は{" "}
        <Link href="/register" className="text-link underline hover:text-blue-800">
          新規登録
        </Link>
      </p>
    </div>
  );
}
