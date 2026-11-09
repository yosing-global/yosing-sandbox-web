import type { LoginApi } from "@/server/application/port/login-api";
import type { VerifyLoginResult } from "@/server/domain/login";
import type { LoginToken, OtpCode } from "@/server/domain/values";

type Deps = { loginApi: LoginApi };

/** ログインを確定する（成功したらセッションを返す。Cookie はコントローラーが扱う） */
export function verifyLogin({ loginApi }: Deps) {
  return (loginToken: LoginToken, code: OtpCode): Promise<VerifyLoginResult> =>
    loginApi.verify(loginToken, code);
}
