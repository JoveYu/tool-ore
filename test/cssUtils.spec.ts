import { describe, it, expect } from "vitest";
import {
  buildGradientCss,
  buildBoxShadowCss,
  GRADIENT_PRESETS,
  SHADOW_PRESETS,
} from "../src/tools/design/cssUtils";

describe("CSS Gradient & Box Shadow Utilities", () => {
  it("builds linear gradient CSS and Tailwind class correctly", () => {
    const res = buildGradientCss(GRADIENT_PRESETS[0].config);
    expect(res.cssBackground).toContain("linear-gradient(135deg");
    expect(res.cssBackground).toContain("#6366F1 0%");
    expect(res.tailwindClass).toContain("bg-[linear-gradient(135deg");
  });

  it("builds multi-layer box shadow CSS and Tailwind class correctly", () => {
    const res = buildBoxShadowCss(SHADOW_PRESETS[0].layers);
    expect(res.cssBoxShadow).toContain("box-shadow: 0px 4px 6px -1px");
    expect(res.tailwindClass).toContain("shadow-[0px_4px_6px_-1px");
  });

  it("handles empty shadow layers cleanly", () => {
    const res = buildBoxShadowCss([]);
    expect(res.cssBoxShadow).toBe("box-shadow: none;");
    expect(res.tailwindClass).toBe("shadow-none");
  });
});
