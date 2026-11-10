import type { CurrentUser } from "@/server/domain/session";

// proxy が GET /v1/me で得たユーザーを、画面（Server Component）に渡すための要求ヘッダー
//   画面は API をもう一度呼ばない（呼ぶたびにセッションの期限が延びるため、1回の表示で1回だけにする）
//   ブラウザーが同じ名前のヘッダーを送ってきても使わないよう、proxy が必ず消してから付ける

export const CURRENT_USER_HEADER = "x-sandbox-current-user";

/**
 * proxy で GET /v1/me が想定外に失敗した（つながらない等）ことを、画面に伝える要求ヘッダー。
 * proxy の中で投げると Next.js の素の 500 になるため、画面で投げ直してエラーの画面（error.tsx）に出す
 */
export const CURRENT_USER_ERROR_HEADER = "x-sandbox-current-user-error";

/** ヘッダーの値にする（ヘッダーに入れられる文字だけにする） */
export function encodeCurrentUser(user: CurrentUser): string {
  return encodeURIComponent(
    JSON.stringify({ loginId: user.loginId, createdAt: user.createdAt.toISOString() }),
  );
}

/** ヘッダーの値を読む。無い・形が違うなら null */
export function decodeCurrentUser(value: string | null): CurrentUser | null {
  if (value === null) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(value));
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }
    const { loginId, createdAt } = parsed as { loginId?: unknown; createdAt?: unknown };
    const date = typeof createdAt === "string" ? new Date(createdAt) : null;
    if (typeof loginId !== "string" || date === null || isNaN(+date)) {
      return null;
    }
    return { loginId, createdAt: date };
  } catch {
    return null;
  }
}
