import type { ApiFieldError } from "@/server/domain/auth";
import type { FieldErrorKind } from "@/shared/validation";

/** API の VALIDATION_FAILED を、画面の項目ごとの誤りにする（知らない項目は無視する） */
export function toFieldErrors<K extends string>(
  errors: ApiFieldError[],
  fields: readonly K[],
): Partial<Record<K, FieldErrorKind>> {
  const result: Partial<Record<K, FieldErrorKind>> = {};
  for (const { field } of errors) {
    if ((fields as readonly string[]).includes(field)) {
      result[field as K] = "format";
    }
  }
  if (Object.keys(result).length === 0) {
    // 画面で出す場所が無い。入力の規則が API とずれているので、想定外として扱う
    throw new Error("VALIDATION_FAILED の項目が画面の入力欄に当たらない");
  }
  return result;
}
