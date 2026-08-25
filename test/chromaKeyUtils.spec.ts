import { describe, it, expect } from "vitest";
import {
  colorDistance,
  PHOTO_SIZE_PRESETS,
  TARGET_COLOR_PRESETS,
} from "../src/tools/image/chromaKeyUtils";

describe("ChromaKey Utilities", () => {
  it("calculates Euclidean color distance correctly", () => {
    // Identical colors distance = 0
    expect(colorDistance(255, 0, 0, 255, 0, 0)).toBe(0);
    // Black and White distance = sqrt(255^2 * 3) ~ 441.67
    expect(Math.round(colorDistance(0, 0, 0, 255, 255, 255))).toBe(442);
    // Red and Blue
    expect(colorDistance(255, 0, 0, 0, 0, 255)).toBeCloseTo(360.62, 1);
  });

  it("provides standard photo crop presets", () => {
    expect(PHOTO_SIZE_PRESETS.length).toBeGreaterThanOrEqual(4);
    const oneInch = PHOTO_SIZE_PRESETS.find((p) => p.id === "1_inch");
    expect(oneInch).toBeDefined();
    expect(oneInch?.width).toBe(295);
    expect(oneInch?.height).toBe(413);
  });

  it("provides standard target color presets", () => {
    expect(TARGET_COLOR_PRESETS.length).toBeGreaterThan(4);
    const bluePreset = TARGET_COLOR_PRESETS.find((p) => p.name === "证件蓝");
    expect(bluePreset?.color).toBe("#0099FF");
  });
});
