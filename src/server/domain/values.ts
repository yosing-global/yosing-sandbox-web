import { LOGIN_ID_PATTERN, OTP_CODE_PATTERN, PASSWORD_PATTERN } from "@/shared/validation";

// 値オブジェクト（確かめた値を包むだけ。外から来た値の確認は、コントローラーで shared の入力の規則を使って行う）
//   型で区別し、確かめていない文字列をユースケースに渡せないようにする

declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };

export type LoginId = Brand<string, "LoginId">;
export type Password = Brand<string, "Password">;
export type OtpCode = Brand<string, "OtpCode">;
/** 登録 ID（API が発行する UUID） */
export type RegistrationId = Brand<string, "RegistrationId">;

/** 仮認証 JWT（API が発行する。中身は見ず、そのまま API に渡す） */
export type LoginToken = Brand<string, "LoginToken">;

/** セッション ID（API が発行する。Cookie に入れ、API には Authorization: Bearer で渡す） */
export type SessionId = Brand<string, "SessionId">;

// JWT は base64url の3つの部分を「.」でつないだもの（Cookie の値として安全な文字だけ）
const LOGIN_TOKEN_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
// セッション ID は乱数の base64url（パディングなし）
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{16,256}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function of<T extends string>(name: string, pattern: RegExp) {
  return (value: string): T => {
    if (!pattern.test(value)) {
      // 値そのものは秘密を含みうるため、メッセージに入れない
      throw new RangeError(`${name} の形式が違う`);
    }
    return value as T;
  };
}

export const LoginId = { of: of<LoginId>("LoginId", LOGIN_ID_PATTERN) };
export const Password = { of: of<Password>("Password", PASSWORD_PATTERN) };
export const OtpCode = { of: of<OtpCode>("OtpCode", OTP_CODE_PATTERN) };
export const RegistrationId = {
  of: of<RegistrationId>("RegistrationId", UUID_PATTERN),
  isValid: (value: string) => UUID_PATTERN.test(value),
};
export const LoginToken = {
  of: of<LoginToken>("LoginToken", LOGIN_TOKEN_PATTERN),
  isValid: (value: string) => LOGIN_TOKEN_PATTERN.test(value),
};
export const SessionId = {
  of: of<SessionId>("SessionId", SESSION_ID_PATTERN),
  isValid: (value: string) => SESSION_ID_PATTERN.test(value),
};
