import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RegisterView } from "./RegisterView";

// E2E と同じく、役割と文言で探す
const base = { fieldErrors: {}, defaultLoginId: "", pending: false, action: vi.fn() };

describe("RegisterView", () => {
  it("通常：ステップ表示・入力欄（ラベル付き）・次へ・ログインへのリンク", () => {
    render(<RegisterView {...base} />);

    expect(screen.getByRole("list", { name: "登録の手順" })).toBeInTheDocument();
    expect(screen.getByText("ID・パスワード").closest("li")).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(screen.getByLabelText("ログイン ID")).toHaveAccessibleDescription(
      "英字・数字・_・- で3〜32文字",
    );
    expect(screen.getByLabelText("パスワード")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "次へ" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "ログイン" })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("パスワードの表示を切り替える（ボタンの名前は変えず、aria-pressed で示す）", async () => {
    render(<RegisterView {...base} />);
    const toggle = screen.getByRole("button", { name: "パスワードを表示" });

    await userEvent.click(toggle);

    expect(screen.getByLabelText("パスワード")).toHaveAttribute("type", "text");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  it("入力の誤り：入力欄の下に出し、入力欄に結びつける", () => {
    render(<RegisterView {...base} fieldErrors={{ loginId: "format", password: "required" }} />);

    const loginId = screen.getByLabelText("ログイン ID");
    expect(loginId).toBeInvalid();
    expect(loginId).toHaveAccessibleDescription("英字・数字・_・- の3〜32文字で入力してください");
    expect(screen.getByLabelText("パスワード")).toHaveAccessibleDescription(
      "英字・数字・記号の12〜64文字で入力してください",
    );
  });

  it.each([
    ["login-id-taken", "このログイン ID は使われています。別の ID にしてください。"],
    ["restart", "登録を完了できませんでした。最初からやり直してください。"],
  ] as const)("お知らせ（%s）は赤の枠", (notice, message) => {
    render(<RegisterView {...base} notice={notice} defaultLoginId="dummy_user" />);

    expect(screen.getByRole("alert")).toHaveTextContent(message);
    expect(screen.getByLabelText("ログイン ID")).toHaveValue("dummy_user");
  });

  it("送信中はボタンを押せない", () => {
    render(<RegisterView {...base} pending />);
    expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
  });
});
