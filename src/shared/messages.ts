import type { FieldErrorKind } from "@/shared/validation";

// 画面の文言（正は Notion の「4.1 UI/UX設計」。変えるときは 4.1 → E2E → web の順に直す）
//   E2E は文言で部品を探すため、ここを変えると E2E も直す必要がある

/** 入力欄の下の誤り（項目ごと）。空のときも形式の誤りと同じ文言で、規則を示す */
export const FIELD_ERROR_MESSAGES = {
  loginId: "英字・数字・_・- の3〜32文字で入力してください",
  password: "英字・数字・記号の12〜64文字で入力してください",
  code: "数字6桁で入力してください",
} as const satisfies Record<string, string>;

export type FormField = keyof typeof FIELD_ERROR_MESSAGES;

export function fieldErrorMessage(field: FormField, kind: FieldErrorKind | undefined) {
  return kind === undefined ? undefined : FIELD_ERROR_MESSAGES[field];
}

/** フォームの上のお知らせ */
export const NOTICE_MESSAGES = {
  loginIdTaken: "このログイン ID は使われています。別の ID にしてください。",
  registrationRestart: "登録を完了できませんでした。最初からやり直してください。",
  otpInvalid: "コードが違います。もう一度入力してください。",
  invalidCredentials: "ログイン ID かパスワードが違います。",
  /** ロックの後（「ロック」「15分」とは書かない） */
  retryLater: "しばらく時間をおいてから、もう一度ログインしてください。",
  /** セッション切れ・仮認証の期限切れ（同じ文言。青） */
  loginExpired: "ログインの有効期限が切れました。もう一度ログインしてください。",
} as const;
