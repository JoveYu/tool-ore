import { describe, it, expect } from "vitest";
import {
  SCREEN_TEST_PATTERNS,
  getScreenInfo,
} from "../src/tools/dev/screenTestUtils";

describe("Screen Tester Utilities", () => {
  it("provides comprehensive screen test patterns", () => {
    expect(SCREEN_TEST_PATTERNS.length).toBeGreaterThan(5);
    expect(SCREEN_TEST_PATTERNS.some((p) => p.id === "black")).toBe(true);
    expect(SCREEN_TEST_PATTERNS.some((p) => p.id === "gray_gradient")).toBe(true);
  });

  it("retrieves screen hardware properties safely", () => {
    const info = getScreenInfo();
    expect(info.screenWidth).toBeDefined();
    expect(info.colorDepth).toBeDefined();
    expect(info.dpr).toBeGreaterThanOrEqual(1);
  });
});
