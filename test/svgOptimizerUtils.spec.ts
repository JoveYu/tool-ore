import { describe, it, expect } from "vitest";
import { optimizeSvg, DEFAULT_SVG_OPTIONS } from "../src/tools/design/svgOptimizerUtils";

describe("SVG Optimizer Utilities", () => {
  it("cleans redundant metadata, comments and doctypes from SVG", () => {
    const rawSvg = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Created with Inkscape (http://www.inkscape.org/) -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="100.12345" height="100.56789">
  <metadata><rdf>sample</rdf></metadata>
  <g id="empty_layer"></g>
  <circle cx="50.00001" cy="50.00002" r="40" fill="red" stroke-width="2"/>
</svg>`;

    const res = optimizeSvg(rawSvg, DEFAULT_SVG_OPTIONS);

    expect(res.isValid).toBe(true);
    expect(res.optimizedSvg).not.toContain("<?xml");
    expect(res.optimizedSvg).not.toContain("<!DOCTYPE");
    expect(res.optimizedSvg).not.toContain("<!--");
    expect(res.optimizedSvg).not.toContain("<metadata>");
    expect(res.optimizedSvg).not.toContain("xmlns:inkscape");
    expect(res.savedBytes).toBeGreaterThan(50);
    expect(res.dataUriUtf8).toContain("data:image/svg+xml;utf8,");
    expect(res.reactComponentCode).toContain("strokeWidth=");
  });

  it("handles invalid SVG inputs gracefully", () => {
    const res = optimizeSvg("not an svg");
    expect(res.isValid).toBe(false);
    expect(res.error).toBeDefined();
  });
});
