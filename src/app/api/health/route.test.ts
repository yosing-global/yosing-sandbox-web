import { describe, expect, it, vi } from "vitest";

// connection() は要求の中でしか呼べないため、テストでは何もしない関数に差し替える
vi.mock("next/server", () => ({ connection: async () => {} }));

import { GET } from "./route";

describe("GET /api/health", () => {
  it("200 と status: UP を返し、キャッシュさせない", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "UP" });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
