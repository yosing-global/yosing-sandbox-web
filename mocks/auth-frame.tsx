import type { Decorator } from "@storybook/nextjs-vite";
import { AuthHeader } from "@/components/auth-header";

// 未ログインの画面の枠（app/(auth)/layout.tsx と同じ並び）でストーリーを囲む
export const withAuthFrame: Decorator = (Story) => (
  <div className="flex min-h-screen flex-col">
    <AuthHeader />
    <main className="flex flex-1 justify-center px-4 pt-8 pb-12 md:pt-16">
      <div className="w-full max-w-[420px]">
        <Story />
      </div>
    </main>
  </div>
);
