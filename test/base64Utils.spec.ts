import { describe, it, expect } from "vitest";
import { encodeBase64, decodeBase64 } from "../src/tools/crypto/base64Utils";

describe("Base64 Utilities", () => {
  it("encodes and decodes UTF-8 strings correctly", () => {
    const raw = "Hello World 在线工具! 🚀";
    const encoded = encodeBase64(raw);
    expect(encoded).toBeDefined();

    const decoded = decodeBase64(encoded);
    expect(decoded.result).toBe(raw);
    expect(decoded.error).toBeUndefined();
  });

  it("handles URL-Safe Base64 mode", () => {
    const text = "Subjects?+/>><";
    const normalEncoded = encodeBase64(text, false);
    const urlSafeEncoded = encodeBase64(text, true);

    expect(urlSafeEncoded).not.toContain("+");
    expect(urlSafeEncoded).not.toContain("/");
    expect(urlSafeEncoded).not.toContain("=");

    const decoded = decodeBase64(urlSafeEncoded, true);
    expect(decoded.result).toBe(text);
  });

  it("returns error for invalid Base64 input", () => {
    const invalid = "!!!invalid_base64@@@";
    const res = decodeBase64(invalid);
    expect(res.error).toBeDefined();
  });
});
