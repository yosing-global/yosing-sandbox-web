import { z } from "zod";

// 入力の規則（画面の事前の確認と、BFF のコントローラーの確認の両方で使う）
//   API（yosing-sandbox-api）の規則と同じにする。最終的な判定は API（VALIDATION_FAILED）
//   誤りの文言はここに書かず、誤りの種類（FieldErrorKind）だけを返す（文言は画面の側。正は Notion の「4.1 UI/UX設計」）

/** ログイン ID：3〜32文字の英字・数字・_・-（大文字は API が小文字にそろえる） */
export const LOGIN_ID_PATTERN = /^[A-Za-z0-9_-]{3,32}$/;
/** パスワード：12〜64文字の表示できる ASCII（空白を含む） */
export const PASSWORD_PATTERN = /^[\x20-\x7E]{12,64}$/;
/** 認証コード：数字6桁 */
export const OTP_CODE_PATTERN = /^[0-9]{6}$/;

/** 入力欄の誤りの種類。required：空、format：形式が違う */
export type FieldErrorKind = "required" | "format";

function field(pattern: RegExp) {
  return z
    .string({ error: "required" satisfies FieldErrorKind })
    .min(1, { error: "required" satisfies FieldErrorKind })
    .regex(pattern, { error: "format" satisfies FieldErrorKind });
}

export const loginIdSchema = field(LOGIN_ID_PATTERN);
export const passwordSchema = field(PASSWORD_PATTERN);
export const otpCodeSchema = field(OTP_CODE_PATTERN);

/** 入力の確かめの結果。誤りは項目ごとに最初の1つだけ */
export type FormParseResult<T> =
  { ok: true; value: T } | { ok: false; fieldErrors: Partial<Record<keyof T, FieldErrorKind>> };

/**
 * フォームの値（FormData）を確かめる。文字列でない値（ファイル等）は無いものとして扱う。
 */
export function parseForm<S extends z.ZodObject>(
  schema: S,
  formData: FormData,
): FormParseResult<z.infer<S>> {
  const input: Record<string, string> = {};
  for (const key of Object.keys(schema.shape)) {
    const value = formData.get(key);
    if (typeof value === "string") {
      input[key] = value;
    }
  }
  const result = schema.safeParse(input);
  if (result.success) {
    return { ok: true, value: result.data };
  }
  const fieldErrors: Partial<Record<keyof z.infer<S>, FieldErrorKind>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof z.infer<S>;
    if (key !== undefined && fieldErrors[key] === undefined) {
      fieldErrors[key] = issue.message === "format" ? "format" : "required";
    }
  }
  return { ok: false, fieldErrors };
}
