import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

// 層の依存の向き（domain ← application ← presentation / infrastructure）を import の制限で守らせる
//   詳細は Notion の「yosing-sandbox-web 内部設計」の「3. 層と責務」
//   層をまたぐ import は「@/」から書く（相対パスの「../」だと、どの層かを判定できないため）
const NEXT_AND_REACT = ["next", "next/*", "react", "react-dom", "react/*", "react-dom/*"];
const PRESENTATION = ["@/app/**", "@/features/**", "@/components/**", "@/server/presentation/**"];
const INFRASTRUCTURE = ["@/server/infrastructure/**"];
const WIRING = ["@/server/container", "@/server/config"];

const restrict = (files, groups, message) => ({
  files,
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          { group: groups, message },
          { group: ["../*"], message: "層をまたぐ import は「@/」から書く" },
        ],
      },
    ],
  },
});

const layerRules = [
  restrict(
    ["src/server/domain/**"],
    // 「@/server/** を禁じて domain だけ除く」は、gitignore の書き方の決まりで除けないため、層を並べる
    [
      ...NEXT_AND_REACT,
      ...PRESENTATION,
      ...INFRASTRUCTURE,
      ...WIRING,
      "@/server/application/**",
      "@/server/logger",
    ],
    "domain は domain と @/shared だけに依存する",
  ),
  restrict(
    ["src/server/application/**"],
    [...NEXT_AND_REACT, ...PRESENTATION, ...INFRASTRUCTURE, ...WIRING],
    "application は domain・port（application の中）だけに依存する",
  ),
  restrict(
    ["src/server/infrastructure/**"],
    [...NEXT_AND_REACT, ...PRESENTATION, "@/server/container"],
    "infrastructure は application の port・domain だけに依存する（Next.js・React を使わない）",
  ),
  restrict(
    [
      "src/app/**",
      "src/features/**",
      "src/components/**",
      "src/server/presentation/**",
      "src/proxy.ts",
    ],
    [...INFRASTRUCTURE],
    "presentation から infrastructure を直接使わない（@/server/container を通す）",
  ),
  restrict(
    ["src/shared/**"],
    ["@/server/**", ...PRESENTATION, "next", "next/*"],
    "shared は画面とサーバーの両方で使うため、他の層に依存しない",
  ),
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...layerRules,
  // shadcn/ui が生成する部品は、生成されたままにする（層の決まりの外）
  {
    files: ["src/components/ui/**"],
    rules: { "no-restricted-imports": "off" },
  },
  // 整形は Prettier に任せる（ESLint の整形のルールを切る）。最後に置く
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "storybook-static/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
