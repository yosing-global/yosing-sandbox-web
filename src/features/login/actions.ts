"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { StartLoginFormState, VerifyLoginFormState } from "@/features/login/form-state";
import { usecases } from "@/server/container";
import { LoginId, OtpCode, Password } from "@/server/domain/values";
import {
  deleteLoginCookie,
  readLoginCookie,
  setLoginCookie,
  startAuthenticatedSession,
} from "@/server/presentation/auth-cookies";
import { toFieldErrors } from "@/server/presentation/field-errors";
import { loginIdSchema, otpCodeSchema, parseForm, passwordSchema } from "@/shared/validation";

// ログインのコントローラー（Server Action）
//   入力を確かめる → ユースケースを呼ぶ → 結果を画面の状態・移り先・Cookie に変える
//   Server Action は誰でも POST できる入口のため、画面での確認に関係なく、ここでも確かめる

const startSchema = z.object({ loginId: loginIdSchema, password: passwordSchema });
const verifySchema = z.object({ code: otpCodeSchema });

/** ログインを始める（成功したら仮認証の Cookie を設定して /login/verify へ） */
export async function startLogin(
  _prev: StartLoginFormState,
  formData: FormData,
): Promise<StartLoginFormState> {
  const rawLoginId = formData.get("loginId");
  const loginId = typeof rawLoginId === "string" ? rawLoginId : "";
  const parsed = parseForm(startSchema, formData);
  if (!parsed.ok) {
    return { status: "error", fieldErrors: parsed.fieldErrors, loginId };
  }

  const result = await usecases.startLogin(
    LoginId.of(parsed.value.loginId),
    Password.of(parsed.value.password),
  );
  switch (result.kind) {
    case "ok":
      await setLoginCookie(result.loginToken, result.expiresAt);
      redirect("/login/verify");
    case "invalid-credentials":
      return { status: "error", notice: "invalid-credentials", fieldErrors: {}, loginId };
    case "validation":
      return {
        status: "error",
        fieldErrors: toFieldErrors(result.errors, ["loginId", "password"] as const),
        loginId,
      };
  }
}

/** ログインを確定する（成功したら仮認証の Cookie を消し、セッションの Cookie を設定して /dashboard へ） */
export async function verifyLogin(
  _prev: VerifyLoginFormState,
  formData: FormData,
): Promise<VerifyLoginFormState> {
  // 仮認証 JWT は Cookie から読む（ブラウザーの JavaScript には渡さない）
  const loginToken = await readLoginCookie();
  if (loginToken === null) {
    // 期限（5分）が過ぎて Cookie が消えた等
    await deleteLoginCookie();
    redirect("/login?notice=expired");
  }
  const parsed = parseForm(verifySchema, formData);
  if (!parsed.ok) {
    return { status: "error", fieldErrors: parsed.fieldErrors };
  }

  const result = await usecases.verifyLogin(loginToken, OtpCode.of(parsed.value.code));
  switch (result.kind) {
    case "ok":
      await startAuthenticatedSession(result.session);
      redirect("/dashboard");
    case "otp-invalid":
      return { status: "error", notice: "otp-invalid", fieldErrors: {} };
    case "login-token-invalid":
      await deleteLoginCookie();
      redirect("/login?notice=expired");
    case "attempts-exceeded":
      await deleteLoginCookie();
      redirect("/login?notice=retry-later");
    case "validation":
      return { status: "error", fieldErrors: toFieldErrors(result.errors, ["code"] as const) };
  }
}
