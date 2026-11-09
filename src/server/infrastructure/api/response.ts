import "server-only";
import type { ApiFieldError, Session } from "@/server/domain/auth";
import { type ApiProblem, ApiUnexpectedError } from "@/server/infrastructure/api/api-client";

// API の応答の読み取りで、登録・ログインに共通のもの（形が違えば想定外として投げる）

/** VALIDATION_FAILED の項目ごとの誤り（API の文言は使わない） */
export function fieldErrors(problem: ApiProblem): ApiFieldError[] {
  return (problem.errors ?? []).map(({ field }) => ({ field }));
}

/** ISO 8601 の日時。読めなければ null */
export function parseDate(value: unknown): Date | null {
  if (typeof value !== "string") {
    return null;
  }
  const date = new Date(value);
  return isNaN(+date) ? null : date;
}

/** セッション（sessionId・sessionExpiresAt）を読む。登録の確定・ログインの確定の応答 */
export function readSession(
  operation: string,
  status: number,
  data: { sessionId?: unknown; sessionExpiresAt?: unknown },
): Session {
  const { sessionId } = data;
  const expiresAt = parseDate(data.sessionExpiresAt);
  if (typeof sessionId !== "string" || sessionId === "" || expiresAt === null) {
    throw new ApiUnexpectedError(operation, status);
  }
  return { sessionId, expiresAt };
}
