"use client";

import { Eye, EyeOff } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// パスワードの入力欄（表示を切り替えるボタン付き）
//   ボタンの名前は「パスワードを表示」のまま変えず、表示中かは aria-pressed で示す（E2E が同じ名前で探せる）
type Props = Omit<ComponentProps<typeof Input>, "type">;

export function PasswordInput({ className, ...props }: Props) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className={cn("pr-13", className)} />
      <button
        type="button"
        aria-label="パスワードを表示"
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
        className="absolute top-0.5 right-0.5 flex size-11 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Icon aria-hidden="true" className="size-5" />
      </button>
    </div>
  );
}
