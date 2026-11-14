import { UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { DashboardNav } from "@/features/dashboard/DashboardNav";
import { LogoutButton, type LogoutAction } from "@/features/dashboard/LogoutButton";
import { MobileMenu } from "@/features/dashboard/MobileMenu";

// ログイン中の画面の枠：ヘッダー（ログイン ID・ログアウト）＋左のメニュー＋中身
//   スマホ：ヘッダーはロゴとメニューのボタンだけ（ログイン ID・ログアウトはメニューの中）

type Props = { loginId: string; logoutAction: LogoutAction; children: ReactNode };

export function DashboardShell({ loginId, logoutAction, children }: Props) {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border pr-1 pl-4 md:h-16 md:px-6">
        <Logo />
        <div className="hidden items-center gap-4 md:flex">
          <span className="flex items-center gap-2 text-sm text-slate-700">
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-full bg-info-soft text-link"
            >
              <UserRound className="size-[18px]" />
            </span>
            {loginId}
          </span>
          <LogoutButton action={logoutAction} className="h-10 px-3.5 text-sm" />
        </div>
        <MobileMenu loginId={loginId} logoutAction={logoutAction} />
      </header>
      <div className="flex flex-1">
        <div className="hidden w-[240px] shrink-0 border-r border-border bg-slate-50 px-3 py-6 md:block">
          <DashboardNav />
        </div>
        <main className="flex min-w-0 flex-1 flex-col gap-8 px-4 pt-7 pb-10 md:gap-10 md:px-12 md:py-10">
          {children}
        </main>
      </div>
    </>
  );
}
