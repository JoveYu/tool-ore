import { describe, it, expect } from "vitest";
import { parseImageExif } from "../src/tools/image/exifUtils";

describe("EXIF Utilities", () => {
  it("handles empty or non-exif buffer gracefully", async () => {
    const emptyBuffer = new ArrayBuffer(10);
    const res = await parseImageExif(emptyBuffer);
    expect(res.hasExif).toBe(false);
    expect(res.rawTags).toEqual({});
  });
});
