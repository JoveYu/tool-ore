import { describe, it, expect } from "vitest";
import { WATERMARK_PRESETS, WatermarkOptions } from "../src/tools/image/watermarkUtils";

describe("Watermark Utilities", () => {
  it("provides common preset watermark text templates", () => {
    expect(WATERMARK_PRESETS.length).toBeGreaterThan(3);
    expect(WATERMARK_PRESETS[0]).toContain("仅供办理业务使用");
  });

  it("validates watermark options types structure", () => {
    const opts: WatermarkOptions = {
      mode: "tile",
      text: "测试水印",
      fontSize: 24,
      color: "#ff0000",
      opacity: 0.3,
      rotate: -30,
      gapX: 80,
      gapY: 80,
      position: "bottom-right",
      margin: 20,
      outputFormat: "image/png",
      quality: 0.9,
    };
    expect(opts.mode).toBe("tile");
    expect(opts.text).toBe("测试水印");
  });
});
