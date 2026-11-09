import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Notice } from "./notice";

describe("Notice", () => {
  it("赤は role=alert", () => {
    render(<Notice variant="danger">ログイン ID かパスワードが違います。</Notice>);

    expect(screen.getByRole("alert")).toHaveTextContent("ログイン ID かパスワードが違います。");
  });

  it("青は role=status", () => {
    render(<Notice variant="info">ログインの有効期限が切れました。</Notice>);

    expect(screen.getByRole("status")).toHaveTextContent("ログインの有効期限が切れました。");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
