import "server-only";
import type { SessionApi } from "@/server/application/port/session-api";
import type { GetCurrentUserResult } from "@/server/domain/session";
import { ApiUnexpectedError, callApi } from "@/server/infrastructure/api/api-client";
import { parseDate } from "@/server/infrastructure/api/response";

// API のセッションの呼び出し。code → 結果の型の変換はここで行う（知らない code は想定外として投げる）

type MeResponse = { loginId?: unknown; createdAt?: unknown; sessionExpiresAt?: unknown };

export const sessionApiClient: SessionApi = {
  async me(sessionId): Promise<GetCurrentUserResult> {
    const operation = "getCurrentUser";
    const result = await callApi<MeResponse>({
      operation,
      method: "GET",
      path: "/v1/me",
      sessionId,
    });
    if (result.ok) {
      const { loginId } = result.data;
      const createdAt = parseDate(result.data.createdAt);
      const sessionExpiresAt = parseDate(result.data.sessionExpiresAt);
      if (typeof loginId !== "string" || createdAt === null || sessionExpiresAt === null) {
        throw new ApiUnexpectedError(operation, result.status);
      }
      return { kind: "ok", user: { loginId, createdAt }, sessionExpiresAt };
    }
    if (result.problem.code === "SESSION_INVALID") {
      return { kind: "session-invalid" };
    }
    throw new ApiUnexpectedError(operation, result.problem.status, result.problem.code);
  },

  async logout(sessionId): Promise<void> {
    const operation = "logout";
    const result = await callApi<never>({
      operation,
      method: "DELETE",
      path: "/v1/sessions/current",
      sessionId,
    });
    // 既に無いセッションも 204。401 SESSION_INVALID は Authorization の形の誤りで、消すものが無いので成功と同じに扱う
    if (result.ok || result.problem.code === "SESSION_INVALID") {
      return;
    }
    throw new ApiUnexpectedError(operation, result.problem.status, result.problem.code);
  },
};
