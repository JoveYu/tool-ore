import { describe, it, expect } from "vitest";
import { formatJson, minifyJson, sortObjectKeys } from "../src/tools/text/jsonUtils";

describe("JSON Formatter Utilities", () => {
  it("formats valid JSON with custom indentation", () => {
    const raw = '{"a":1,"b":[2,3]}';
    const res = formatJson(raw, { indent: 2 });
    expect(res.isValid).toBe(true);
    expect(res.formattedText).toContain('  "a": 1');
    expect(res.stats?.depth).toBe(3); // object -> array -> elements
    expect(res.stats?.keysCount).toBe(2);
  });

  it("sorts object keys alphabetically", () => {
    const raw = '{"z":1,"a":2,"m":{"y":1,"b":2}}';
    const res = formatJson(raw, { indent: 2, sortKeys: true });
    expect(res.isValid).toBe(true);
    const keys = Object.keys(JSON.parse(res.formattedText));
    expect(keys).toEqual(["a", "m", "z"]);
  });

  it("handles minification correctly", () => {
    const formatted = `{\n  "name": "test",\n  "count": 10\n}`;
    const res = minifyJson(formatted);
    expect(res.isValid).toBe(true);
    expect(res.formattedText).toBe('{"name":"test","count":10}');
    expect(res.stats?.lines).toBe(1);
  });

  it("detects syntax errors with position", () => {
    const invalid = '{"name": "test",}';
    const res = formatJson(invalid, { indent: 2 });
    expect(res.isValid).toBe(false);
    expect(res.error).toBeDefined();
  });
});
