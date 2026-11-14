// @vitest-environment node
import { Writable } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import { createLogger } from "./logger";

function capture() {
  const lines: Record<string, unknown>[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      lines.push(JSON.parse(chunk.toString()));
      callback();
    },
  });
  return { lines, stream };
}

describe("createLogger", () => {
  it("ECS 形式の JSON を出す", () => {
    vi.stubEnv("LOG_LEVEL", "info");
    const { lines, stream } = capture();
    createLogger(stream).info({ api: { operation: "dummyOperation" } }, "dummy message");

    expect(lines[0]).toMatchObject({
      "log.level": "info",
      message: "dummy message",
      "service.name": "sandbox-web",
      api: { operation: "dummyOperation" },
    });
    expect(lines[0]).toHaveProperty("@timestamp");
    vi.unstubAllEnvs();
  });

  it("秘密の値の項目は伏せる", () => {
    vi.stubEnv("LOG_LEVEL", "info");
    const { lines, stream } = capture();
    createLogger(stream).info(
      { password: "dummy-password", request: { sessionId: "dummy-session", cookie: "dummy" } },
      "dummy",
    );

    const line = JSON.stringify(lines[0]);
    expect(line).not.toContain("dummy-password");
    expect(line).not.toContain("dummy-session");
    expect(lines[0]).toMatchObject({
      password: "[REDACTED]",
      request: { sessionId: "[REDACTED]", cookie: "[REDACTED]" },
    });
    vi.unstubAllEnvs();
  });
});
