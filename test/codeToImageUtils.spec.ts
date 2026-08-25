import { describe, it, expect } from "vitest";
import {
  THEME_CONFIGS,
  BACKGROUND_PRESETS,
  highlightCodeSimple,
} from "../src/tools/design/codeToImageUtils";

describe("Code to Image Utilities", () => {
  it("provides comprehensive IDE themes and gradient background presets", () => {
    expect(Object.keys(THEME_CONFIGS).length).toBeGreaterThan(4);
    expect(THEME_CONFIGS.one_dark).toBeDefined();
    expect(BACKGROUND_PRESETS.length).toBeGreaterThan(4);
  });

  it("highlights code keywords and strings accurately", () => {
    const code = 'const msg = "Hello 2026";';
    const highlighted = highlightCodeSimple(code, THEME_CONFIGS.one_dark);

    expect(highlighted).toContain(THEME_CONFIGS.one_dark.keyword);
    expect(highlighted).toContain(THEME_CONFIGS.one_dark.string);
    expect(highlighted).toContain("Hello 2026");
  });
});
