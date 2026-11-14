"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { StartFormState, VerifyFormState } from "@/features/register/form-state";
import { usecases } from "@/server/container";
import { LoginId, OtpCode, Password, RegistrationId } from "@/server/domain/values";
import { startAuthenticatedSession } from "@/server/presentation/auth-cookies";
import { toFieldErrors } from "@/server/presentation/field-errors";
import { loginIdSchema, otpCodeSchema, parseForm, passwordSchema } from "@/shared/validation";

// 新規登録のコントローラー（Server Action）
//   入力を確かめる → ユースケースを呼ぶ → 結果を画面の状態・移り先・Cookie に変える
//   Server Action は誰でも POST できる入口のため、画面での確認に関係なく、ここでも確かめる

const startSchema = z.object({ loginId: loginIdSchema, password: passwordSchema });
const verifySchema = z.object({ code: otpCodeSchema });

/** 登録を始める（成功したら、設定の値を画面に返す。画面が store に入れて /register/setup へ移る） */
export async function startRegistration(
  _prev: StartFormState,
  formData: FormData,
): Promise<StartFormState> {
  const rawLoginId = formData.get("loginId");
  const loginId = typeof rawLoginId === "string" ? rawLoginId : "";
  const parsed = parseForm(startSchema, formData);
  if (!parsed.ok) {
    return { status: "error", fieldErrors: parsed.fieldErrors, loginId };
  }

  const result = await usecases.startRegistration(
    LoginId.of(parsed.value.loginId),
    Password.of(parsed.value.password),
  );
  switch (result.kind) {
    case "ok":
      return {
        status: "ok",
        setup: {
          registrationId: result.registrationId,
          qrCodeSvg: result.qrCodeSvg,
          setupKey: result.setupKey,
        },
      };
    case "login-id-taken":
      return { status: "error", notice: "login-id-taken", fieldErrors: {}, loginId };
    case "validation":
      return {
        status: "error",
        fieldErrors: toFieldErrors(result.errors, ["loginId", "password"] as const),
        loginId,
      };
  }
}

/** 登録を確定する（成功したらセッションの Cookie を設定して /dashboard へ） */
export async function verifyRegistration(
  registrationId: string,
  _prev: VerifyFormState,
  formData: FormData,
): Promise<VerifyFormState> {
  if (!RegistrationId.isValid(registrationId)) {
    redirect("/register?notice=restart");
  }
  const parsed = parseForm(verifySchema, formData);
  if (!parsed.ok) {
    return { status: "error", fieldErrors: parsed.fieldErrors };
  }

  const result = await usecases.verifyRegistration(
    RegistrationId.of(registrationId),
    OtpCode.of(parsed.value.code),
  );
  switch (result.kind) {
    case "ok":
      await startAuthenticatedSession(result.session);
      redirect("/dashboard");
    case "otp-invalid":
      return { status: "error", notice: "otp-invalid", fieldErrors: {} };
    case "restart":
      redirect("/register?notice=restart");
    case "login-id-taken":
      redirect("/register?notice=taken");
    case "validation":
      return { status: "error", fieldErrors: toFieldErrors(result.errors, ["code"] as const) };
  }
}
