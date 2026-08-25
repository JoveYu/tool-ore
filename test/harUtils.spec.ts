import { describe, it, expect } from "vitest";
import {
  parseHarJson,
  getResourceType,
  formatHarBytes,
  formatHarTime,
  filterHarEntries,
} from "../src/tools/dev/harUtils";

const SAMPLE_HAR = JSON.stringify({
  log: {
    version: "1.2",
    creator: { name: "WebInspector", version: "537.36" },
    pages: [{ title: "https://example.com/" }],
    entries: [
      {
        startedDateTime: "2026-08-25T12:00:00.000Z",
        time: 150.5,
        request: {
          method: "GET",
          url: "https://example.com/api/users?page=1",
          headers: [{ name: "Accept", value: "application/json" }],
          queryString: [{ name: "page", value: "1" }],
        },
        response: {
          status: 200,
          statusText: "OK",
          headers: [{ name: "Content-Type", value: "application/json; charset=utf-8" }],
          content: { size: 1024, mimeType: "application/json", text: '{"users":[]}' },
          bodySize: 850,
        },
        timings: { blocked: 0, dns: 10, connect: 20, ssl: 15, send: 5, wait: 80, receive: 20.5 },
      },
      {
        startedDateTime: "2026-08-25T12:00:00.200Z",
        time: 45.0,
        request: {
          method: "GET",
          url: "https://example.com/assets/style.css",
          headers: [],
        },
        response: {
          status: 404,
          statusText: "Not Found",
          headers: [{ name: "Content-Type", value: "text/css" }],
          content: { size: 250, mimeType: "text/css" },
          bodySize: 250,
        },
        timings: { blocked: 0, dns: 0, connect: 0, ssl: 0, send: 2, wait: 35, receive: 8 },
      },
    ],
  },
});

describe("HAR Utilities", () => {
  it("infers resource types accurately", () => {
    expect(getResourceType("application/json", "https://api.com/v1/data")).toBe("xhr");
    expect(getResourceType("application/javascript", "https://cdn.com/app.js")).toBe("js");
    expect(getResourceType("text/css", "https://cdn.com/main.css")).toBe("css");
    expect(getResourceType("image/png", "https://img.com/logo.png")).toBe("img");
    expect(getResourceType("text/html", "https://example.com/index.html")).toBe("doc");
  });

  it("formats bytes and duration strings correctly", () => {
    expect(formatHarBytes(500)).toBe("500 B");
    expect(formatHarBytes(1024 * 2.5)).toBe("2.5 KB");
    expect(formatHarBytes(1024 * 1024 * 5)).toBe("5.00 MB");

    expect(formatHarTime(50)).toBe("50 ms");
    expect(formatHarTime(1500)).toBe("1.50 s");
  });

  it("parses valid HAR JSON and calculates summaries", () => {
    const result = parseHarJson(SAMPLE_HAR);
    expect(result.summary.totalRequests).toBe(2);
    expect(result.summary.statusCounts["2xx"]).toBe(1);
    expect(result.summary.statusCounts["4xx"]).toBe(1);
    expect(result.entries.length).toBe(2);
    expect(result.entries[0].method).toBe("GET");
    expect(result.entries[0].resourceType).toBe("xhr");
    expect(result.entries[0].timings.wait).toBe(80);
  });

  it("filters entries by search query, status and type", () => {
    const { entries } = parseHarJson(SAMPLE_HAR);

    const xhrOnly = filterHarEntries(entries, "", "xhr", "all");
    expect(xhrOnly.length).toBe(1);
    expect(xhrOnly[0].url).toContain("/api/users");

    const errorsOnly = filterHarEntries(entries, "", "all", "4xx");
    expect(errorsOnly.length).toBe(1);
    expect(errorsOnly[0].status).toBe(404);

    const searchMatch = filterHarEntries(entries, "style", "all", "all");
    expect(searchMatch.length).toBe(1);
  });

  it("throws clear error for invalid HAR content", () => {
    expect(() => parseHarJson('{"invalid": true}')).toThrowError("无效的 HAR 文件格式");
  });
});
