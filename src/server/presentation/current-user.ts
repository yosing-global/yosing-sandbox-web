import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { CurrentUser } from "@/server/domain/session";
import {
  CURRENT_USER_ERROR_HEADER,
  CURRENT_USER_HEADER,
  decodeCurrentUser,
} from "@/server/presentation/current-user-header";

/**
 * ログイン中のユーザー（proxy が GET /v1/me で確かめて、要求ヘッダーで渡したもの）。
 * proxy を通らずに来ることは無いが、無ければログイン画面へ移す（ログインしていない人に画面を出さない）。
 */
export async function requireCurrentUser(): Promise<CurrentUser> {
  const requestHeaders = await headers();
  if (requestHeaders.get(CURRENT_USER_ERROR_HEADER) !== null) {
    // proxy で API の呼び出しが想定外に失敗した（つながらない等）。エラーの画面（error.tsx）に出す
    throw new Error("ログイン中のユーザーを確かめられなかった（API の想定外の失敗）");
  }
  const user = decodeCurrentUser(requestHeaders.get(CURRENT_USER_HEADER));
  if (user === null) {
    redirect("/login");
  }
  return user;
}
