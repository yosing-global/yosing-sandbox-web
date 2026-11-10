// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionId } from "@/server/domain/values";
import { ApiUnexpectedError } from "./api-client";
import { sessionApiClient } from "./session-api-client";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubEnv("API_BASE_URL", "http://dummy-api.sandbox.internal:8080");
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status });
}

const sessionId = SessionId.of("dummy-session-id-0123456789");

describe("me", () => {
  it("成功：ユーザーと延ばした後の期限を返す（セッション ID は Authorization で渡す）", async () => {
    fetchMock.mockResolvedValue(
      json(200, {
        loginId: "dummy_user",
        createdAt: "2026-11-03T01:25:10Z",
        sessionExpiresAt: "2026-11-07T15:00:00Z",
      }),
    );

    const result = await sessionApiClient.me(sessionId);

    expect(result).toEqual({
      kind: "ok",
      user: { loginId: "dummy_user", createdAt: new Date("2026-11-03T01:25:10Z") },
      sessionExpiresAt: new Date("2026-11-07T15:00:00Z"),
    });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://dummy-api.sandbox.internal:8080/v1/me");
    expect(init!.method).toBe("GET");
    expect((init!.headers as Record<string, string>).Authorization).toBe(`Bearer ${sessionId}`);
  });

  it("SESSION_INVALID は結果の型にする", async () => {
    fetchMock.mockResolvedValue(json(401, { code: "SESSION_INVALID" }));

    expect(await sessionApiClient.me(sessionId)).toEqual({ kind: "session-invalid" });
  });

  it.each([
    [
      "ログイン ID が無い",
      { createdAt: "2026-11-03T01:25:10Z", sessionExpiresAt: "2026-11-07T15:00:00Z" },
    ],
    ["期限が無い", { loginId: "dummy_user", createdAt: "2026-11-03T01:25:10Z" }],
  ])("成功の応答の形が違う（%s）なら、想定外として投げる", async (_name, body) => {
    fetchMock.mockResolvedValue(json(200, body));

    await expect(sessionApiClient.me(sessionId)).rejects.toThrow(ApiUnexpectedError);
  });
});

describe("logout", () => {
  it("204 なら成功（DELETE /v1/sessions/current）", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(sessionApiClient.logout(sessionId)).resolves.toBeUndefined();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://dummy-api.sandbox.internal:8080/v1/sessions/current");
    expect(init!.method).toBe("DELETE");
  });

  it("SESSION_INVALID も成功と同じに扱う（消すものが無い）", async () => {
    fetchMock.mockResolvedValue(json(401, { code: "SESSION_INVALID" }));

    await expect(sessionApiClient.logout(sessionId)).resolves.toBeUndefined();
  });

  it("5xx は想定外として投げる", async () => {
    fetchMock.mockResolvedValue(json(500, { code: "INTERNAL_ERROR" }));

    await expect(sessionApiClient.logout(sessionId)).rejects.toThrow(ApiUnexpectedError);
  });
});
