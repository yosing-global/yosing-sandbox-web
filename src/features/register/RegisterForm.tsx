"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useActionState, useEffect, useState } from "react";
import { z } from "zod";
import { startRegistration } from "@/features/register/actions";
import type { RegisterNotice, StartFormState } from "@/features/register/form-state";
import { useRegistrationStore } from "@/features/register/registration-store";
import { RegisterView } from "@/features/register/RegisterView";
import { loginIdSchema, parseForm, passwordSchema } from "@/shared/validation";

// 新規登録（ステップ1）のフォーム：画面での事前の確認 → startRegistration → store に入れて /register/setup へ

const schema = z.object({ loginId: loginIdSchema, password: passwordSchema });
type FieldErrors = Extract<StartFormState, { status: "error" }>["fieldErrors"];

export function RegisterForm({ initialNotice }: { initialNotice?: RegisterNotice }) {
  const router = useRouter();
  const store = useRegistrationStore();
  const { clear } = store;
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);

  // ステップ1に来たら（戻ってきた・やり直し）、前の登録の値を消す
  useEffect(() => clear(), [clear]);

  const [state, formAction, pending] = useActionState(
    async (prev: StartFormState, formData: FormData) => {
      const next = await startRegistration(prev, formData);
      if (next.status === "ok") {
        store.save(next.setup);
        router.push("/register/setup");
      }
      return next;
    },
    { status: "idle" },
  );

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
  const notice =
    error?.notice ??
    (state.status === "idle" && initialNotice
      ? initialNotice === "taken"
        ? "login-id-taken"
        : "restart"
      : undefined);

  return (
    <RegisterView
      notice={notice}
      fieldErrors={clientErrors ?? error?.fieldErrors ?? {}}
      defaultLoginId={error?.loginId ?? ""}
      pending={pending || state.status === "ok"}
      action={formAction}
      onSubmit={handleSubmit}
    />
  );
}
