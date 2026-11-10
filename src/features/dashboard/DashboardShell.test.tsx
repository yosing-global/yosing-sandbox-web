import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DashboardHomeView } from "./DashboardHomeView";
import { DashboardShell } from "./DashboardShell";

function renderDashboard() {
  return render(
    <DashboardShell loginId="dummy_user" logoutAction={vi.fn()}>
      <DashboardHomeView loginId="dummy_user" createdAt="2026年11月3日 10:25" />
    </DashboardShell>,
  );
}

// E2E と同じく、役割と文言で探す（jsdom では CSS の md: が効かないため、PC・スマホの両方の部品がある）
describe("DashboardShell・DashboardHomeView", () => {
  it("ホーム：見出し・あいさつ・機能・アカウント（ログイン ID・登録した日時）", () => {
    renderDashboard();

    expect(screen.getByRole("heading", { level: 1, name: "ホーム" })).toBeInTheDocument();
    expect(screen.getByText("ようこそ、dummy_user さん。")).toBeInTheDocument();
    const features = screen.getByRole("region", { name: "機能" });
    expect(within(features).getByText("AAAAAA")).toBeInTheDocument();
    const account = screen.getByRole("region", { name: "アカウント" });
    expect(within(account).getByText("ログイン ID").nextSibling).toHaveTextContent("dummy_user");
    expect(within(account).getByText("登録した日時").nextSibling).toHaveTextContent(
      "2026年11月3日 10:25",
    );
  });

  it("メニュー：ホームが今の画面。画面がまだ無い機能はリンクにしない", () => {
    renderDashboard();

    const nav = screen.getByRole("navigation", { name: "メニュー" });
    expect(within(nav).getByRole("link", { name: "ホーム" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(nav).getByRole("link", { name: "ホーム" })).toHaveAttribute("href", "/dashboard");
    expect(within(nav).queryByRole("link", { name: "AAAAAA" })).not.toBeInTheDocument();
  });

  it("ヘッダー：ログイン ID とログアウトのボタン", () => {
    renderDashboard();

    const header = screen.getByRole("banner");
    expect(within(header).getByText("dummy_user")).toBeInTheDocument();
    expect(within(header).getByRole("button", { name: "ログアウト" })).toBeEnabled();
  });

  it("スマホのメニュー：ボタンで開き、ログイン中の ID・メニュー・ログアウトを出す。閉じるボタンで閉じる", async () => {
    renderDashboard();
    const open = screen.getByRole("button", { name: "メニューを開く" });
    expect(open).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(open);

    const close = screen.getByRole("button", { name: "メニューを閉じる" });
    expect(close).toHaveAttribute("aria-expanded", "true");
    const panel = document.getElementById(close.getAttribute("aria-controls")!)!;
    expect(within(panel).getByText("ログイン中")).toBeInTheDocument();
    expect(within(panel).getByText("dummy_user")).toBeInTheDocument();
    expect(within(panel).getByRole("navigation", { name: "メニュー" })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: "ログアウト" })).toBeInTheDocument();

    await userEvent.click(close);
    expect(screen.getByRole("button", { name: "メニューを開く" })).toBeInTheDocument();
    expect(document.getElementById(close.getAttribute("aria-controls")!)).toBeNull();
  });

  it("スマホのメニュー：Escape で閉じる", async () => {
    renderDashboard();
    await userEvent.click(screen.getByRole("button", { name: "メニューを開く" }));

    await userEvent.keyboard("{Escape}");

    expect(screen.getByRole("button", { name: "メニューを開く" })).toBeInTheDocument();
  });
});
