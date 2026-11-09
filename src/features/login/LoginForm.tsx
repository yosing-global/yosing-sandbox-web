"use client";

import { type FormEvent, useActionState, useState } from "react";
import { z } from "zod";
import { startLogin } from "@/features/login/actions";
import type { LoginNotice, StartLoginFormState } from "@/features/login/form-state";
import { LoginView } from "@/features/login/LoginView";
import { loginIdSchema, parseForm, passwordSchema } from "@/shared/validation";

// ログイン（ステップ1）のフォーム：画面での事前の確認 → startLogin（成功したらサーバーが /login/verify へ移す）

const schema = z.object({ loginId: loginIdSchema, password: passwordSchema });
type FieldErrors = Extract<StartLoginFormState, { status: "error" }>["fieldErrors"];

export function LoginForm({ initialNotice }: { initialNotice?: LoginNotice }) {
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);
  const [state, formAction, pending] = useActionState(startLogin, { status: "idle" });

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
  // URL のお知らせは、送信する前だけ出す（送信した結果のお知らせに置き換える）
  const notice = error?.notice ?? (state.status === "idle" ? initialNotice : undefined);

  return (
    <LoginView
      notice={notice}
      fieldErrors={clientErrors ?? error?.fieldErrors ?? {}}
      defaultLoginId={error?.loginId ?? ""}
      pending={pending}
      action={formAction}
      onSubmit={handleSubmit}
    />
  );
}
