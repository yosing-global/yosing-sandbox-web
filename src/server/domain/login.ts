import type { ApiFieldError, Session } from "@/server/domain/auth";
import type { LoginToken } from "@/server/domain/values";

// ログインの結果の型（想定した失敗は例外にせず、kind で分ける。文言は画面の側で決める）

/** ログインの開始の結果 */
export type StartLoginResult =
  | {
      kind: "ok";
      loginToken: LoginToken;
      /** 仮認証の期限（API の expiresAt。Cookie の Expires にそのまま使う） */
      expiresAt: Date;
    }
  /** ログイン ID が無い・パスワードが違う・ロック中（API が区別させない） */
  | { kind: "invalid-credentials" }
  | { kind: "validation"; errors: ApiFieldError[] };

/** ログインの確定の結果 */
export type VerifyLoginResult =
  | { kind: "ok"; session: Session }
  /** コードが違う・使用済み（残りの回数は扱わない） */
  | { kind: "otp-invalid" }
  /** 仮認証 JWT が無効・期限切れ・使用済み・置き換わった（LOGIN_TOKEN_INVALID） */
  | { kind: "login-token-invalid" }
  /** コードを続けて間違えた（OTP_ATTEMPTS_EXCEEDED。画面ではロックに触れない） */
  | { kind: "attempts-exceeded" }
  | { kind: "validation"; errors: ApiFieldError[] };
