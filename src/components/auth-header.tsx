import { Lock } from "lucide-react";

// 未ログインの画面・エラーの画面のヘッダー（ロゴだけ。ログイン中かどうかに関係なく出せる）
export function AuthHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border px-4 md:h-16 md:px-6">
      <div className="flex items-center gap-2 md:gap-2.5">
        <span className="flex size-[26px] items-center justify-center rounded-[7px] bg-primary md:size-7">
          <Lock aria-hidden="true" className="size-[15px] text-primary-foreground md:size-4" />
        </span>
        <span className="text-[17px] font-bold tracking-wide md:text-lg">sandbox</span>
      </div>
    </header>
  );
}
