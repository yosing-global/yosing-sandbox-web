import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // コンテナ（ECS）で動かすため、必要なファイルだけを .next/standalone にまとめる
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  // 応答に X-Powered-By を付けない（使っている技術を外に知らせないため）
  poweredByHeader: false,
  // 画像の最適化（sharp）は使わない。ビルド（x86）と実行（arm64）で CPU が違い、
  // ネイティブのモジュールを入れ替えずに済むようにするため
  images: { unoptimized: true },
  outputFileTracingExcludes: {
    "*": ["node_modules/sharp/**", "node_modules/@img/**"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
