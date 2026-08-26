import { describe, it, expect } from "vitest";
import {
  StitchImageItem,
  StitchOptions,
  stitchImagesToDataUrl,
} from "../src/tools/image/stitcherUtils";

describe("Image Stitcher Utilities", () => {
  it("defines stitch options interface structure correctly", () => {
    const opts: StitchOptions = {
      direction: "vertical",
      gridCols: 3,
      gap: 12,
      padding: 16,
      backgroundColor: "#FFFFFF",
      borderRadius: 8,
      maxWidth: 1200,
      outputFormat: "image/png",
    };

    expect(opts.direction).toBe("vertical");
    expect(opts.gap).toBe(12);
    expect(opts.borderRadius).toBe(8);
  });

  it("handles environment safely when stitching images", async () => {
    const items: StitchImageItem[] = [
      {
        id: "1",
        name: "pic1.png",
        dataUrl: "data:image/png;base64,iVBORw0KGgo=",
        width: 400,
        height: 300,
        size: 1024,
      },
    ];

    const res = await stitchImagesToDataUrl(items, {
      direction: "horizontal",
      gap: 0,
      padding: 0,
      backgroundColor: "#FFFFFF",
      borderRadius: 0,
    });

    expect(typeof res).toBe("string");
  });
});
