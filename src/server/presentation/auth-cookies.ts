import "server-only";
import { cookies } from "next/headers";
import type { Session } from "@/server/domain/auth";
import { LoginToken } from "@/server/domain/values";
import {
  LOGIN_COOKIE,
  LOGIN_COOKIE_PATH,
  SESSION_COOKIE,
} from "@/server/presentation/cookie-names";

// 認証の Cookie（設計は CLAUDE.md の「Cookie」）

export { LOGIN_COOKIE, SESSION_COOKIE };

const BASE = { httpOnly: true, secure: true, sameSite: "lax" } as const;

/** セッションの Cookie を設定する（期限は API の sessionExpiresAt をそのまま使う） */
export async function setSessionCookie(session: Session) {
  const store = await cookies();
  store.set(SESSION_COOKIE, session.sessionId, { ...BASE, path: "/", expires: session.expiresAt });
}

/** 仮認証の Cookie を設定する（期限は API の expiresAt をそのまま使う） */
export async function setLoginCookie(loginToken: LoginToken, expiresAt: Date) {
  const store = await cookies();
  store.set(LOGIN_COOKIE, loginToken, { ...BASE, path: LOGIN_COOKIE_PATH, expires: expiresAt });
}

/** 仮認証の Cookie の値。無い・形が違う（ブラウザーから来た値のため確かめる）なら null */
export async function readLoginCookie(): Promise<LoginToken | null> {
  const store = await cookies();
  const value = store.get(LOGIN_COOKIE)?.value;
  return value !== undefined && LoginToken.isValid(value) ? LoginToken.of(value) : null;
}

/** 仮認証の Cookie を消す（属性は設定したときと同じにする） */
export async function deleteLoginCookie() {
  const store = await cookies();
  store.set(LOGIN_COOKIE, "", { ...BASE, path: LOGIN_COOKIE_PATH, maxAge: 0 });
}

/**
 * 認証が済んだときの Cookie の入れ替え。認証の前の値を引き継がない（仮認証を消し、新しいセッションを設定する）
 */
export async function startAuthenticatedSession(session: Session) {
  await deleteLoginCookie();
  await setSessionCookie(session);
}
