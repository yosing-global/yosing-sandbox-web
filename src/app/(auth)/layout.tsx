import { AuthHeader } from "@/components/auth-header";

// 未ログインの画面の枠（ロゴだけのヘッダー＋中央の幅 420px の列）
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AuthHeader />
      <main className="flex flex-1 justify-center px-4 pt-8 pb-12 md:pt-16">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>
    </>
  );
}
