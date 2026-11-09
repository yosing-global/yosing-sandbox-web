import "server-only";

// 実行時の設定（タスク定義の環境変数）。ビルドの時に値を埋め込まないよう、使う時に読む
//   画面（Server Component）から読む場合は、先に connection() を呼んで、実行時に描かれるようにする

/** API の URL（例：http://dev-api.sandbox.internal:8080）。ブラウザーには渡さない */
export function apiBaseUrl(): string {
  const value = process.env.API_BASE_URL;
  if (!value) {
    throw new Error("環境変数 API_BASE_URL が無い");
  }
  return value.replace(/\/+$/, "");
}

/** アプリの環境（dev / test / pr<番号>）。手元では local */
export function appEnv(): string {
  return process.env.APP_ENV || "local";
}
