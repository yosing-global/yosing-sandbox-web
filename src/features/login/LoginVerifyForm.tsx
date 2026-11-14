"use client";

import { type FormEvent, useActionState, useState } from "react";
import { z } from "zod";
import { verifyLogin } from "@/features/login/actions";
import type { VerifyLoginFormState } from "@/features/login/form-state";
import { LoginVerifyView } from "@/features/login/LoginVerifyView";
import { otpCodeSchema, parseForm } from "@/shared/validation";

// ログイン（ステップ2）のフォーム：画面での事前の確認 → verifyLogin（仮認証 JWT はサーバーが Cookie から読む）

const schema = z.object({ code: otpCodeSchema });
type FieldErrors = Extract<VerifyLoginFormState, { status: "error" }>["fieldErrors"];

export function LoginVerifyForm() {
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);
  const [state, formAction, pending] = useActionState(verifyLogin, { status: "idle" });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const parsed = parseForm(schema, new FormData(event.currentTarget));
    if (!parsed.ok) {
      event.preventDefault();
      setClientErrors(parsed.fieldErrors);
      return;
    }
    setClientErrors(null);
  }

  const error = state.status === "error" ? state : undefined;
  return (
    <LoginVerifyView
      notice={error?.notice}
      fieldErrors={clientErrors ?? error?.fieldErrors ?? {}}
      pending={pending}
      action={formAction}
      onSubmit={handleSubmit}
    />
  );
}
