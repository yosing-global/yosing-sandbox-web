import "server-only";
import type { RegistrationApi } from "@/server/application/port/registration-api";
import type {
  ApiFieldError,
  RegistrationStartResult,
  VerifyRegistrationResult,
} from "@/server/domain/registration";
import { RegistrationId } from "@/server/domain/values";
import {
  type ApiProblem,
  ApiUnexpectedError,
  callApi,
} from "@/server/infrastructure/api/api-client";

// API の新規登録の呼び出し。code → 結果の型の変換はここで行う（知らない code は想定外として投げる）

type StartResponse = { registrationId?: unknown; otpauthUri?: unknown };
type VerifyResponse = { sessionId?: unknown; sessionExpiresAt?: unknown };

function fieldErrors(problem: ApiProblem): ApiFieldError[] {
  return (problem.errors ?? []).map(({ field }) => ({ field }));
}

export const registrationApiClient: RegistrationApi = {
  async start(loginId, password): Promise<RegistrationStartResult> {
    const operation = "startRegistration";
    const result = await callApi<StartResponse>({
      operation,
      method: "POST",
      path: "/v1/registrations",
      body: { loginId, password },
    });
    if (result.ok) {
      const { registrationId, otpauthUri } = result.data;
      if (
        typeof registrationId !== "string" ||
        !RegistrationId.isValid(registrationId) ||
        typeof otpauthUri !== "string"
      ) {
        throw new ApiUnexpectedError(operation, result.status);
      }
      return { kind: "ok", registrationId: RegistrationId.of(registrationId), otpauthUri };
    }
    switch (result.problem.code) {
      case "LOGIN_ID_TAKEN":
        return { kind: "login-id-taken" };
      case "VALIDATION_FAILED":
        return { kind: "validation", errors: fieldErrors(result.problem) };
      default:
        throw new ApiUnexpectedError(operation, result.problem.status, result.problem.code);
    }
  },

  async verify(registrationId, code): Promise<VerifyRegistrationResult> {
    const operation = "verifyRegistration";
    const result = await callApi<VerifyResponse>({
      operation,
      method: "POST",
      path: `/v1/registrations/${encodeURIComponent(registrationId)}/verify`,
      body: { code },
    });
    if (result.ok) {
      const { sessionId, sessionExpiresAt } = result.data;
      const expiresAt = typeof sessionExpiresAt === "string" ? new Date(sessionExpiresAt) : null;
      if (typeof sessionId !== "string" || sessionId === "" || !expiresAt || isNaN(+expiresAt)) {
        throw new ApiUnexpectedError(operation, result.status);
      }
      return { kind: "ok", session: { sessionId, expiresAt } };
    }
    switch (result.problem.code) {
      case "OTP_INVALID":
        return { kind: "otp-invalid" };
      case "REGISTRATION_NOT_FOUND":
      case "OTP_ATTEMPTS_EXCEEDED":
        return { kind: "restart" };
      case "LOGIN_ID_TAKEN":
        return { kind: "login-id-taken" };
      case "VALIDATION_FAILED":
        return { kind: "validation", errors: fieldErrors(result.problem) };
      default:
        throw new ApiUnexpectedError(operation, result.problem.status, result.problem.code);
    }
  },
};
