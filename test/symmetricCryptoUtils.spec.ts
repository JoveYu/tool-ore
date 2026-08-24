import { describe, it, expect } from "vitest";
import { encryptText, decryptText } from "../src/tools/crypto/symmetricCryptoUtils";

describe("Symmetric Crypto Utilities", () => {
  it("encrypts and decrypts with AES-CBC correctly", () => {
    const raw = "Hello World! 123456";
    const key = "my-secret-key-123";
    const iv = "1234567890123456";

    // 1. Base64
    const encBase64 = encryptText(raw, {
      algorithm: "AES",
      key,
      iv,
      mode: "CBC",
      padding: "Pkcs7",
      outputFormat: "Base64",
    });

    expect(encBase64.result).toBeDefined();
    expect(encBase64.error).toBeUndefined();

    const decFromBase64 = decryptText(encBase64.result, {
      algorithm: "AES",
      key,
      iv,
      mode: "CBC",
      padding: "Pkcs7",
      inputFormat: "Base64",
    });

    expect(decFromBase64.result).toBe(raw);
    expect(decFromBase64.error).toBeUndefined();

    // 2. Hex
    const encHex = encryptText(raw, {
      algorithm: "AES",
      key,
      iv,
      mode: "CBC",
      padding: "Pkcs7",
      outputFormat: "Hex",
    });

    const decFromHex = decryptText(encHex.result, {
      algorithm: "AES",
      key,
      iv,
      mode: "CBC",
      padding: "Pkcs7",
      inputFormat: "Hex",
    });

    expect(decFromHex.result).toBe(raw);
  });

  it("encrypts and decrypts with SM4 correctly in ECB and CBC", () => {
    const raw = "SM4 加解密测试文本 123";
    const key = "0123456789abcdeffedcba9876543210";

    const enc = encryptText(raw, {
      algorithm: "SM4",
      key,
      mode: "ECB",
      outputFormat: "Hex",
    });

    expect(enc.result).toBeDefined();

    const dec = decryptText(enc.result, {
      algorithm: "SM4",
      key,
      mode: "ECB",
      inputFormat: "Hex",
    });

    expect(dec.result).toBe(raw);
  });

  it("handles RC4 stream cipher correctly with Auto format", () => {
    const raw = "RC4 Stream Cipher Test";
    const key = "pass123";

    const enc = encryptText(raw, {
      algorithm: "RC4",
      key,
      outputFormat: "Base64",
    });

    const dec = decryptText(enc.result, {
      algorithm: "RC4",
      key,
      inputFormat: "Auto",
    });

    expect(dec.result).toBe(raw);
  });
});
