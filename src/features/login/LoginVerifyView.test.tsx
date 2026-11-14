import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LoginVerifyView } from "./LoginVerifyView";

// E2E と同じく、役割と文言で探す
const base = { fieldErrors: {}, pending: false, action: vi.fn() };

describe("LoginVerifyView", () => {
  it("通常：ステップ2・コードの入力欄・ログイン・入力に戻るリンク", () => {
    render(<LoginVerifyView {...base} />);

    expect(screen.getByText("認証コード").closest("li")).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("（完了）")).toBeInTheDocument();
    const code = screen.getByLabelText("6桁のコード");
    expect(code).toHaveAttribute("inputmode", "numeric");
    expect(code).toHaveAttribute("autocomplete", "one-time-code");
    expect(code).toHaveAccessibleDescription("コードは30秒ごとに変わります");
    expect(screen.getByRole("button", { name: "ログイン" })).toBeEnabled();
    expect(
      screen.getByRole("link", { name: "ログイン ID・パスワードの入力に戻る" }),
    ).toHaveAttribute("href", "/login");
  });

  it("コードの形式の誤り：入力欄の下に出す", () => {
    render(<LoginVerifyView {...base} fieldErrors={{ code: "format" }} />);

    const code = screen.getByLabelText("6桁のコード");
    expect(code).toBeInvalid();
    expect(code).toHaveAccessibleDescription("数字6桁で入力してください");
  });

  it("コードが違う：フォームの上に赤のお知らせを出し、入力欄に結びつける", () => {
    render(<LoginVerifyView {...base} notice="otp-invalid" />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "コードが違います。もう一度入力してください。",
    );
    expect(screen.getByLabelText("6桁のコード")).toHaveAccessibleDescription(
      /コードが違います。もう一度入力してください。.*コードは30秒ごとに変わります/,
    );
  });

  it("送信中はボタンを押せない", () => {
    render(<LoginVerifyView {...base} pending />);
    expect(screen.getByRole("button", { name: "ログイン" })).toBeDisabled();
  });
});
