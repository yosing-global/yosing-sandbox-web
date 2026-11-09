import type { LoginApi } from "@/server/application/port/login-api";
import type { StartLoginResult } from "@/server/domain/login";
import type { LoginId, Password } from "@/server/domain/values";

type Deps = { loginApi: LoginApi };

/** ログインを始める（成功したら仮認証 JWT を返す。Cookie はコントローラーが扱う） */
export function startLogin({ loginApi }: Deps) {
  return (loginId: LoginId, password: Password): Promise<StartLoginResult> =>
    loginApi.start(loginId, password);
}
