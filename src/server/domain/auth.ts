// 登録・ログインで共通の型

/** API の VALIDATION_FAILED の項目ごとの誤り（項目の名前は API のもの） */
export type ApiFieldError = { field: string };

export type Session = {
  sessionId: string;
  /** セッションの期限（API の sessionExpiresAt。Cookie の Expires にそのまま使う） */
  expiresAt: Date;
};
