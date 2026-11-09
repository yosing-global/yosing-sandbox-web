import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Notice } from "@/components/notice";

const meta = {
  title: "部品/お知らせ",
  component: Notice,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Notice>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 赤：利用者の操作に原因があるもの */
export const Danger: Story = {
  args: { variant: "danger", children: "ログイン ID かパスワードが違います。" },
};

/** 青：利用者のせいではないもの */
export const Info: Story = {
  args: {
    variant: "info",
    children: "ログインの有効期限が切れました。もう一度ログインしてください。",
  },
};
