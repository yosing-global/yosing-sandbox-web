// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginId, OtpCode, Password, RegistrationId } from "@/server/domain/values";
import { ApiUnexpectedError } from "./api-client";
import { registrationApiClient } from "./registration-api-client";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv("API_BASE_URL", "http://dummy-api.sandbox.internal:8080");
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status });
}

const REGISTRATION_ID = "7e4a2c9b-1d3f-4b6e-8a5c-9f2d0e1b3a7c";
const loginId = LoginId.of("dummy_user");
const password = Password.of("dummy-password-01");
const registrationId = RegistrationId.of(REGISTRATION_ID);
const code = OtpCode.of("123456");

describe("start", () => {
  it("成功：登録 ID と設定 URI を返す", async () => {
    fetchMock.mockResolvedValue(
      json(201, {
        registrationId: REGISTRATION_ID,
        otpauthUri: "otpauth://totp/dummy?secret=DUMMY",
        expiresAt: "2026-11-03T01:33:45Z",
      }),
    );

    const result = await registrationApiClient.start(loginId, password);

    expect(result).toEqual({
      kind: "ok",
      registrationId: REGISTRATION_ID,
      otpauthUri: "otpauth://totp/dummy?secret=DUMMY",
    });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://dummy-api.sandbox.internal:8080/v1/registrations");
    expect(init!.body).toBe(JSON.stringify({ loginId, password }));
  });

  it.each([
    [409, { code: "LOGIN_ID_TAKEN" }, { kind: "login-id-taken" }],
    [
      400,
      { code: "VALIDATION_FAILED", errors: [{ field: "loginId", message: "dummy" }] },
      { kind: "validation", errors: [{ field: "loginId" }] },
    ],
  ])("想定した失敗（%i）は結果の型にする", async (status, body, expected) => {
    fetchMock.mockResolvedValue(json(status, body));
    await expect(registrationApiClient.start(loginId, password)).resolves.toEqual(expected);
  });

  it("成功の応答の形が違う・知らない code は想定外", async () => {
    fetchMock.mockResolvedValueOnce(json(201, { registrationId: "not-uuid", otpauthUri: "x" }));
    await expect(registrationApiClient.start(loginId, password)).rejects.toThrow(
      ApiUnexpectedError,
    );

    fetchMock.mockResolvedValueOnce(json(401, { code: "DUMMY_UNKNOWN" }));
    await expect(registrationApiClient.start(loginId, password)).rejects.toThrow(
      ApiUnexpectedError,
    );
  });
});

describe("verify", () => {
  it("成功：セッション ID と期限を返す", async () => {
    fetchMock.mockResolvedValue(
      json(201, { sessionId: "dummy-session-id", sessionExpiresAt: "2026-11-03T13:25:10Z" }),
    );

    const result = await registrationApiClient.verify(registrationId, code);

    expect(result).toEqual({
      kind: "ok",
      session: { sessionId: "dummy-session-id", expiresAt: new Date("2026-11-03T13:25:10Z") },
    });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(
      `http://dummy-api.sandbox.internal:8080/v1/registrations/${REGISTRATION_ID}/verify`,
    );
    expect(init!.body).toBe(JSON.stringify({ code: "123456" }));
  });

  it.each([
    [401, { code: "OTP_INVALID", remainingAttempts: 3 }, { kind: "otp-invalid" }],
    [404, { code: "REGISTRATION_NOT_FOUND" }, { kind: "restart" }],
    [429, { code: "OTP_ATTEMPTS_EXCEEDED" }, { kind: "restart" }],
    [409, { code: "LOGIN_ID_TAKEN" }, { kind: "login-id-taken" }],
    [
      400,
      { code: "VALIDATION_FAILED", errors: [{ field: "code", message: "dummy" }] },
      { kind: "validation", errors: [{ field: "code" }] },
    ],
  ])("想定した失敗（%i）は結果の型にする", async (status, body, expected) => {
    fetchMock.mockResolvedValue(json(status, body));
    await expect(registrationApiClient.verify(registrationId, code)).resolves.toEqual(expected);
  });

  it("期限が日時でない応答は想定外", async () => {
    fetchMock.mockResolvedValue(json(201, { sessionId: "dummy", sessionExpiresAt: "dummy" }));
    await expect(registrationApiClient.verify(registrationId, code)).rejects.toThrow(
      ApiUnexpectedError,
    );
  });
});
