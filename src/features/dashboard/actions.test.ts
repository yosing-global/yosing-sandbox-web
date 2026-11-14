// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { logout } from "./actions";

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  readSessionCookie: vi.fn(),
  deleteSessionCookie: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT ${url}`);
  }),
}));

vi.mock("@/server/container", () => ({ usecases: { logout: mocks.logout } }));
vi.mock("@/server/presentation/auth-cookies", () => ({
  readSessionCookie: mocks.readSessionCookie,
  deleteSessionCookie: mocks.deleteSessionCookie,
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

beforeEach(() => {
  vi.clearAllMocks();
});

const SESSION_ID = "dummy-session-id-0123456789";

describe("logout", () => {
  it("API でセッションを消してから Cookie を消し、/login へ", async () => {
    mocks.readSessionCookie.mockResolvedValue(SESSION_ID);

    await expect(logout()).rejects.toThrow("REDIRECT /login");

    expect(mocks.logout).toHaveBeenCalledWith(SESSION_ID);
    expect(mocks.deleteSessionCookie).toHaveBeenCalled();
    expect(mocks.logout.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.deleteSessionCookie.mock.invocationCallOrder[0]!,
    );
  });

  it("API が失敗しても、Cookie を消して /login へ", async () => {
    mocks.readSessionCookie.mockResolvedValue(SESSION_ID);
    mocks.logout.mockRejectedValue(new Error("dummy"));

    await expect(logout()).rejects.toThrow("REDIRECT /login");
    expect(mocks.deleteSessionCookie).toHaveBeenCalled();
  });

  it("セッションの Cookie が無ければ、API を呼ばずに /login へ", async () => {
    mocks.readSessionCookie.mockResolvedValue(null);

    await expect(logout()).rejects.toThrow("REDIRECT /login");
    expect(mocks.logout).not.toHaveBeenCalled();
    expect(mocks.deleteSessionCookie).toHaveBeenCalled();
  });
});
