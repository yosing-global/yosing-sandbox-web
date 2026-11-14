// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginId, LoginToken, OtpCode, Password } from "@/server/domain/values";
import { ApiUnexpectedError } from "./api-client";
import { loginApiClient } from "./login-api-client";

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

const TOKEN = "dummyheader.dummypayload.dummysignature";
const loginId = LoginId.of("dummy_user");
const password = Password.of("dummy-password-01");
const loginToken = LoginToken.of(TOKEN);
const code = OtpCode.of("123456");

describe("start", () => {
  it("成功：仮認証 JWT と期限を返す", async () => {
    fetchMock.mockResolvedValue(
      json(200, { loginToken: TOKEN, expiresAt: "2026-11-03T01:28:45Z" }),
    );

    const result = await loginApiClient.start(loginId, password);

    expect(result).toEqual({
      kind: "ok",
      loginToken: TOKEN,
      expiresAt: new Date("2026-11-03T01:28:45Z"),
    });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://dummy-api.sandbox.internal:8080/v1/logins");
    expect(init!.method).toBe("POST");
    expect(init!.body).toBe(JSON.stringify({ loginId, password }));
  });

  it.each([
    [401, { code: "INVALID_CREDENTIALS" }, { kind: "invalid-credentials" }],
    [
      400,
      { code: "VALIDATION_FAILED", errors: [{ field: "password", message: "dummy" }] },
      { kind: "validation", errors: [{ field: "password" }] },
    ],
  ])("想定した失敗（%i）は結果の型にする", async (status, body, expected) => {
    fetchMock.mockResolvedValue(json(status, body));

    expect(await loginApiClient.start(loginId, password)).toEqual(expected);
  });

  it.each([
    ["仮認証 JWT が無い", { expiresAt: "2026-11-03T01:28:45Z" }],
    ["仮認証 JWT の形が違う", { loginToken: "not a jwt", expiresAt: "2026-11-03T01:28:45Z" }],
    ["期限が読めない", { loginToken: TOKEN, expiresAt: "dummy" }],
  ])("成功の応答の形が違う（%s）なら、想定外として投げる", async (_name, body) => {
    fetchMock.mockResolvedValue(json(200, body));

    await expect(loginApiClient.start(loginId, password)).rejects.toThrow(ApiUnexpectedError);
  });

  it("知らない code は、想定外として投げる", async () => {
    fetchMock.mockResolvedValue(json(404, { code: "DUMMY" }));

    await expect(loginApiClient.start(loginId, password)).rejects.toThrow(ApiUnexpectedError);
  });
});

describe("verify", () => {
  it("成功：セッションを返す（仮認証 JWT は本文で渡す）", async () => {
    fetchMock.mockResolvedValue(
      json(200, { sessionId: "dummy-session-id", sessionExpiresAt: "2026-11-03T13:25:10Z" }),
    );

    const result = await loginApiClient.verify(loginToken, code);

    expect(result).toEqual({
      kind: "ok",
      session: { sessionId: "dummy-session-id", expiresAt: new Date("2026-11-03T13:25:10Z") },
    });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://dummy-api.sandbox.internal:8080/v1/logins/verify");
    expect(init!.body).toBe(JSON.stringify({ loginToken: TOKEN, code: "123456" }));
  });

  it.each([
    [401, { code: "OTP_INVALID", remainingAttempts: 3 }, { kind: "otp-invalid" }],
    [401, { code: "LOGIN_TOKEN_INVALID" }, { kind: "login-token-invalid" }],
    [429, { code: "OTP_ATTEMPTS_EXCEEDED" }, { kind: "attempts-exceeded" }],
    [
      400,
      { code: "VALIDATION_FAILED", errors: [{ field: "code", message: "dummy" }] },
      { kind: "validation", errors: [{ field: "code" }] },
    ],
  ])("想定した失敗（%i）は結果の型にする", async (status, body, expected) => {
    fetchMock.mockResolvedValue(json(status, body));

    expect(await loginApiClient.verify(loginToken, code)).toEqual(expected);
  });

  it("セッションの期限が読めなければ、想定外として投げる", async () => {
    fetchMock.mockResolvedValue(json(200, { sessionId: "dummy-session-id" }));

    await expect(loginApiClient.verify(loginToken, code)).rejects.toThrow(ApiUnexpectedError);
  });
});
