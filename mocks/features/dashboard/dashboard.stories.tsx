import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { DashboardHomeView } from "@/features/dashboard/DashboardHomeView";
import { DashboardShell } from "@/features/dashboard/DashboardShell";

// ダッシュボード（枠＋ホーム）。ログアウトは偽物（押しても何もしない）
function Dashboard({ loginId, createdAt }: { loginId: string; createdAt: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardShell loginId={loginId} logoutAction={fn(async () => {})}>
        <DashboardHomeView loginId={loginId} createdAt={createdAt} />
      </DashboardShell>
    </div>
  );
}

const meta = {
  title: "画面/ダッシュボード",
  component: Dashboard,
  parameters: { layout: "fullscreen" },
  args: { loginId: "yosing", createdAt: "2026年11月3日 10:25" },
} satisfies Meta<typeof Dashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 通常PC: Story = {};

/** スマホ：メニューはヘッダーの右のボタンで開く（ログイン ID・ログアウトはメニューの中） */
export const 通常スマホ: Story = {
  globals: { viewport: { value: "mobile2" } },
};

/** ログイン ID が長い（上限の32文字） */
export const 長いログインID: Story = {
  args: { loginId: "abcdefghijklmnopqrstuvwxyz_01234" },
};
