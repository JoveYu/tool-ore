import { describe, it, expect } from "vitest";
import {
  computeGlassmorphism,
  GLASS_PRESETS,
  GlassOptions,
} from "../src/tools/design/glassmorphismUtils";

describe("Glassmorphism Utilities", () => {
  it("computes glassmorphism CSS rules correctly", () => {
    const opts: GlassOptions = {
      mode: "glass",
      blur: 16,
      opacity: 0.25,
      color: "#FFFFFF",
      borderWidth: 1,
      borderOpacity: 0.3,
      borderRadius: 24,
      shadowBlur: 20,
      shadowOpacity: 0.1,
    };

    const res = computeGlassmorphism(opts);
    expect(res.cssCode).toContain("backdrop-filter: blur(16px);");
    expect(res.cssCode).toContain("border-radius: 24px;");
    expect(res.cssStyles.backdropFilter).toBe("blur(16px)");
    expect(res.tailwindClass).toContain("backdrop-blur-md");
  });

  it("computes neumorphism shadows correctly", () => {
    const opts: GlassOptions = {
      mode: "neumorphism_flat",
      blur: 0,
      opacity: 1,
      color: "#E2E8F0",
      borderWidth: 0,
      borderOpacity: 0,
      borderRadius: 20,
      shadowBlur: 16,
      shadowOpacity: 0.15,
      neuDistance: 8,
      neuIntensity: 0.18,
    };

    const res = computeGlassmorphism(opts);
    expect(res.cssCode).toContain("box-shadow: 8px 8px 16px");
    expect(res.cssStyles.backgroundColor).toBe("#E2E8F0");
  });

  it("provides aesthetic glass presets", () => {
    expect(GLASS_PRESETS.length).toBeGreaterThanOrEqual(4);
    expect(GLASS_PRESETS[0].options.mode).toBe("glass");
  });
});
