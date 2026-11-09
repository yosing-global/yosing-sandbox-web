import { describe, expect, it, vi } from "vitest";
import type { OtpSetupRenderer } from "@/server/application/port/otp-setup-renderer";
import type { RegistrationApi } from "@/server/application/port/registration-api";
import { LoginId, Password, RegistrationId } from "@/server/domain/values";
import { startRegistration } from "./start-registration";

const REGISTRATION_ID = RegistrationId.of("7e4a2c9b-1d3f-4b6e-8a5c-9f2d0e1b3a7c");
const loginId = LoginId.of("dummy_user");
const password = Password.of("dummy-password-01");

function fakes(result: Awaited<ReturnType<RegistrationApi["start"]>>) {
  const registrationApi: RegistrationApi = {
    start: vi.fn().mockResolvedValue(result),
    verify: vi.fn(),
  };
  const otpSetupRenderer: OtpSetupRenderer = {
    render: vi.fn().mockResolvedValue({ qrCodeSvg: "<svg/>", setupKey: "DUMM YKEY" }),
  };
  return { registrationApi, otpSetupRenderer };
}

describe("startRegistration", () => {
  it("成功：設定 URI を QR コードとキーにして返す（設定 URI は返さない）", async () => {
    const deps = fakes({
      kind: "ok",
      registrationId: REGISTRATION_ID,
      otpauthUri: "otpauth://dummy",
    });

    const result = await startRegistration(deps)(loginId, password);

    expect(deps.otpSetupRenderer.render).toHaveBeenCalledWith("otpauth://dummy");
    expect(result).toEqual({
      kind: "ok",
      registrationId: REGISTRATION_ID,
      qrCodeSvg: "<svg/>",
      setupKey: "DUMM YKEY",
    });
    expect(JSON.stringify(result)).not.toContain("otpauth");
  });

  it("失敗はそのまま返す（QR コードは作らない）", async () => {
    const deps = fakes({ kind: "login-id-taken" });

    await expect(startRegistration(deps)(loginId, password)).resolves.toEqual({
      kind: "login-id-taken",
    });
    expect(deps.otpSetupRenderer.render).not.toHaveBeenCalled();
  });
});
