import { describe, it, expect } from "vitest";
import { CATEGORIES, TOOLS, getToolById, getToolsByCategory } from "../src/registry";

describe("Tool Registry System", () => {
  it("should have defined categories", () => {
    expect(CATEGORIES.length).toBeGreaterThan(0);
    expect(CATEGORIES.map((c) => c.id)).toContain("dev");
    expect(CATEGORIES.map((c) => c.id)).toContain("image");
    expect(CATEGORIES.map((c) => c.id)).toContain("text");
    expect(CATEGORIES.map((c) => c.id)).toContain("crypto");
  });

  it("should find tools by ID", () => {
    const tool = getToolById("currency-to-chinese");
    expect(tool).toBeDefined();
    expect(tool?.name).toBe("大写金额转换");
    expect(tool?.category).toBe("text");
  });

  it("should find tools by category", () => {
    const devTools = getToolsByCategory("dev");
    expect(devTools.length).toBeGreaterThanOrEqual(3);
    expect(devTools.every((t) => t.category === "dev")).toBe(true);

    const textTools = getToolsByCategory("text");
    expect(textTools.length).toBeGreaterThanOrEqual(3);
    expect(textTools.every((t) => t.category === "text")).toBe(true);

    const imageTools = getToolsByCategory("image");
    expect(imageTools.length).toBeGreaterThanOrEqual(4);
    expect(imageTools.every((t) => t.category === "image")).toBe(true);

    const cryptoTools = getToolsByCategory("crypto");
    expect(cryptoTools.length).toBeGreaterThanOrEqual(4);
    expect(cryptoTools.every((t) => t.category === "crypto")).toBe(true);
  });

  it("all tools must have unique IDs", () => {
    const ids = TOOLS.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
