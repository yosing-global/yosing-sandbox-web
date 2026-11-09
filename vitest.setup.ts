// toBeInTheDocument などの画面向けの確かめ方を使えるようにする
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// テストごとに描いた画面を片付ける（Vitest の globals を使わないため、自動では片付かない）
afterEach(() => {
  cleanup();
});

// server-only はブラウザー向けのコードから使うとビルドエラーにする印。テストでは何もしない
vi.mock("server-only", () => ({}));
