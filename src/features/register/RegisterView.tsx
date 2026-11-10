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

// 新規登録（ステップ1：ログイン ID・パスワード）の見た目

export const REGISTER_STEPS = ["ID・パスワード", "認証アプリの設定"] as const;

export type RegisterViewNotice = "login-id-taken" | "restart";

type Props = {
  notice?: RegisterViewNotice;
  fieldErrors: { loginId?: FieldErrorKind; password?: FieldErrorKind };
  /** 入力欄に残すログイン ID */
  defaultLoginId: string;
  pending: boolean;
  action: (formData: FormData) => void;
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

export function RegisterView({
  notice,
  fieldErrors,
  defaultLoginId,
  pending,
  action,
  onSubmit,
}: Props) {
  return (
    <div className="flex flex-col gap-7 md:gap-8">
      <Steps label="登録の手順" steps={REGISTER_STEPS} current={0} />

      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-2xl font-bold md:text-[28px]">新規登録</h1>
        <p className="m-0 text-[15px] leading-[1.7] text-muted-foreground">
          ログインに使う ID とパスワードを決めてください。
        </p>
      </div>

      {notice && (
        <Notice variant="danger">
          {notice === "login-id-taken"
            ? NOTICE_MESSAGES.loginIdTaken
            : NOTICE_MESSAGES.registrationRestart}
        </Notice>
      )}

      <form action={action} onSubmit={onSubmit} noValidate className="m-0 flex flex-col gap-5">
        <FormField
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
          label="パスワード"
          hint="12〜64文字（英字・数字・記号）"
          error={fieldErrorMessage("password", fieldErrors.password)}
        >
          {(control) => (
            <PasswordInput
              {...control}
              name="password"
              autoComplete="new-password"
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
        アカウントをお持ちの方は{" "}
        <Link href="/login" className="text-link underline hover:text-blue-800">
          ログイン
        </Link>
      </p>
    </div>
  );
}
