import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ErrorView, NotFoundView } from "./error-views";

// E2E と同じく、役割と文言で探す
describe("ErrorView", () => {
  it("見出し・案内・もう一度試す・ホームに戻る（/ へ）。ヘッダーはロゴだけ", async () => {
    const onRetry = vi.fn();
    render(<ErrorView onRetry={onRetry} />);

    expect(screen.getByRole("heading", { level: 1, name: "エラーが発生しました" })).toBeVisible();
    expect(screen.getByText(/しばらく時間をおいてから、/)).toHaveTextContent(
      "しばらく時間をおいてから、もう一度お試しください。",
    );
    expect(screen.getByRole("link", { name: "ホームに戻る" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("banner")).toHaveTextContent("sandbox");
    expect(screen.queryByRole("button", { name: "ログアウト" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "もう一度試す" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("NotFoundView", () => {
  it("404・見出し・案内・ホームに戻る（/ へ）だけ", () => {
    render(<NotFoundView />);

    expect(screen.getByText("404")).toBeVisible();
    expect(screen.getByRole("heading", { level: 1, name: "ページが見つかりません" })).toBeVisible();
    expect(screen.getByText("URL が正しいか確かめてください。")).toBeVisible();
    expect(screen.getByRole("link", { name: "ホームに戻る" })).toHaveAttribute("href", "/");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
