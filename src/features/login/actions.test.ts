// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { startLogin, verifyLogin } from "./actions";

// ユースケース・Cookie・redirect を偽物に差し替え、結果 → 画面の状態・移り先・Cookie の変換を確かめる
const mocks = vi.hoisted(() => ({
  startLogin: vi.fn(),
  verifyLogin: vi.fn(),
  setLoginCookie: vi.fn(),
  readLoginCookie: vi.fn(),
  deleteLoginCookie: vi.fn(),
  startAuthenticatedSession: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT ${url}`);
  }),
}));

vi.mock("@/server/container", () => ({
  usecases: { startLogin: mocks.startLogin, verifyLogin: mocks.verifyLogin },
}));
vi.mock("@/server/presentation/auth-cookies", () => ({
  setLoginCookie: mocks.setLoginCookie,
  readLoginCookie: mocks.readLoginCookie,
  deleteLoginCookie: mocks.deleteLoginCookie,
  startAuthenticatedSession: mocks.startAuthenticatedSession,
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

beforeEach(() => {
  vi.clearAllMocks();
});

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    data.set(key, value);
  }
  return data;
}

const IDLE = { status: "idle" } as const;
const TOKEN = "dummyheader.dummypayload.dummysignature";
const VALID = { loginId: "dummy_user", password: "dummy-password-01" };

describe("startLogin", () => {
  it("入力の誤りは API を呼ばずに返す（ログイン ID は残す）", async () => {
    const state = await startLogin(IDLE, form({ loginId: "a b", password: "" }));

    expect(state).toEqual({
      status: "error",
      fieldErrors: { loginId: "format", password: "required" },
      loginId: "a b",
    });
    expect(mocks.startLogin).not.toHaveBeenCalled();
  });

  it("成功：仮認証の Cookie を API の期限で設定し、/login/verify へ", async () => {
    const expiresAt = new Date("2026-11-03T01:28:45Z");
    mocks.startLogin.mockResolvedValue({ kind: "ok", loginToken: TOKEN, expiresAt });

    await expect(startLogin(IDLE, form(VALID))).rejects.toThrow("REDIRECT /login/verify");

    expect(mocks.startLogin).toHaveBeenCalledWith("dummy_user", "dummy-password-01");
    expect(mocks.setLoginCookie).toHaveBeenCalledWith(TOKEN, expiresAt);
  });

  it("ID かパスワードが違う：お知らせを出し、ログイン ID は残す（パスワードは返さない）", async () => {
    mocks.startLogin.mockResolvedValue({ kind: "invalid-credentials" });

    const state = await startLogin(IDLE, form(VALID));

    expect(state).toEqual({
      status: "error",
      notice: "invalid-credentials",
      fieldErrors: {},
      loginId: "dummy_user",
    });
    expect(mocks.setLoginCookie).not.toHaveBeenCalled();
  });

  it("VALIDATION_FAILED：項目ごとの誤りにする", async () => {
    mocks.startLogin.mockResolvedValue({ kind: "validation", errors: [{ field: "password" }] });

    const state = await startLogin(IDLE, form(VALID));

    expect(state).toEqual({
      status: "error",
      fieldErrors: { password: "format" },
      loginId: "dummy_user",
    });
  });
});

describe("verifyLogin", () => {
  it("仮認証の Cookie が無い：API を呼ばず、期限切れとしてログインへ", async () => {
    mocks.readLoginCookie.mockResolvedValue(null);

    await expect(verifyLogin(IDLE, form({ code: "123456" }))).rejects.toThrow(
      "REDIRECT /login?notice=expired",
    );
    expect(mocks.verifyLogin).not.toHaveBeenCalled();
  });

  it("入力の誤りは API を呼ばずに返す", async () => {
    mocks.readLoginCookie.mockResolvedValue(TOKEN);

    const state = await verifyLogin(IDLE, form({ code: "12a" }));

    expect(state).toEqual({ status: "error", fieldErrors: { code: "format" } });
    expect(mocks.verifyLogin).not.toHaveBeenCalled();
  });

  it("成功：Cookie を入れ替えて /dashboard へ", async () => {
    const session = { sessionId: "dummy-session-id", expiresAt: new Date("2026-11-03T13:25:10Z") };
    mocks.readLoginCookie.mockResolvedValue(TOKEN);
    mocks.verifyLogin.mockResolvedValue({ kind: "ok", session });

    await expect(verifyLogin(IDLE, form({ code: "123456" }))).rejects.toThrow(
      "REDIRECT /dashboard",
    );
    expect(mocks.verifyLogin).toHaveBeenCalledWith(TOKEN, "123456");
    expect(mocks.startAuthenticatedSession).toHaveBeenCalledWith(session);
  });

  it("コードが違う：お知らせを出す（Cookie はそのまま）", async () => {
    mocks.readLoginCookie.mockResolvedValue(TOKEN);
    mocks.verifyLogin.mockResolvedValue({ kind: "otp-invalid" });

    const state = await verifyLogin(IDLE, form({ code: "123456" }));

    expect(state).toEqual({ status: "error", notice: "otp-invalid", fieldErrors: {} });
    expect(mocks.deleteLoginCookie).not.toHaveBeenCalled();
  });

  it.each([
    ["login-token-invalid", "/login?notice=expired"],
    ["attempts-exceeded", "/login?notice=retry-later"],
  ])("%s：仮認証の Cookie を消して %s へ", async (kind, url) => {
    mocks.readLoginCookie.mockResolvedValue(TOKEN);
    mocks.verifyLogin.mockResolvedValue({ kind });

    await expect(verifyLogin(IDLE, form({ code: "123456" }))).rejects.toThrow(`REDIRECT ${url}`);
    expect(mocks.deleteLoginCookie).toHaveBeenCalled();
  });
});
