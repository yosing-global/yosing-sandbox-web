import "server-only";
import { cookies } from "next/headers";
import type { Session } from "@/server/domain/registration";

// 認証の Cookie（設計は CLAUDE.md の「Cookie」）
//   __Host-：Secure・Path=/・Domain なしでないとブラウザーが保存しない
//   __Secure-：Secure でないと保存しない（仮認証は Path=/login に絞るため __Host- にできない）

export const SESSION_COOKIE = "__Host-session";
export const LOGIN_COOKIE = "__Secure-login";
const LOGIN_COOKIE_PATH = "/login";

/** セッションの Cookie を設定する（期限は API の sessionExpiresAt をそのまま使う） */
export async function setSessionCookie(session: Session) {
  const store = await cookies();
  store.set(SESSION_COOKIE, session.sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt,
  });
}

/** 仮認証の Cookie を消す（属性は設定したときと同じにする） */
export async function deleteLoginCookie() {
  const store = await cookies();
  store.set(LOGIN_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: LOGIN_COOKIE_PATH,
    maxAge: 0,
  });
}

/**
 * 認証が済んだときの Cookie の入れ替え。認証の前の値を引き継がない（仮認証を消し、新しいセッションを設定する）
 */
export async function startAuthenticatedSession(session: Session) {
  await deleteLoginCookie();
  await setSessionCookie(session);
}
