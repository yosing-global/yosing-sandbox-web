import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// 入力欄の枠（ラベル・入力欄・下の案内または誤り）
//   誤りがあるときは、案内の代わりに誤りを出し、aria-describedby で入力欄に結びつける
//   入力欄そのものは children の関数で受け取り、結びつけに使う属性を渡す
export type FieldControlProps = {
  id: string;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
};

type Props = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  /** 入力欄の前に結びつけるもの（お知らせの枠の id 等） */
  describedBy?: string;
  children: (control: FieldControlProps) => ReactNode;
};

export function FormField({ id, label, hint, error, describedBy, children }: Props) {
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const ids = [describedBy, messageId].filter(Boolean).join(" ");
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": ids === "" ? undefined : ids,
      })}
      {(error ?? hint) && (
        <p
          id={messageId}
          className={cn("m-0 text-[13px] leading-relaxed", error ? "text-danger" : "text-subtle")}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

/** 入力欄の見た目（スマホで iOS が拡大しないよう、文字は 16px 以上） */
export const inputClassName =
  "h-12 rounded-lg border-input bg-background px-3.5 text-base md:text-base aria-invalid:border-2 aria-invalid:border-danger aria-invalid:ring-0";
