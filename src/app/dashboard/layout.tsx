import { Suspense } from "react";
import { UnmountWhenHidden } from "@/components/unmount-when-hidden";
import { logout } from "@/features/dashboard/actions";
import { DashboardShell } from "@/features/dashboard/DashboardShell";
import { requireCurrentUser } from "@/server/presentation/current-user";

// ログイン中の画面の枠（ヘッダー・メニュー）。ユーザーは、開く前に proxy が GET /v1/me で確かめて渡す（src/proxy.ts）
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    // 要求ごとに変わる値（要求ヘッダー）は、Suspense の中で読む（Cache Components の決まり）
    <Suspense>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

async function Shell({ children }: { children: React.ReactNode }) {
  const user = await requireCurrentUser();
  return (
    // 離れたら DOM から外す（ログアウトした後、隠れた画面にログイン ID 等を残さない）
    <UnmountWhenHidden>
      <DashboardShell loginId={user.loginId} logoutAction={logout}>
        {children}
      </DashboardShell>
    </UnmountWhenHidden>
  );
}
