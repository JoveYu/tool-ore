import { describe, it, expect } from "vitest";
import {
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  rgbToCmyk,
  calculateAllFormats,
} from "../src/tools/design/colorUtils";

describe("Color Picker Utilities", () => {
  it("converts RGB to HEX correctly", () => {
    expect(rgbToHex(255, 255, 255)).toBe("#FFFFFF");
    expect(rgbToHex(0, 0, 0)).toBe("#000000");
    expect(rgbToHex(99, 102, 241)).toBe("#6366F1");
  });

  it("converts RGB to HSL correctly", () => {
    const whiteHsl = rgbToHsl(255, 255, 255);
    expect(whiteHsl.l).toBe(100);

    const blackHsl = rgbToHsl(0, 0, 0);
    expect(blackHsl.l).toBe(0);

    const redHsl = rgbToHsl(255, 0, 0);
    expect(redHsl.h).toBe(0);
    expect(redHsl.s).toBe(100);
    expect(redHsl.l).toBe(50);
  });

  it("calculates all format outputs correctly", () => {
    const formats = calculateAllFormats(255, 0, 0);
    expect(formats.hex).toBe("#FF0000");
    expect(formats.rgb).toBe("rgb(255, 0, 0)");
    expect(formats.hsl).toBe("hsl(0, 100%, 50%)");
    expect(formats.cmyk).toBe("cmyk(0%, 100%, 100%, 0%)");
  });
});
