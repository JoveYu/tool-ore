import { describe, it, expect } from "vitest";
import { formatFileSize, getFileExt } from "../src/tools/image/imageUtils";

describe("Image Utilities", () => {
  it("formats file sizes correctly", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1024 * 1024)).toBe("1 MB");
    expect(formatFileSize(1024 * 1024 * 2.5)).toBe("2.5 MB");
  });
});
