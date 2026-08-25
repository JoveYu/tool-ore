import { describe, it, expect } from "vitest";
import { HTTP_PRESETS, HttpRequestOptions } from "../src/tools/dev/httpTesterUtils";

describe("HTTP Request Tester Utilities", () => {
  it("provides standard test API presets", () => {
    expect(HTTP_PRESETS.length).toBeGreaterThan(2);
    expect(HTTP_PRESETS.some((p) => p.name.includes("JSONPlaceholder"))).toBe(true);
  });

  it("validates request options structure", () => {
    const opts: HttpRequestOptions = {
      url: "https://example.com/api",
      method: "POST",
      headers: [{ id: "1", key: "Content-Type", value: "application/json", enabled: true }],
      queryParams: [{ id: "1", key: "page", value: "1", enabled: true }],
      bodyType: "json",
      bodyContent: '{"test": 1}',
      timeoutMs: 5000,
    };
    expect(opts.method).toBe("POST");
    expect(opts.headers.length).toBe(1);
  });
});
