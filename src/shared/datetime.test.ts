import { describe, expect, it } from "vitest";
import { formatDateTimeJst } from "./datetime";

describe("formatDateTimeJst", () => {
  it("UTC の日時を日本時間で表示する", () => {
    expect(formatDateTimeJst("2026-11-03T01:25:00Z")).toBe("2026年11月3日 10:25");
  });

  it("日付をまたぐ（UTC の 15 時以降は翌日）", () => {
    expect(formatDateTimeJst("2026-12-31T15:05:09.123Z")).toBe("2027年1月1日 0:05");
  });

  it("形式が違えば例外", () => {
    expect(() => formatDateTimeJst("dummy")).toThrow(RangeError);
  });
});
