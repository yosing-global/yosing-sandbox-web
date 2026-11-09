import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RegisterSetupView } from "./RegisterSetupView";

const base = {
  qrCodeSvg: '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
  setupKey: "DUMM YKEY",
  keyOpen: false,
  copied: false,
  onCopy: vi.fn(),
  fieldErrors: {},
  pending: false,
  action: vi.fn(),
};

describe("RegisterSetupView", () => {
  it("通常：ステップ2・QR コード（代替テキスト付き）・コードの入力欄・登録する", () => {
    render(<RegisterSetupView {...base} />);

    expect(screen.getByText("認証アプリの設定", { selector: "li" })).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(screen.getByText("（完了）")).toBeInTheDocument();
    const qr = screen.getByRole("img", { name: "認証アプリの設定用の QR コード" });
    expect(qr.getAttribute("src")).toMatch(/^data:image\/svg\+xml;base64,/);

    const code = screen.getByLabelText("6桁のコード");
    expect(code).toHaveAttribute("inputmode", "numeric");
    expect(code).toHaveAttribute("autocomplete", "one-time-code");
    expect(code).toHaveAccessibleDescription("コードは30秒ごとに変わります");
    expect(screen.getByRole("button", { name: "登録する" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "ID・パスワードの入力に戻る" })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("キー：PC では閉じ、開くとキーとコピーのボタンが出る", async () => {
    render(<RegisterSetupView {...base} />);
    const details = screen.getByText("QR コードを読み取れない場合").closest("details")!;
    expect(details).not.toHaveAttribute("open");

    await userEvent.click(screen.getByText("QR コードを読み取れない場合"));
    await userEvent.click(screen.getByRole("button", { name: "キーをコピー" }));

    expect(screen.getByLabelText("セットアップキー")).toHaveTextContent("DUMM YKEY");
    expect(base.onCopy).toHaveBeenCalled();
  });

  it("キー：スマホでは最初から開く。コピーしたら知らせる", () => {
    render(<RegisterSetupView {...base} keyOpen copied />);

    expect(screen.getByText("QR コードを読み取れない場合").closest("details")).toHaveAttribute(
      "open",
    );
    expect(screen.getByRole("status")).toHaveTextContent("コピーしました");
  });

  it("コードが違う：赤のお知らせを出し、入力欄に結びつける", () => {
    render(<RegisterSetupView {...base} notice="otp-invalid" />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "コードが違います。もう一度入力してください。",
    );
    expect(screen.getByLabelText("6桁のコード")).toHaveAccessibleDescription(
      "コードが違います。もう一度入力してください。 コードは30秒ごとに変わります",
    );
  });

  it("コードの形式の誤り：入力欄の下に出す", () => {
    render(<RegisterSetupView {...base} fieldErrors={{ code: "format" }} />);

    const code = screen.getByLabelText("6桁のコード");
    expect(code).toBeInvalid();
    expect(code).toHaveAccessibleDescription("数字6桁で入力してください");
  });
});
