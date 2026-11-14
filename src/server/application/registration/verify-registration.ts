import type { RegistrationApi } from "@/server/application/port/registration-api";
import type { VerifyRegistrationResult } from "@/server/domain/registration";
import type { OtpCode, RegistrationId } from "@/server/domain/values";

type Deps = { registrationApi: RegistrationApi };

/** 登録を確定する（成功したらセッションを返す。Cookie はコントローラーが扱う） */
export function verifyRegistration({ registrationApi }: Deps) {
  return (registrationId: RegistrationId, code: OtpCode): Promise<VerifyRegistrationResult> =>
    registrationApi.verify(registrationId, code);
}
