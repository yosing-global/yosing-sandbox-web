import { FormField } from "@/components/form-field";
import { Input } from "@/components/ui/input";
import { fieldErrorMessage } from "@/shared/messages";
import type { FieldErrorKind } from "@/shared/validation";

// 6桁のコードの入力欄（登録の確定・ログインの確定で共通）
//   1つの入力欄。数字のキーボード（inputmode）と、スマホの自動入力（one-time-code）に対応する
type Props = {
  error?: FieldErrorKind;
  /** フォームの上のお知らせの id（入力欄に結びつける） */
  describedBy?: string;
};

export function OtpCodeField({ error, describedBy }: Props) {
  return (
    <FormField
      id="code"
      label="6桁のコード"
      hint="コードは30秒ごとに変わります"
      error={fieldErrorMessage("code", error)}
      describedBy={describedBy}
    >
      {(control) => (
        <Input
          {...control}
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          className="h-15 rounded-lg border-input bg-background pl-[0.5em] text-center font-mono text-[28px] tracking-[0.5em] md:text-[28px] aria-invalid:border-2 aria-invalid:border-danger aria-invalid:ring-0"
        />
      )}
    </FormField>
  );
}
