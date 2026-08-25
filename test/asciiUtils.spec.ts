import { describe, it, expect } from "vitest";
import { generateAsciiBanner, ASCII_FONTS } from "../src/tools/text/asciiUtils";

describe("ASCII Text Generator Utilities", () => {
  it("provides standard FIGlet font options", () => {
    expect(ASCII_FONTS.length).toBeGreaterThan(4);
    expect(ASCII_FONTS.some((f) => f.id === "Standard")).toBe(true);
    expect(ASCII_FONTS.some((f) => f.id === "Slant")).toBe(true);
  });

  it("generates ASCII banner with JS comment wrapping accurately", () => {
    const banner = generateAsciiBanner("ORE", "Standard", "js_block");
    expect(banner).toContain("/**");
    expect(banner).toContain(" * ");
    expect(banner).toContain(" */");
  });

  it("generates ASCII banner with hash comment wrapping", () => {
    const banner = generateAsciiBanner("API", "Slant", "hash");
    expect(banner.startsWith("# ")).toBe(true);
  });
});
