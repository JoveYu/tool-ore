import { describe, it, expect } from "vitest";
import {
  FAVICON_STANDARD_SIZES,
  buildMultiSizeIco,
  generateFaviconHtmlTags,
} from "../src/tools/image/faviconUtils";

describe("Favicon Generator Utilities", () => {
  it("provides standard favicon multi-size options", () => {
    expect(FAVICON_STANDARD_SIZES.length).toBeGreaterThan(5);
    expect(FAVICON_STANDARD_SIZES.some((s) => s.size === 16)).toBe(true);
    expect(FAVICON_STANDARD_SIZES.some((s) => s.size === 32)).toBe(true);
    expect(FAVICON_STANDARD_SIZES.some((s) => s.size === 180)).toBe(true);
  });

  it("builds valid binary multi-size ICO container header", () => {
    const mockBuffer16 = new ArrayBuffer(100);
    const mockBuffer32 = new ArrayBuffer(200);

    const blob = buildMultiSizeIco([
      { size: 16, buffer: mockBuffer16 },
      { size: 32, buffer: mockBuffer32 },
    ]);

    expect(blob.type).toBe("image/x-icon");
    expect(blob.size).toBe(6 + 16 * 2 + 100 + 200);
  });

  it("generates HTML link tags snippet", () => {
    const tags = generateFaviconHtmlTags();
    expect(tags).toContain('<link rel="icon" type="image/x-icon" href="/favicon.ico">');
    expect(tags).toContain('apple-touch-icon');
  });
});
