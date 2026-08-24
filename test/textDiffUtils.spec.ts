import { describe, it, expect } from "vitest";
import { computeDiff, computeSideBySideLines } from "../src/tools/text/textDiffUtils";

describe("Text Diff Utilities", () => {
  it("computes line differences correctly", () => {
    const oldText = "Line 1\nLine 2\nLine 3";
    const newText = "Line 1\nLine 2 Modified\nLine 3\nLine 4";

    const diff = computeDiff(oldText, newText, { diffMode: "lines" });
    expect(diff.addedCount).toBeGreaterThanOrEqual(1);
    expect(diff.removedCount).toBeGreaterThanOrEqual(1);
  });

  it("supports word granularity with inline chunks", () => {
    const oldText = "const discount = 0.9;";
    const newText = "const discount = customDiscount || 0.85;";

    const lines = computeSideBySideLines(oldText, newText, { diffMode: "words" });
    expect(lines.length).toBe(1);
    expect(lines[0].oldChunks?.some((c) => c.type === "removed")).toBe(true);
    expect(lines[0].newChunks?.some((c) => c.type === "added")).toBe(true);
  });

  it("supports character granularity with inline chunks", () => {
    const oldText = "console.log('Total is: ' + total);";
    const newText = "console.log(`Final Total is: ${total}`);";

    const lines = computeSideBySideLines(oldText, newText, { diffMode: "chars" });
    expect(lines.length).toBe(1);
    expect(lines[0].oldChunks?.some((c) => c.type === "removed")).toBe(true);
    expect(lines[0].newChunks?.some((c) => c.type === "added")).toBe(true);
  });
});
