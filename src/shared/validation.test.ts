import { describe, expect, it } from "vitest";
import { z } from "zod";
import { loginIdSchema, otpCodeSchema, parseForm, passwordSchema } from "./validation";

describe("loginIdSchema", () => {
  it.each(["abc", "dummy_User-01", "a".repeat(32)])("受け付ける：%s", (value) => {
    expect(loginIdSchema.safeParse(value).success).toBe(true);
  });

  it.each(["ab", "a".repeat(33), "dummy user", "ダミー", "dummy@1"])("形式の誤り：%s", (value) => {
    const result = loginIdSchema.safeParse(value);
    expect(result.error?.issues[0]?.message).toBe("format");
  });

  it("空は required", () => {
    expect(loginIdSchema.safeParse("").error?.issues[0]?.message).toBe("required");
  });
});

describe("passwordSchema", () => {
  it.each(["dummy-pass-1", "dummy pass 12", "~".repeat(64)])("受け付ける：%s", (value) => {
    expect(passwordSchema.safeParse(value).success).toBe(true);
  });

  it.each(["dummy-pass1", "x".repeat(65), "dummy-passワード"])("形式の誤り：%s", (value) => {
    expect(passwordSchema.safeParse(value).error?.issues[0]?.message).toBe("format");
  });
});

describe("otpCodeSchema", () => {
  it("数字6桁を受け付ける", () => {
    expect(otpCodeSchema.safeParse("012345").success).toBe(true);
  });

  it.each(["12345", "1234567", "12345a", "１２３４５６"])("形式の誤り：%s", (value) => {
    expect(otpCodeSchema.safeParse(value).error?.issues[0]?.message).toBe("format");
  });
});

describe("parseForm", () => {
  const schema = z.object({ loginId: loginIdSchema, password: passwordSchema });

  it("正しい値を返す", () => {
    const formData = new FormData();
    formData.set("loginId", "dummy_user");
    formData.set("password", "dummy-password");
    expect(parseForm(schema, formData)).toEqual({
      ok: true,
      value: { loginId: "dummy_user", password: "dummy-password" },
    });
  });

  it("項目ごとに誤りの種類を返す（無い項目は required）", () => {
    const formData = new FormData();
    formData.set("loginId", "x");
    expect(parseForm(schema, formData)).toEqual({
      ok: false,
      fieldErrors: { loginId: "format", password: "required" },
    });
  });

  it("文字列でない値は無いものとして扱う", () => {
    const formData = new FormData();
    formData.set("loginId", new Blob(["dummy_user"]));
    formData.set("password", "dummy-password");
    expect(parseForm(schema, formData)).toEqual({
      ok: false,
      fieldErrors: { loginId: "required" },
    });
  });
});
