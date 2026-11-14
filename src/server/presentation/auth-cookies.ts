import "server-only";
import { cookies } from "next/headers";
import type { Session } from "@/server/domain/auth";
import { LoginToken, SessionId } from "@/server/domain/values";
import {
  DELETED_LOGIN_COOKIE_OPTIONS,
  DELETED_SESSION_COOKIE_OPTIONS,
  LOGIN_COOKIE,
  loginCookieOptions,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/server/presentation/cookie-names";

// 認証の Cookie（Server Action から使う。設計は CLAUDE.md の「Cookie」）

export { LOGIN_COOKIE, SESSION_COOKIE };

/** セッションの Cookie を設定する（期限は API の sessionExpiresAt をそのまま使う） */
export async function setSessionCookie(session: Session) {
  const store = await cookies();
  store.set(SESSION_COOKIE, session.sessionId, sessionCookieOptions(session.expiresAt));
}

/** セッションの Cookie の値。無い・形が違う（ブラウザーから来た値のため確かめる）なら null */
export async function readSessionCookie(): Promise<SessionId | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  return value !== undefined && SessionId.isValid(value) ? SessionId.of(value) : null;
}

/** セッションの Cookie を消す */
export async function deleteSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", DELETED_SESSION_COOKIE_OPTIONS);
}

/** 仮認証の Cookie を設定する（期限は API の expiresAt をそのまま使う） */
export async function setLoginCookie(loginToken: LoginToken, expiresAt: Date) {
  const store = await cookies();
  store.set(LOGIN_COOKIE, loginToken, loginCookieOptions(expiresAt));
}

/** 仮認証の Cookie の値。無い・形が違う（ブラウザーから来た値のため確かめる）なら null */
export async function readLoginCookie(): Promise<LoginToken | null> {
  const store = await cookies();
  const value = store.get(LOGIN_COOKIE)?.value;
  return value !== undefined && LoginToken.isValid(value) ? LoginToken.of(value) : null;
}

/** 仮認証の Cookie を消す */
export async function deleteLoginCookie() {
  const store = await cookies();
  store.set(LOGIN_COOKIE, "", DELETED_LOGIN_COOKIE_OPTIONS);
}

/**
 * 認証が済んだときの Cookie の入れ替え。認証の前の値を引き継がない（仮認証を消し、新しいセッションを設定する）
 */
export async function startAuthenticatedSession(session: Session) {
  await deleteLoginCookie();
  await setSessionCookie(session);
}
