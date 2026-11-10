import { type NextRequest, NextResponse } from "next/server";
import { usecases } from "@/server/container";
import { SessionId } from "@/server/domain/values";
import {
  DELETED_SESSION_COOKIE_OPTIONS,
  LOGIN_COOKIE,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/server/presentation/cookie-names";
import { CURRENT_USER_HEADER, encodeCurrentUser } from "@/server/presentation/current-user-header";

// proxy（旧 middleware）：画面を開く前の振り分け（設計は Notion の「4.2 画面のURLとBFF」）
//   /                        ：ログイン中なら /dashboard、そうでなければ /login
//   /login・/register 等      ：ログイン中（セッションの Cookie がある）なら /dashboard。API には問い合わせない
//   /login/verify            ：仮認証の Cookie が無ければ /login
//   /dashboard               ：GET /v1/me でセッションを確かめ、Cookie の期限を延ばし、ユーザーを画面に渡す
//                              Cookie が無ければ /login、無効なら Cookie を消して /login?notice=expired
//   redirect の URL は request.url から作る（同じオリジンなら、Next.js が Location を相対の URL にする）
//   API の想定外の失敗（つながらない等）は投げる（Next.js が 500 を返す）

export async function proxy(request: NextRequest) {
  // 画面に渡すヘッダーは、ブラウザーから来たものを必ず消す（偽のユーザーを画面に出させない）
  const headers = new Headers(request.headers);
  headers.delete(CURRENT_USER_HEADER);
  const pass = () => NextResponse.next({ request: { headers } });
  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, request.url));

  // 画面を開くとき（GET・HEAD）だけ振り分ける
  //   Server Action（POST）を移すと、画面が応答を読めなくなる。POST はコントローラーが Cookie を確かめる
  if (request.method !== "GET" && request.method !== "HEAD") {
    return pass();
  }

  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;

  if (path === "/") {
    return redirectTo(sessionCookie === undefined ? "/login" : "/dashboard");
  }

  if (path === "/dashboard" || path.startsWith("/dashboard/")) {
    if (sessionCookie === undefined) {
      return redirectTo("/login");
    }
    const expired = () => {
      const response = redirectTo("/login?notice=expired");
      response.cookies.set(SESSION_COOKIE, "", DELETED_SESSION_COOKIE_OPTIONS);
      return response;
    };
    if (!SessionId.isValid(sessionCookie)) {
      return expired();
    }
    const result = await usecases.getCurrentUser(SessionId.of(sessionCookie));
    if (result.kind === "session-invalid") {
      return expired();
    }
    headers.set(CURRENT_USER_HEADER, encodeCurrentUser(result.user));
    const response = pass();
    // API が延ばした期限に、Cookie の期限をそろえる（Server Component の中では Cookie を書き換えられないため、ここで行う）
    response.cookies.set(
      SESSION_COOKIE,
      sessionCookie,
      sessionCookieOptions(result.sessionExpiresAt),
    );
    return response;
  }

  // ここから下は、未ログインの人向けの画面（/login・/login/verify・/register・/register/setup）
  if (sessionCookie !== undefined) {
    // Cookie があるかだけで判断する（無効なら /dashboard で分かり、/login に戻る）
    return redirectTo("/dashboard");
  }
  if (path === "/login/verify" && !request.cookies.has(LOGIN_COOKIE)) {
    return redirectTo("/login");
  }
  return pass();
}

export const config = {
  matcher: ["/", "/login/:path*", "/register/:path*", "/dashboard/:path*"],
};
