import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    // App Router の部品（useRouter 等）を使えるようにする
    nextjs: { appDirectory: true },
    layout: "fullscreen",
  },
};

export default preview;
