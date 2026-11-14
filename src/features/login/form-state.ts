import type { FieldErrorKind } from "@/shared/validation";

// ログインのフォームの状態（Server Action の戻り値。文言は持たず、種類だけを持つ）

export type StartLoginFormState =
  | { status: "idle" }
  | {
      status: "error";
      notice?: "invalid-credentials";
      fieldErrors: { loginId?: FieldErrorKind; password?: FieldErrorKind };
      /** 入力欄に残すログイン ID（パスワードは返さない＝空にする） */
      loginId: string;
    };

export type VerifyLoginFormState =
  | { status: "idle" }
  | { status: "error"; notice?: "otp-invalid"; fieldErrors: { code?: FieldErrorKind } };

/** 別の画面に移したうえで出すお知らせ（URL の ?notice=。決まった値だけを受け付ける） */
export type LoginNotice = "expired" | "retry-later";

export function parseLoginNotice(value: unknown): LoginNotice | undefined {
  return value === "expired" || value === "retry-later" ? value : undefined;
}
