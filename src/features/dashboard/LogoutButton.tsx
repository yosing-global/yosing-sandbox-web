"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ログアウトのボタン（確認はしない）。Server Action を呼ぶフォーム（JavaScript が無くても動く）
//   Server Action は外から受け取る（画面モック・テストで、サーバーの処理を読み込まないように）

export type LogoutAction = () => Promise<void>;

function Submit({ className }: { className?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending}
      className={cn("gap-1.5 border-slate-300 font-medium text-slate-700", className)}
    >
      <LogOut aria-hidden="true" className="size-4" />
      ログアウト
    </Button>
  );
}

export function LogoutButton({ action, className }: { action: LogoutAction; className?: string }) {
  return (
    <form action={action} className="m-0">
      <Submit className={className} />
    </form>
  );
}
