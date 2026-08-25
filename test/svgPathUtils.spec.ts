import { describe, it, expect } from "vitest";
import {
  calculatePathBBox,
  transformSvgPath,
  SvgPathTransformOptions,
} from "../src/tools/image/svgPathUtils";

describe("SVG Path Utilities", () => {
  it("computes bounding box of SVG path accurately", () => {
    const d = "M 10 20 L 110 120 Z";
    const bbox = calculatePathBBox(d);

    expect(bbox.minX).toBe(10);
    expect(bbox.minY).toBe(20);
    expect(bbox.maxX).toBe(110);
    expect(bbox.maxY).toBe(120);
    expect(bbox.width).toBe(100);
    expect(bbox.height).toBe(100);
  });

  it("transforms and translates SVG path coordinates", () => {
    const d = "M 0 0 L 100 100";
    const opts: SvgPathTransformOptions = {
      translateX: 50,
      translateY: 50,
      scaleX: 1,
      scaleY: 1,
      flipH: false,
      flipV: false,
      precision: 2,
      toAbsolute: true,
    };

    const res = transformSvgPath(d, opts);
    expect(res.isValid).toBe(true);
    expect(res.transformedPath).toBe("M 50 50 L 150 150");
  });
});
