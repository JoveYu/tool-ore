import { describe, it, expect } from "vitest";
import { PLACEHOLDER_SIZE_PRESETS, PlaceholderOptions } from "../src/tools/image/placeholderUtils";

describe("Placeholder Generator Utilities", () => {
  it("provides common standard placeholder resolution presets", () => {
    expect(PLACEHOLDER_SIZE_PRESETS.length).toBeGreaterThan(4);
    expect(PLACEHOLDER_SIZE_PRESETS.some((p) => p.width === 1920 && p.height === 1080)).toBe(true);
  });

  it("validates placeholder option definitions correctly", () => {
    const opts: PlaceholderOptions = {
      width: 800,
      height: 600,
      bgColor: "#e2e8f0",
      textColor: "#475569",
      customText: "800 × 600",
      fontSize: 48,
      showDiagonalLines: true,
      showBorder: true,
      format: "image/png",
    };
    expect(opts.width).toBe(800);
    expect(opts.height).toBe(600);
  });
});
