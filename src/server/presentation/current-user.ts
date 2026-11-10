import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { CurrentUser } from "@/server/domain/session";
import { CURRENT_USER_HEADER, decodeCurrentUser } from "@/server/presentation/current-user-header";

/**
 * ログイン中のユーザー（proxy が GET /v1/me で確かめて、要求ヘッダーで渡したもの）。
 * proxy を通らずに来ることは無いが、無ければログイン画面へ移す（ログインしていない人に画面を出さない）。
 */
export async function requireCurrentUser(): Promise<CurrentUser> {
  const user = decodeCurrentUser((await headers()).get(CURRENT_USER_HEADER));
  if (user === null) {
    redirect("/login");
  }
  return user;
}
