import type { OtpSetupRenderer } from "@/server/application/port/otp-setup-renderer";
import type { RegistrationApi } from "@/server/application/port/registration-api";
import type { StartRegistrationResult } from "@/server/domain/registration";
import type { LoginId, Password } from "@/server/domain/values";

type Deps = { registrationApi: RegistrationApi; otpSetupRenderer: OtpSetupRenderer };

/**
 * 登録を始める。成功したら、設定 URI を QR コードとキーにして返す（設定 URI そのものは返さない）。
 */
export function startRegistration({ registrationApi, otpSetupRenderer }: Deps) {
  return async (loginId: LoginId, password: Password): Promise<StartRegistrationResult> => {
    const result = await registrationApi.start(loginId, password);
    if (result.kind !== "ok") {
      return result;
    }
    const setup = await otpSetupRenderer.render(result.otpauthUri);
    return { kind: "ok", registrationId: result.registrationId, ...setup };
  };
}
