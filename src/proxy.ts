import { type NextRequest, NextResponse } from "next/server";
import { LOGIN_COOKIE } from "@/server/presentation/cookie-names";

// proxy（旧 middleware）：画面を開く前の振り分け（設計は Notion の「4.2 画面のURLとBFF」）
//   今は /login/verify だけ。ログイン中の振り分け・/dashboard のセッションの延長は、ダッシュボードを作るときに足す
//   redirect の URL は request.url から作る（同じオリジンなら、Next.js が Location を相対の URL にする）

export function proxy(request: NextRequest) {
  // 画面を開くとき（GET・HEAD）だけ振り分ける
  //   Server Action（POST）を移すと、画面が応答を読めなくなる。POST はコントローラーが Cookie を確かめる
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }
  // 仮認証の Cookie が無い（期限切れ・URL の直打ち）なら、ログインのステップ1へ
  if (!request.cookies.has(LOGIN_COOKIE)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/login/verify",
};
