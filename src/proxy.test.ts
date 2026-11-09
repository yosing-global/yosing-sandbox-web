// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";

function request(method: string, cookie?: string) {
  return new NextRequest("https://dummy.local.sandbox.yosing.net:8090/login/verify", {
    method,
    headers: cookie ? { cookie } : {},
  });
}

describe("proxy（/login/verify）", () => {
  it("仮認証の Cookie が無ければ /login へ移す（Location は相対の URL）", () => {
    const response = proxy(request("GET"));

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!, "https://dummy").pathname).toBe("/login");
  });

  it("仮認証の Cookie があれば、そのまま開く", () => {
    const response = proxy(request("GET", "__Secure-login=dummy"));

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("POST（Server Action）は移さない（コントローラーが確かめる）", () => {
    const response = proxy(request("POST"));

    expect(response.headers.get("location")).toBeNull();
  });
});
