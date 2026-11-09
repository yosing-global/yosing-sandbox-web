// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiUnexpectedError, callApi } from "./api-client";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv("API_BASE_URL", "http://dummy-api.sandbox.internal:8080/");
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

function json(status: number, body: unknown, contentType = "application/json") {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": contentType } });
}

const getMe = { operation: "getMe", method: "GET", path: "/v1/me" } as const;

describe("callApi", () => {
  it("要求の形（URL・メソッド・本文・ヘッダー）", async () => {
    fetchMock.mockResolvedValue(json(200, { loginToken: "dummy" }));

    await callApi({
      operation: "startLogin",
      method: "POST",
      path: "/v1/logins",
      body: { loginId: "dummy_user", password: "dummy-password" },
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://dummy-api.sandbox.internal:8080/v1/logins");
    expect(init).toMatchObject({
      method: "POST",
      body: JSON.stringify({ loginId: "dummy_user", password: "dummy-password" }),
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    expect(init!.headers).not.toHaveProperty("Authorization");
  });

  it("セッション ID を Authorization: Bearer で渡す", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const result = await callApi({
      operation: "logout",
      method: "DELETE",
      path: "/v1/sessions/current",
      sessionId: "dummy-session-id",
    });

    expect(result).toEqual({ ok: true, status: 204, data: undefined });
    const init = fetchMock.mock.calls[0]![1]!;
    expect(init.headers).toMatchObject({ Authorization: "Bearer dummy-session-id" });
    expect(init.body).toBeUndefined();
  });

  it("成功は本文を返す", async () => {
    fetchMock.mockResolvedValue(json(200, { loginId: "dummy_user" }));

    expect(await callApi(getMe)).toEqual({
      ok: true,
      status: 200,
      data: { loginId: "dummy_user" },
    });
  });

  it("4xx の Problem Details は結果として返す（BFF が使う項目だけ）", async () => {
    fetchMock.mockResolvedValue(
      json(
        400,
        {
          type: "about:blank",
          title: "Bad Request",
          status: 400,
          detail: "dummy",
          code: "VALIDATION_FAILED",
          errors: [{ field: "loginId", message: "dummy" }, { field: 1 }],
        },
        "application/problem+json",
      ),
    );

    expect(await callApi(getMe)).toEqual({
      ok: false,
      problem: {
        status: 400,
        code: "VALIDATION_FAILED",
        errors: [{ field: "loginId", message: "dummy" }],
      },
    });
  });

  it("5xx は例外", async () => {
    fetchMock.mockResolvedValue(json(500, { status: 500, code: "INTERNAL_ERROR" }));

    await expect(callApi(getMe)).rejects.toMatchObject({
      name: "ApiUnexpectedError",
      status: 500,
      code: "INTERNAL_ERROR",
    });
  });

  it("code の無い 4xx は例外", async () => {
    fetchMock.mockResolvedValue(new Response("dummy", { status: 404 }));

    await expect(callApi(getMe)).rejects.toBeInstanceOf(ApiUnexpectedError);
  });

  it("本文が JSON でない成功は例外", async () => {
    fetchMock.mockResolvedValue(new Response("dummy", { status: 200 }));

    await expect(callApi(getMe)).rejects.toBeInstanceOf(ApiUnexpectedError);
  });

  it("つながらないときは例外", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    await expect(callApi(getMe)).rejects.toBeInstanceOf(ApiUnexpectedError);
  });

  it("API_BASE_URL が無いときは例外", async () => {
    vi.stubEnv("API_BASE_URL", "");

    await expect(callApi(getMe)).rejects.toThrow("API_BASE_URL");
  });
});
