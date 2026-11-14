// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { encodeCurrentUser } from "./current-user-header";
import { requireCurrentUser } from "./current-user";

const mocks = vi.hoisted(() => ({
  headers: new Headers(),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT ${url}`);
  }),
}));
vi.mock("next/headers", () => ({ headers: async () => mocks.headers }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

beforeEach(() => {
  mocks.headers = new Headers();
});

describe("requireCurrentUser", () => {
  it("proxy が渡したユーザーを返す", async () => {
    const user = { loginId: "dummy_user", createdAt: new Date("2026-11-03T01:25:00Z") };
    mocks.headers.set("x-sandbox-current-user", encodeCurrentUser(user));

    expect(await requireCurrentUser()).toEqual(user);
  });

  it("ユーザーが無ければ /login へ", async () => {
    await expect(requireCurrentUser()).rejects.toThrow("REDIRECT /login");
  });

  it("proxy で API が想定外に失敗していたら投げる（エラーの画面へ）", async () => {
    mocks.headers.set("x-sandbox-current-user-error", "1");

    await expect(requireCurrentUser()).rejects.toThrow("API の想定外の失敗");
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
