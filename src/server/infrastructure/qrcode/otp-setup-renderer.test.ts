// @vitest-environment node
import { describe, expect, it } from "vitest";
import { formatSetupKey, otpSetupRenderer } from "./otp-setup-renderer";

const DUMMY_URI =
  "otpauth://totp/sandbox-dummy:dummy_user?secret=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP&issuer=sandbox-dummy&algorithm=SHA1&digits=6&period=30";

describe("otpSetupRenderer", () => {
  it("設定 URI から QR コードの SVG とキーを作る", async () => {
    const setup = await otpSetupRenderer.render(DUMMY_URI);

    expect(setup.qrCodeSvg).toMatch(/^<svg[^>]*xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    expect(setup.setupKey).toBe("JBSW Y3DP EHPK 3PXP JBSW Y3DP EHPK 3PXP");
  });

  it("キーの無い設定 URI は、URI を含めずに投げる", async () => {
    const uri = "otpauth://totp/sandbox-dummy:dummy_user?issuer=sandbox-dummy";
    await expect(otpSetupRenderer.render(uri)).rejects.toThrow("設定 URI からキーを取り出せない");
    await expect(otpSetupRenderer.render("not a uri")).rejects.not.toThrow(/not a uri/);
  });
});

describe("formatSetupKey", () => {
  it("大文字にして4文字ずつ区切る（端数はそのまま）", () => {
    expect(formatSetupKey("abcdefghij")).toBe("ABCD EFGH IJ");
  });
});
