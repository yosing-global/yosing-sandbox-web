import type {
  RegistrationStartResult,
  VerifyRegistrationResult,
} from "@/server/domain/registration";
import type { LoginId, OtpCode, Password, RegistrationId } from "@/server/domain/values";

/** API の新規登録（POST /v1/registrations・POST /v1/registrations/{id}/verify） */
export interface RegistrationApi {
  start(loginId: LoginId, password: Password): Promise<RegistrationStartResult>;
  verify(registrationId: RegistrationId, code: OtpCode): Promise<VerifyRegistrationResult>;
}
