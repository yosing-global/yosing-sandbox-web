import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { RegisterView } from "@/features/register/RegisterView";
import { withAuthFrame } from "../../auth-frame";

const meta = {
  title: "画面/新規登録（ステップ1）",
  component: RegisterView,
  decorators: [withAuthFrame],
  parameters: { layout: "fullscreen" },
  args: { fieldErrors: {}, defaultLoginId: "", pending: false, action: fn() },
} satisfies Meta<typeof RegisterView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 通常: Story = {};

export const 入力の誤り: Story = {
  args: { fieldErrors: { loginId: "format", password: "format" }, defaultLoginId: "yo sing" },
};

export const ログインIDが使われている: Story = {
  args: { notice: "login-id-taken", defaultLoginId: "yosing" },
};

export const 最初からやり直し: Story = {
  args: { notice: "restart" },
};
