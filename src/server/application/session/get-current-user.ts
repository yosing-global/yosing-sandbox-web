import type { SessionApi } from "@/server/application/port/session-api";
import type { GetCurrentUserResult } from "@/server/domain/session";
import type { SessionId } from "@/server/domain/values";

type Deps = { sessionApi: SessionApi };

/** ログイン中のユーザーを取得する（API がセッションの期限を延ばす。Cookie の延長は呼ぶ側） */
export function getCurrentUser({ sessionApi }: Deps) {
  return (sessionId: SessionId): Promise<GetCurrentUserResult> => sessionApi.me(sessionId);
}
