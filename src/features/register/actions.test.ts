// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { startRegistration, verifyRegistration } from "./actions";

// ユースケース・Cookie・redirect を偽物に差し替え、結果 → 画面の状態・移り先・Cookie の変換を確かめる
const mocks = vi.hoisted(() => ({
  startRegistration: vi.fn(),
  verifyRegistration: vi.fn(),
  startAuthenticatedSession: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT ${url}`);
  }),
}));

vi.mock("@/server/container", () => ({
  usecases: {
    startRegistration: mocks.startRegistration,
    verifyRegistration: mocks.verifyRegistration,
  },
}));
vi.mock("@/server/presentation/auth-cookies", () => ({
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
const REGISTRATION_ID = "7e4a2c9b-1d3f-4b6e-8a5c-9f2d0e1b3a7c";
const VALID = { loginId: "dummy_user", password: "dummy-password-01" };

describe("startRegistration", () => {
  it("入力の誤りは API を呼ばずに返す（ログイン ID は残す）", async () => {
    const state = await startRegistration(IDLE, form({ loginId: "a b", password: "" }));

    expect(state).toEqual({
      status: "error",
      fieldErrors: { loginId: "format", password: "required" },
      loginId: "a b",
    });
    expect(mocks.startRegistration).not.toHaveBeenCalled();
  });

  it("成功：設定の値を返す", async () => {
    mocks.startRegistration.mockResolvedValue({
      kind: "ok",
      registrationId: REGISTRATION_ID,
      qrCodeSvg: "<svg/>",
      setupKey: "DUMM YKEY",
    });

    const state = await startRegistration(IDLE, form(VALID));

    expect(mocks.startRegistration).toHaveBeenCalledWith("dummy_user", "dummy-password-01");
    expect(state).toEqual({
      status: "ok",
      setup: { registrationId: REGISTRATION_ID, qrCodeSvg: "<svg/>", setupKey: "DUMM YKEY" },
    });
  });

  it("ログイン ID が使われている：お知らせを出し、ログイン ID は残す（パスワードは返さない）", async () => {
    mocks.startRegistration.mockResolvedValue({ kind: "login-id-taken" });

    const state = await startRegistration(IDLE, form(VALID));

    expect(state).toEqual({
      status: "error",
      notice: "login-id-taken",
      fieldErrors: {},
      loginId: "dummy_user",
    });
    expect(JSON.stringify(state)).not.toContain(VALID.password);
  });

  it("VALIDATION_FAILED：項目ごとの誤りにする", async () => {
    mocks.startRegistration.mockResolvedValue({
      kind: "validation",
      errors: [{ field: "password" }],
    });

    const state = await startRegistration(IDLE, form(VALID));

    expect(state).toMatchObject({ status: "error", fieldErrors: { password: "format" } });
  });
});

describe("verifyRegistration", () => {
  it("成功：セッションの Cookie を設定して /dashboard へ", async () => {
    const session = { sessionId: "dummy-session-id", expiresAt: new Date() };
    mocks.verifyRegistration.mockResolvedValue({ kind: "ok", session });

    await expect(
      verifyRegistration(REGISTRATION_ID, IDLE, form({ code: "123456" })),
    ).rejects.toThrow("REDIRECT /dashboard");
    expect(mocks.verifyRegistration).toHaveBeenCalledWith(REGISTRATION_ID, "123456");
    expect(mocks.startAuthenticatedSession).toHaveBeenCalledWith(session);
  });

  it("コードの形式の誤りは API を呼ばずに返す", async () => {
    const state = await verifyRegistration(REGISTRATION_ID, IDLE, form({ code: "12345" }));

    expect(state).toEqual({ status: "error", fieldErrors: { code: "format" } });
    expect(mocks.verifyRegistration).not.toHaveBeenCalled();
  });

  it("コードが違う：お知らせを返す", async () => {
    mocks.verifyRegistration.mockResolvedValue({ kind: "otp-invalid" });

    const state = await verifyRegistration(REGISTRATION_ID, IDLE, form({ code: "123456" }));

    expect(state).toEqual({ status: "error", notice: "otp-invalid", fieldErrors: {} });
  });

  it.each([
    ["restart", "/register?notice=restart"],
    ["login-id-taken", "/register?notice=taken"],
  ])("%s：ステップ1に戻す（%s）", async (kind, url) => {
    mocks.verifyRegistration.mockResolvedValue({ kind });

    await expect(
      verifyRegistration(REGISTRATION_ID, IDLE, form({ code: "123456" })),
    ).rejects.toThrow(`REDIRECT ${url}`);
    expect(mocks.startAuthenticatedSession).not.toHaveBeenCalled();
  });

  it("登録 ID の形が違う：API を呼ばずにやり直し", async () => {
    await expect(verifyRegistration("../dummy", IDLE, form({ code: "123456" }))).rejects.toThrow(
      "REDIRECT /register?notice=restart",
    );
    expect(mocks.verifyRegistration).not.toHaveBeenCalled();
  });
});
