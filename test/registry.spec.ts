import { describe, it, expect } from "vitest";
import { CATEGORIES, TOOLS, getToolById, getToolsByCategory } from "../src/registry";

describe("Tool Registry System", () => {
  it("should have defined categories", () => {
    expect(CATEGORIES.length).toBeGreaterThan(0);
    expect(CATEGORIES.map((c) => c.id)).toContain("image");
    expect(CATEGORIES.map((c) => c.id)).toContain("text");
  });

  it("should find tools by ID", () => {
    const tool = getToolById("currency-to-chinese");
    expect(tool).toBeDefined();
    expect(tool?.name).toBe("大写金额转换");
    expect(tool?.category).toBe("text");
  });

  it("should find tools by category", () => {
    const textTools = getToolsByCategory("text");
    expect(textTools.length).toBeGreaterThanOrEqual(1);
    expect(textTools.every((t) => t.category === "text")).toBe(true);

    const imageTools = getToolsByCategory("image");
    expect(imageTools.length).toBeGreaterThanOrEqual(3);
    expect(imageTools.every((t) => t.category === "image")).toBe(true);
  });

  it("all tools must have unique IDs", () => {
    const ids = TOOLS.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
