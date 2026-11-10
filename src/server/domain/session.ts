// ログイン中のセッションの型

/** ログイン中のユーザー（ダッシュボードに出す） */
export type CurrentUser = {
  loginId: string;
  /** 登録した日時 */
  createdAt: Date;
};

/** ログイン中のユーザーの取得の結果（取得のたびに、API がセッションの期限を延ばす） */
export type GetCurrentUserResult =
  | {
      kind: "ok";
      user: CurrentUser;
      /** 延ばした後のセッションの期限（API の sessionExpiresAt。Cookie の Expires にそのまま使う） */
      sessionExpiresAt: Date;
    }
  /** セッションが無い・期限切れ・ログアウト済み（SESSION_INVALID） */
  | { kind: "session-invalid" };
