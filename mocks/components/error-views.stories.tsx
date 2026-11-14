import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ErrorView, NotFoundView } from "@/components/error-views";

// エラーの画面（500）・ページが見つからない（404）
function ErrorPages({ kind }: { kind: "error" | "not-found" }) {
  return (
    <div className="flex min-h-screen flex-col">
      {kind === "error" ? <ErrorView onRetry={fn()} /> : <NotFoundView />}
    </div>
  );
}

const meta = {
  title: "画面/エラー",
  component: ErrorPages,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ErrorPages>;

export default meta;
type Story = StoryObj<typeof meta>;

export const エラーPC: Story = { args: { kind: "error" } };

export const エラースマホ: Story = {
  args: { kind: "error" },
  globals: { viewport: { value: "mobile2" } },
};

export const ページが見つからないPC: Story = { args: { kind: "not-found" } };

export const ページが見つからないスマホ: Story = {
  args: { kind: "not-found" },
  globals: { viewport: { value: "mobile2" } },
};
