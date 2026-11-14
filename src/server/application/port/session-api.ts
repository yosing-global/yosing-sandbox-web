import type { GetCurrentUserResult } from "@/server/domain/session";
import type { SessionId } from "@/server/domain/values";

/** API のセッション（GET /v1/me・DELETE /v1/sessions/current） */
export interface SessionApi {
  me(sessionId: SessionId): Promise<GetCurrentUserResult>;
  /** セッションを終わらせる（既に無いセッションでも成功） */
  logout(sessionId: SessionId): Promise<void>;
}
