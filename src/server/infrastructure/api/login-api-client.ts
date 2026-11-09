import "server-only";
import type { LoginApi } from "@/server/application/port/login-api";
import type { StartLoginResult, VerifyLoginResult } from "@/server/domain/login";
import { LoginToken } from "@/server/domain/values";
import { ApiUnexpectedError, callApi } from "@/server/infrastructure/api/api-client";
import { fieldErrors, parseDate, readSession } from "@/server/infrastructure/api/response";

// API のログインの呼び出し。code → 結果の型の変換はここで行う（知らない code は想定外として投げる）

type StartResponse = { loginToken?: unknown; expiresAt?: unknown };
type VerifyResponse = { sessionId?: unknown; sessionExpiresAt?: unknown };

export const loginApiClient: LoginApi = {
  async start(loginId, password): Promise<StartLoginResult> {
    const operation = "startLogin";
    const result = await callApi<StartResponse>({
      operation,
      method: "POST",
      path: "/v1/logins",
      body: { loginId, password },
    });
    if (result.ok) {
      const { loginToken } = result.data;
      const expiresAt = parseDate(result.data.expiresAt);
      if (typeof loginToken !== "string" || !LoginToken.isValid(loginToken) || expiresAt === null) {
        throw new ApiUnexpectedError(operation, result.status);
      }
      return { kind: "ok", loginToken: LoginToken.of(loginToken), expiresAt };
    }
    switch (result.problem.code) {
      case "INVALID_CREDENTIALS":
        return { kind: "invalid-credentials" };
      case "VALIDATION_FAILED":
        return { kind: "validation", errors: fieldErrors(result.problem) };
      default:
        throw new ApiUnexpectedError(operation, result.problem.status, result.problem.code);
    }
  },

  async verify(loginToken, code): Promise<VerifyLoginResult> {
    const operation = "verifyLogin";
    const result = await callApi<VerifyResponse>({
      operation,
      method: "POST",
      path: "/v1/logins/verify",
      body: { loginToken, code },
    });
    if (result.ok) {
      return { kind: "ok", session: readSession(operation, result.status, result.data) };
    }
    switch (result.problem.code) {
      case "OTP_INVALID":
        return { kind: "otp-invalid" };
      case "LOGIN_TOKEN_INVALID":
        return { kind: "login-token-invalid" };
      case "OTP_ATTEMPTS_EXCEEDED":
        return { kind: "attempts-exceeded" };
      case "VALIDATION_FAILED":
        return { kind: "validation", errors: fieldErrors(result.problem) };
      default:
        throw new ApiUnexpectedError(operation, result.problem.status, result.problem.code);
    }
  },
};
