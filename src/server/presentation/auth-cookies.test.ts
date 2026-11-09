// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { startAuthenticatedSession } from "./auth-cookies";

const set = vi.fn();
vi.mock("next/headers", () => ({ cookies: async () => ({ set }) }));

beforeEach(() => {
  set.mockReset();
});

describe("startAuthenticatedSession", () => {
  it("仮認証の Cookie を消し、セッションの Cookie を API の期限で設定する", async () => {
    const expiresAt = new Date("2026-11-03T13:25:10Z");

    await startAuthenticatedSession({ sessionId: "dummy-session-id", expiresAt });

    expect(set).toHaveBeenNthCalledWith(1, "__Secure-login", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/login",
      maxAge: 0,
    });
    expect(set).toHaveBeenNthCalledWith(2, "__Host-session", "dummy-session-id", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
  });
});
