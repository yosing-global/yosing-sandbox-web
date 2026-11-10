// 認証の Cookie の名前と属性（proxy からも使うため、next/headers を使わないファイルに分ける）
//   __Host-：Secure・Path=/・Domain なしでないとブラウザーが保存しない
//   __Secure-：Secure でないと保存しない（仮認証は Path=/login に絞るため __Host- にできない）
//   消すときも、設定したときと同じ属性にする

export const SESSION_COOKIE = "__Host-session";
export const LOGIN_COOKIE = "__Secure-login";
export const LOGIN_COOKIE_PATH = "/login";

const BASE = { httpOnly: true, secure: true, sameSite: "lax" } as const;

/** セッションの Cookie の属性（期限は API の sessionExpiresAt をそのまま使う） */
export function sessionCookieOptions(expires: Date) {
  return { ...BASE, path: "/", expires };
}

/** セッションの Cookie を消すときの属性 */
export const DELETED_SESSION_COOKIE_OPTIONS = { ...BASE, path: "/", maxAge: 0 } as const;

/** 仮認証の Cookie の属性（期限は API の expiresAt をそのまま使う） */
export function loginCookieOptions(expires: Date) {
  return { ...BASE, path: LOGIN_COOKIE_PATH, expires };
}

/** 仮認証の Cookie を消すときの属性 */
export const DELETED_LOGIN_COOKIE_OPTIONS = {
  ...BASE,
  path: LOGIN_COOKIE_PATH,
  maxAge: 0,
} as const;
