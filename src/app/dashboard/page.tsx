import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardHomeView } from "@/features/dashboard/DashboardHomeView";
import { requireCurrentUser } from "@/server/presentation/current-user";
import { formatDateTimeJst } from "@/shared/datetime";

export const metadata: Metadata = { title: "ホーム" };

// /dashboard：ダッシュボードのホーム（API は呼ばない。proxy が渡したユーザーを出す）
export default function DashboardPage() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}

async function Home() {
  const user = await requireCurrentUser();
  return (
    <DashboardHomeView
      loginId={user.loginId}
      createdAt={formatDateTimeJst(user.createdAt.toISOString())}
    />
  );
}
