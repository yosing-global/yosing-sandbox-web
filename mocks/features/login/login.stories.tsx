import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { LoginView } from "@/features/login/LoginView";
import { withAuthFrame } from "../../auth-frame";

const meta = {
  title: "画面/ログイン（ステップ1）",
  component: LoginView,
  decorators: [withAuthFrame],
  parameters: { layout: "fullscreen" },
  args: { fieldErrors: {}, defaultLoginId: "", pending: false, action: fn() },
} satisfies Meta<typeof LoginView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 通常: Story = {};

export const 入力の誤り: Story = {
  args: { fieldErrors: { loginId: "format", password: "format" }, defaultLoginId: "yo sing" },
};

export const IDかパスワードが違う: Story = {
  args: { notice: "invalid-credentials", defaultLoginId: "yosing" },
};

/** コードの誤りが続いた後（ステップ2から戻す） */
export const しばらく時間をおく: Story = {
  args: { notice: "retry-later" },
};

/** セッション切れ・仮認証の期限切れ（青） */
export const 期限切れ: Story = {
  args: { notice: "expired" },
};
