// 認証の Cookie の名前と Path（proxy からも使うため、next/headers を使わないファイルに分ける）
//   __Host-：Secure・Path=/・Domain なしでないとブラウザーが保存しない
//   __Secure-：Secure でないと保存しない（仮認証は Path=/login に絞るため __Host- にできない）

export const SESSION_COOKIE = "__Host-session";
export const LOGIN_COOKIE = "__Secure-login";
export const LOGIN_COOKIE_PATH = "/login";
