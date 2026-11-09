"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useActionState, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { verifyRegistration } from "@/features/register/actions";
import type { RegistrationSetup, VerifyFormState } from "@/features/register/form-state";
import { useRegistrationStore } from "@/features/register/registration-store";
import { RegisterSetupView } from "@/features/register/RegisterSetupView";
import { useIsPhone } from "@/features/register/use-is-phone";
import { otpCodeSchema, parseForm } from "@/shared/validation";

// 新規登録（ステップ2）：store の設定の値を出し、コードで登録を確定する
//   store が空（リロード・URL の直打ち）なら、/register に戻す（登録をやり直す）

export function RegisterSetupForm() {
  const router = useRouter();
  const { setup } = useRegistrationStore();

  useEffect(() => {
    if (setup === null) {
      router.replace("/register");
    }
  }, [setup, router]);

  if (setup === null) {
    return null;
  }
  return <SetupForm setup={setup} />;
}

const schema = z.object({ code: otpCodeSchema });
type FieldErrors = Extract<VerifyFormState, { status: "error" }>["fieldErrors"];

function SetupForm({ setup }: { setup: RegistrationSetup }) {
  const isPhone = useIsPhone();
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [state, formAction, pending] = useActionState(
    verifyRegistration.bind(null, setup.registrationId),
    { status: "idle" },
  );

  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  async function handleCopy() {
    try {
      // 認証アプリには区切りの空白なしで渡す
      await navigator.clipboard.writeText(setup.setupKey.replaceAll(" ", ""));
    } catch {
      // コピーできない環境（権限が無い等）。キーは画面に出ているので、手で写してもらう
      return;
    }
    setCopied(true);
    clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 3000);
  }

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
    <RegisterSetupView
      qrCodeSvg={setup.qrCodeSvg}
      setupKey={setup.setupKey}
      keyOpen={isPhone}
      copied={copied}
      onCopy={handleCopy}
      notice={error?.notice}
      fieldErrors={clientErrors ?? error?.fieldErrors ?? {}}
      pending={pending}
      action={formAction}
      onSubmit={handleSubmit}
    />
  );
}
