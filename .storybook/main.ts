import type { StorybookConfig } from "@storybook/nextjs-vite";
import tailwindcss from "@tailwindcss/vite";

// 画面モック（Storybook）。画面の部品を、API や Cookie なしで状態ごとに表示して確かめる
//   ストーリーは mocks/ に置く（本番のイメージには入れない）
const config: StorybookConfig = {
  framework: "@storybook/nextjs-vite",
  stories: ["../mocks/**/*.stories.tsx"],
  staticDirs: ["../public"],
  core: { disableTelemetry: true },
  // Next.js は Turbopack で Tailwind を処理するため、Storybook（Vite）では Vite のプラグインで処理する
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    return viteConfig;
  },
};

export default config;
