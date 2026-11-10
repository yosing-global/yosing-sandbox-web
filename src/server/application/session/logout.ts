import type { SessionApi } from "@/server/application/port/session-api";
import type { SessionId } from "@/server/domain/values";

type Deps = { sessionApi: SessionApi };

/** ログアウトする（API のセッションを消す。Cookie の削除は呼ぶ側） */
export function logout({ sessionApi }: Deps) {
  return (sessionId: SessionId): Promise<void> => sessionApi.logout(sessionId);
}
