"use client";

import { Menu, UserRound, X } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import { DashboardNav } from "@/features/dashboard/DashboardNav";
import { LogoutButton, type LogoutAction } from "@/features/dashboard/LogoutButton";

// スマホのメニュー（ヘッダーの右のボタンで開く）。上にログイン中の ID、その下にメニュー、一番下にログアウト
//   PC（md 以上）では出さない（左の列とヘッダーに同じものがある）

const PANEL_ID = "dashboard-mobile-menu";

export function MobileMenu({
  loginId,
  logoutAction,
}: {
  loginId: string;
  logoutAction: LogoutAction;
}) {
  const [open, setOpen] = useState(false);

  // 画面から離れたら閉じる（Cache Components では、離れた画面を隠して残すため）
  useLayoutEffect(() => () => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        onClick={() => setOpen(!open)}
        className="flex size-12 cursor-pointer items-center justify-center border-0 bg-transparent text-slate-700"
      >
        {open ? (
          <X aria-hidden="true" className="size-6" />
        ) : (
          <Menu aria-hidden="true" className="size-6" />
        )}
      </button>
      {open && (
        <div
          id={PANEL_ID}
          className="fixed inset-x-0 top-14 bottom-0 z-40 flex flex-col gap-4 overflow-y-auto bg-background px-3 pt-4 pb-6"
        >
          <div className="flex items-center gap-2.5 border-b border-border px-3 pt-2 pb-4">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-info-soft text-link"
            >
              <UserRound className="size-5" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-xs text-subtle">ログイン中</span>
              <span className="text-[15px] font-bold break-all">{loginId}</span>
            </span>
          </div>
          <DashboardNav onNavigate={() => setOpen(false)} />
          <div className="mt-auto border-t border-border pt-4">
            <LogoutButton action={logoutAction} className="h-12 w-full text-[15px]" />
          </div>
        </div>
      )}
    </div>
  );
}
