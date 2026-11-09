import type { FieldErrorKind } from "@/shared/validation";

// 新規登録のフォームの状態（Server Action の戻り値。文言は持たず、種類だけを持つ）

/** 新規登録の設定の値（ブラウザーのメモリにだけ持つ。sessionStorage 等には入れない） */
export type RegistrationSetup = {
  registrationId: string;
  qrCodeSvg: string;
  setupKey: string;
};

export type StartFormState =
  | { status: "idle" }
  | {
      status: "error";
      notice?: "login-id-taken";
      fieldErrors: { loginId?: FieldErrorKind; password?: FieldErrorKind };
      /** 入力欄に残すログイン ID（パスワードは返さない＝空にする） */
      loginId: string;
    }
  | { status: "ok"; setup: RegistrationSetup };

export type VerifyFormState =
  | { status: "idle" }
  | { status: "error"; notice?: "otp-invalid"; fieldErrors: { code?: FieldErrorKind } };

/** 別の画面に移したうえで出すお知らせ（URL の ?notice=。決まった値だけを受け付ける） */
export type RegisterNotice = "restart" | "taken";

export function parseRegisterNotice(value: unknown): RegisterNotice | undefined {
  return value === "restart" || value === "taken" ? value : undefined;
}
