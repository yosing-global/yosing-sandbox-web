// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginToken } from "@/server/domain/values";
import { readLoginCookie, setLoginCookie, startAuthenticatedSession } from "./auth-cookies";

const set = vi.fn();
const get = vi.fn();
vi.mock("next/headers", () => ({ cookies: async () => ({ set, get }) }));

beforeEach(() => {
  set.mockReset();
  get.mockReset();
});

const TOKEN = "dummyheader.dummypayload.dummysignature";

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

describe("setLoginCookie", () => {
  it("仮認証の Cookie を Path=/login・API の期限で設定する", async () => {
    const expiresAt = new Date("2026-11-03T01:28:45Z");

    await setLoginCookie(LoginToken.of(TOKEN), expiresAt);

    expect(set).toHaveBeenCalledWith("__Secure-login", TOKEN, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/login",
      expires: expiresAt,
    });
  });
});

describe("readLoginCookie", () => {
  it("値を返す", async () => {
    get.mockReturnValue({ value: TOKEN });

    expect(await readLoginCookie()).toBe(TOKEN);
    expect(get).toHaveBeenCalledWith("__Secure-login");
  });

  it.each([
    ["無い", undefined],
    ["形が違う", { value: "not a jwt" }],
  ])("%s なら null", async (_name, cookie) => {
    get.mockReturnValue(cookie);

    expect(await readLoginCookie()).toBeNull();
  });
});
