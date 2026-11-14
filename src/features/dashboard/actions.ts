"use server";

import { redirect } from "next/navigation";
import { usecases } from "@/server/container";
import { logger } from "@/server/logger";
import { deleteSessionCookie, readSessionCookie } from "@/server/presentation/auth-cookies";

// ダッシュボードのコントローラー（Server Action）

/** ログアウトする（API でセッションを消してから Cookie を消す。API が失敗しても Cookie は消す） */
export async function logout(): Promise<void> {
  const sessionId = await readSessionCookie();
  if (sessionId !== null) {
    try {
      await usecases.logout(sessionId);
    } catch (err) {
      // API の失敗の中身は callApi がログに出している。ここではログアウトを続けたことだけを残す
      logger.warn(
        { error: { type: err instanceof Error ? err.name : "unknown" } },
        "API のログアウトに失敗したが、Cookie を消してログアウトを続ける",
      );
    }
  }
  await deleteSessionCookie();
  redirect("/login");
}
