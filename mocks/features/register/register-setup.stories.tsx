import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { RegisterSetupView } from "@/features/register/RegisterSetupView";
import { withAuthFrame } from "../../auth-frame";

// QR コードは仮の図（実物はサーバーで設定 URI から作る）
const DUMMY_QR_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 29" shape-rendering="crispEdges">' +
  '<rect width="29" height="29" fill="#fff"/>' +
  '<path fill="#0f172a" fill-rule="evenodd" d="M0 0h7v7H0zM1 1v5h5V1zM2 2h3v3H2zM22 0h7v7h-7zM23 1v5h5V1zM24 2h3v3h-3zM0 22h7v7H0zM1 23v5h5v-5zM2 24h3v3H2zM9 0h1v1H9zM12 3h2v1h-2zM10 5h1v2h-1zM8 8h2v1H8zM15 8h3v1h-3zM9 10h2v1H9zM16 12h2v2h-2zM13 14h2v1h-2zM20 14h2v1h-2zM9 18h4v1H9zM17 18h2v1h-2zM21 22h4v4h-4zM22 23v2h2v-2zM13 27h3v1h-3z"/>' +
  "</svg>";

const meta = {
  title: "画面/新規登録（ステップ2：認証アプリの設定）",
  component: RegisterSetupView,
  decorators: [withAuthFrame],
  parameters: { layout: "fullscreen" },
  args: {
    qrCodeSvg: DUMMY_QR_SVG,
    setupKey: "XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX",
    keyOpen: false,
    copied: false,
    onCopy: fn(),
    fieldErrors: {},
    pending: false,
    action: fn(),
  },
} satisfies Meta<typeof RegisterSetupView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const 通常PC: Story = {};

/** スマホでは「QR コードを読み取れない場合」を最初から開く */
export const 通常スマホ: Story = {
  args: { keyOpen: true },
  globals: { viewport: { value: "mobile2" } },
};

export const コードが違う: Story = {
  args: { notice: "otp-invalid" },
};

export const コードの形式の誤り: Story = {
  args: { fieldErrors: { code: "format" } },
};
