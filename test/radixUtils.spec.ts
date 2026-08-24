import { describe, it, expect } from "vitest";
import { convertRadix, validateRadixInput } from "../src/tools/dev/radixUtils";

describe("Radix Converter Utilities", () => {
  it("converts 1024 decimal across all common radixes", () => {
    const res = convertRadix("1024", 10);
    expect(res.isValid).toBe(true);

    const bin = res.results.find((r) => r.radix === 2);
    expect(bin?.value).toBe("10000000000");

    const hex = res.results.find((r) => r.radix === 16);
    expect(hex?.value).toBe("400");

    const oct = res.results.find((r) => r.radix === 8);
    expect(oct?.value).toBe("2000");
  });

  it("handles negative numbers correctly", () => {
    const res = convertRadix("-255", 10);
    expect(res.isValid).toBe(true);

    const hex = res.results.find((r) => r.radix === 16);
    expect(hex?.value).toBe("-FF");
  });

  it("validates radix input accurately", () => {
    const invalidBin = validateRadixInput("102", 2);
    expect(invalidBin.isValid).toBe(false);

    const validHex = validateRadixInput("1aF9", 16);
    expect(validHex.isValid).toBe(true);
  });

  it("supports base64 numerical conversion", () => {
    const res = convertRadix("64", 10);
    const b64 = res.results.find((r) => r.radix === 64);
    expect(b64?.value).toBe("10");
  });
});
