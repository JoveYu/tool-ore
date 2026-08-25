import { describe, it, expect } from "vitest";
import { getDefaultCropArea } from "../src/tools/image/cropperUtils";

describe("Image Cropper Utilities", () => {
  it("computes 1:1 square crop area centered correctly", () => {
    const area = getDefaultCropArea(1920, 1080, "1:1");
    expect(area.width).toBe(1080);
    expect(area.height).toBe(1080);
    expect(area.x).toBe(420);
    expect(area.y).toBe(0);
  });

  it("computes 16:9 crop area correctly", () => {
    const area = getDefaultCropArea(1920, 1080, "16:9");
    expect(area.width).toBe(1920);
    expect(area.height).toBe(1080);
    expect(area.x).toBe(0);
    expect(area.y).toBe(0);
  });

  it("handles free aspect ratio returning full canvas", () => {
    const area = getDefaultCropArea(800, 600, "free");
    expect(area.width).toBe(800);
    expect(area.height).toBe(600);
    expect(area.x).toBe(0);
    expect(area.y).toBe(0);
  });
});
