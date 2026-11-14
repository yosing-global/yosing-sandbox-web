import { Logo } from "@/components/logo";

// 未ログインの画面・エラーの画面のヘッダー（ロゴだけ。ログイン中かどうかに関係なく出せる）
export function AuthHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border px-4 md:h-16 md:px-6">
      <Logo />
    </header>
  );
}
