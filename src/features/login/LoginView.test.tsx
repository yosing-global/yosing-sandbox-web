import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LoginView } from "./LoginView";

// E2E と同じく、役割と文言で探す
const base = { fieldErrors: {}, defaultLoginId: "", pending: false, action: vi.fn() };

describe("LoginView", () => {
  it("通常：ステップ表示・入力欄（ラベル付き）・次へ・新規登録へのリンク", () => {
    render(<LoginView {...base} />);

    expect(screen.getByRole("list", { name: "ログインの手順" })).toBeInTheDocument();
    expect(screen.getByText("パスワード", { selector: "li *, li" }).closest("li")).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(screen.getByLabelText("ログイン ID")).toHaveAccessibleDescription(
      "英字・数字・_・- で3〜32文字",
    );
    const password = screen.getByLabelText("パスワード", { selector: "input" });
    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByRole("button", { name: "次へ" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "新規登録" })).toHaveAttribute("href", "/register");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("入力の誤り：入力欄の下に出し、入力欄に結びつける", () => {
    render(<LoginView {...base} fieldErrors={{ loginId: "required", password: "format" }} />);

    const loginId = screen.getByLabelText("ログイン ID");
    expect(loginId).toBeInvalid();
    expect(loginId).toHaveAccessibleDescription("英字・数字・_・- の3〜32文字で入力してください");
    expect(screen.getByLabelText("パスワード", { selector: "input" })).toHaveAccessibleDescription(
      "英字・数字・記号の12〜64文字で入力してください",
    );
  });

  it.each([
    ["invalid-credentials", "ログイン ID かパスワードが違います。"],
    ["retry-later", "しばらく時間をおいてから、もう一度ログインしてください。"],
  ] as const)("お知らせ（%s）は赤の枠", (notice, message) => {
    render(<LoginView {...base} notice={notice} defaultLoginId="dummy_user" />);

    expect(screen.getByRole("alert")).toHaveTextContent(message);
    expect(screen.getByLabelText("ログイン ID")).toHaveValue("dummy_user");
    expect(screen.getByLabelText("パスワード", { selector: "input" })).toHaveValue("");
  });

  it("期限切れは青の枠（role=status）", () => {
    render(<LoginView {...base} notice="expired" />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "ログインの有効期限が切れました。もう一度ログインしてください。",
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("送信中はボタンを押せない", () => {
    render(<LoginView {...base} pending />);
    expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
  });
});
