import { CircleAlert, Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// お知らせの枠（フォームの上に出す）
//   danger：赤。利用者の操作に原因があるもの（role="alert"）
//   info：青。利用者のせいではないもの（期限切れ等。role="status"）
//   E2E は role と文言で探す（CLAUDE.md の「画面の作りの決まり」）
type Props = {
  variant: "danger" | "info";
  children: ReactNode;
  className?: string;
};

export function Notice({ variant, children, className }: Props) {
  const Icon = variant === "danger" ? CircleAlert : Info;
  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm leading-relaxed",
        variant === "danger"
          ? "border-danger-border bg-danger-soft text-danger-strong"
          : "border-info-border bg-info-soft text-info",
        className,
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
