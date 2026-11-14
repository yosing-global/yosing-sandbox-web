import { describe, expect, it } from "vitest";
import { decodeCurrentUser, encodeCurrentUser } from "./current-user-header";

describe("current-user-header", () => {
  it("ヘッダーの値にして、読み戻せる（ヘッダーに入れられる文字だけになる）", () => {
    const user = { loginId: "dummy_user", createdAt: new Date("2026-11-03T01:25:00Z") };

    const value = encodeCurrentUser(user);

    expect(value).toMatch(/^[\x21-\x7E]+$/);
    expect(decodeCurrentUser(value)).toEqual(user);
  });

  it.each([
    ["無い", null],
    ["JSON でない", "dummy"],
    ["項目が足りない", encodeURIComponent(JSON.stringify({ loginId: "dummy_user" }))],
    ["日時が読めない", encodeURIComponent(JSON.stringify({ loginId: "a", createdAt: "x" }))],
    ["% の誤り", "%E0%A4%A"],
  ])("%s なら null", (_name, value) => {
    expect(decodeCurrentUser(value)).toBeNull();
  });
});
