import { describe, it, expect } from "vitest";
import {
  computeJsonDiff,
  compareJsonRecursive,
  formatValueForDisplay,
  SAMPLE_JSON_LEFT,
  SAMPLE_JSON_RIGHT,
} from "../src/tools/dev/jsonDiffUtils";

describe("JSON Diff Utilities", () => {
  it("detects identical JSON structures regardless of key order", () => {
    const jsonA = '{"name":"Alice","age":28}';
    const jsonB = '{"age":28,"name":"Alice"}';

    const result = computeJsonDiff(jsonA, jsonB, { ignoreKeyOrder: true });
    expect(result.isValid).toBe(true);
    expect(result.summary.isIdentical).toBe(true);
    expect(result.summary.totalDiffs).toBe(0);
  });

  it("identifies added, removed, and changed properties accurately", () => {
    const left = '{"id":1,"status":"pending","oldField":"remove"}';
    const right = '{"id":1,"status":"active","newField":"add"}';

    const result = computeJsonDiff(left, right);
    expect(result.isValid).toBe(true);
    expect(result.summary.addedCount).toBe(1);
    expect(result.summary.removedCount).toBe(1);
    expect(result.summary.changedCount).toBe(1);

    const changed = result.diffs.find((d) => d.path === "status");
    expect(changed?.oldValue).toBe("pending");
    expect(changed?.newValue).toBe("active");
  });

  it("detects differences inside nested objects and arrays", () => {
    const left = '{"user":{"tags":["a","b"]}}';
    const right = '{"user":{"tags":["a","c"]}}';

    const result = computeJsonDiff(left, right);
    expect(result.isValid).toBe(true);
    expect(result.diffs.length).toBe(1);
    expect(result.diffs[0].path).toBe("user.tags[1]");
    expect(result.diffs[0].oldValue).toBe("b");
    expect(result.diffs[0].newValue).toBe("c");
  });

  it("handles syntax errors gracefully", () => {
    const invalid = '{"broken": json}';
    const valid = '{"valid": true}';

    const result = computeJsonDiff(invalid, valid);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("左侧原始 JSON 语法错误");
  });

  it("compares sample JSON fixtures successfully", () => {
    const result = computeJsonDiff(SAMPLE_JSON_LEFT, SAMPLE_JSON_RIGHT);
    expect(result.isValid).toBe(true);
    expect(result.summary.totalDiffs).toBeGreaterThan(3);
  });
});
