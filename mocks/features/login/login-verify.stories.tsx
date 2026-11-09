import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { LoginVerifyView } from "@/features/login/LoginVerifyView";
import { withAuthFrame } from "../../auth-frame";

const meta = {
  title: "画面/ログイン（ステップ2：認証コード）",
  component: LoginVerifyView,
  decorators: [withAuthFrame],
  parameters: { layout: "fullscreen" },
  args: { fieldErrors: {}, pending: false, action: fn() },
} satisfies Meta<typeof LoginVerifyView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 通常: Story = {};

export const コードが違う: Story = {
  args: { notice: "otp-invalid" },
};

export const コードの形式の誤り: Story = {
  args: { fieldErrors: { code: "format" } },
};
