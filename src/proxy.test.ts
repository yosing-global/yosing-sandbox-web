// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { decodeCurrentUser } from "@/server/presentation/current-user-header";
import { proxy } from "./proxy";

const getCurrentUser = vi.hoisted(() => vi.fn());
vi.mock("@/server/container", () => ({ usecases: { getCurrentUser } }));

beforeEach(() => {
  getCurrentUser.mockReset();
});

const ORIGIN = "https://dummy.local.sandbox.yosing.net:8090";
const SESSION_ID = "dummy-session-id-0123456789";
const SESSION = `__Host-session=${SESSION_ID}`;
const LOGIN = "__Secure-login=dummy";

function request(
  path: string,
  options: { method?: string; cookie?: string; headers?: Record<string, string> } = {},
) {
  return new NextRequest(`${ORIGIN}${path}`, {
    method: options.method ?? "GET",
    headers: { ...(options.cookie ? { cookie: options.cookie } : {}), ...options.headers },
  });
}

/** 移し先（Location は相対の URL になる） */
function location(response: Response) {
  const value = response.headers.get("location");
  if (value === null) {
    return null;
  }
  const url = new URL(value, ORIGIN);
  return `${url.pathname}${url.search}`;
}

/** proxy が画面に渡す要求ヘッダー（NextResponse.next の request.headers） */
function forwarded(response: Response, name: string) {
  return response.headers.get(`x-middleware-request-${name}`);
}

describe("/", () => {
  it.each([
    ["Cookie が無い", undefined, "/login"],
    ["セッションの Cookie がある", SESSION, "/dashboard"],
  ])("%s → %s", async (_name, cookie, expected) => {
    expect(location(await proxy(request("/", { cookie })))).toBe(expected);
  });
});

describe("未ログインの人向けの画面", () => {
  it.each(["/login", "/login/verify", "/register", "/register/setup"])(
    "セッションの Cookie があれば %s → /dashboard（API には問い合わせない）",
    async (path) => {
      expect(location(await proxy(request(path, { cookie: `${SESSION}; ${LOGIN}` })))).toBe(
        "/dashboard",
      );
      expect(getCurrentUser).not.toHaveBeenCalled();
    },
  );

  it.each(["/login", "/register", "/register/setup"])(
    "Cookie が無ければ %s を開く",
    async (path) => {
      const response = await proxy(request(path));

      expect(location(response)).toBeNull();
      expect(response.headers.get("x-middleware-next")).toBe("1");
    },
  );

  it("仮認証の Cookie が無い /login/verify → /login", async () => {
    expect(location(await proxy(request("/login/verify")))).toBe("/login");
  });

  it("仮認証の Cookie があれば /login/verify を開く", async () => {
    expect(location(await proxy(request("/login/verify", { cookie: LOGIN })))).toBeNull();
  });
});

describe("/dashboard", () => {
  it("セッションの Cookie が無い → /login（お知らせなし）", async () => {
    expect(location(await proxy(request("/dashboard")))).toBe("/login");
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it("成功：ユーザーを画面に渡し、セッションの Cookie を API の期限で設定し直す", async () => {
    const sessionExpiresAt = new Date("2026-11-03T13:25:10Z");
    getCurrentUser.mockResolvedValue({
      kind: "ok",
      user: { loginId: "dummy_user", createdAt: new Date("2026-11-03T01:25:00Z") },
      sessionExpiresAt,
    });

    const response = await proxy(request("/dashboard", { cookie: SESSION }));

    expect(getCurrentUser).toHaveBeenCalledWith(SESSION_ID);
    expect(location(response)).toBeNull();
    expect(decodeCurrentUser(forwarded(response, "x-sandbox-current-user"))).toEqual({
      loginId: "dummy_user",
      createdAt: new Date("2026-11-03T01:25:00Z"),
    });
    const cookie = response.headers.get("set-cookie")!;
    expect(cookie).toContain(`__Host-session=${SESSION_ID}`);
    expect(cookie).toContain(`Expires=${sessionExpiresAt.toUTCString()}`);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Secure/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).toContain("Path=/");
  });

  it("無効なセッション → Cookie を消して /login?notice=expired", async () => {
    getCurrentUser.mockResolvedValue({ kind: "session-invalid" });

    const response = await proxy(request("/dashboard", { cookie: SESSION }));

    expect(location(response)).toBe("/login?notice=expired");
    expect(response.headers.get("set-cookie")).toMatch(/__Host-session=;.*Max-Age=0/i);
  });

  it("形の違う Cookie → API を呼ばずに、期限切れと同じ扱い", async () => {
    const response = await proxy(request("/dashboard", { cookie: "__Host-session=a b" }));

    expect(location(response)).toBe("/login?notice=expired");
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it("API の想定外の失敗：投げずに、画面に失敗を伝える（エラーの画面に出す。Cookie はそのまま）", async () => {
    getCurrentUser.mockRejectedValue(new Error("dummy"));

    const response = await proxy(request("/dashboard", { cookie: SESSION }));

    expect(location(response)).toBeNull();
    expect(forwarded(response, "x-sandbox-current-user-error")).toBe("1");
    expect(forwarded(response, "x-sandbox-current-user")).toBeNull();
    expect(response.headers.get("set-cookie")).toBeNull();
  });
});

describe("共通", () => {
  it("ブラウザーが送ってきたユーザーのヘッダーは、画面に渡さない", async () => {
    const response = await proxy(
      request("/register", {
        headers: { "x-sandbox-current-user": "dummy", "x-sandbox-current-user-error": "1" },
      }),
    );

    expect(forwarded(response, "x-sandbox-current-user")).toBeNull();
    expect(forwarded(response, "x-sandbox-current-user-error")).toBeNull();
  });

  it("POST（Server Action）は移さない（コントローラーが確かめる）", async () => {
    const response = await proxy(request("/dashboard", { method: "POST" }));

    expect(location(response)).toBeNull();
    expect(getCurrentUser).not.toHaveBeenCalled();
  });
});
