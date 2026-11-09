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
