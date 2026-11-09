import type { StartLoginResult, VerifyLoginResult } from "@/server/domain/login";
import type { LoginId, LoginToken, OtpCode, Password } from "@/server/domain/values";

/** API のログイン（POST /v1/logins・POST /v1/logins/verify） */
export interface LoginApi {
  start(loginId: LoginId, password: Password): Promise<StartLoginResult>;
  verify(loginToken: LoginToken, code: OtpCode): Promise<VerifyLoginResult>;
}
