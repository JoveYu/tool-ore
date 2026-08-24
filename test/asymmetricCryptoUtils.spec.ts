import { describe, it, expect } from "vitest";
import {
  encryptAsymmetric,
  decryptAsymmetric,
  generateAsymmetricKeyPair,
} from "../src/tools/crypto/asymmetricCryptoUtils";

describe("Asymmetric Crypto Utilities", () => {
  it("generates SM2 keypair in PEM format and performs encrypt/decrypt in Base64 and Hex", async () => {
    const keyPair = await generateAsymmetricKeyPair("SM2");
    expect(keyPair.publicKey).toContain("-----BEGIN PUBLIC KEY-----");
    expect(keyPair.privateKey).toContain("-----BEGIN PRIVATE KEY-----");

    const raw = "SM2 非对称加密测试文本 123";

    // 1. Test Base64 output & explicit Base64 input decrypt
    const encBase64 = encryptAsymmetric(raw, {
      algorithm: "SM2",
      key: keyPair.publicKey,
      cipherMode: "1",
      outputFormat: "Base64",
    });

    expect(encBase64.result).toBeDefined();
    expect(encBase64.error).toBeUndefined();

    const decFromBase64 = decryptAsymmetric(encBase64.result, {
      algorithm: "SM2",
      key: keyPair.privateKey,
      cipherMode: "1",
      inputFormat: "Base64",
    });
    expect(decFromBase64.result).toBe(raw);

    // 2. Test Hex output & explicit Hex input decrypt
    const encHex = encryptAsymmetric(raw, {
      algorithm: "SM2",
      key: keyPair.publicKey,
      cipherMode: "1",
      outputFormat: "Hex",
    });

    expect(/^[0-9a-fA-F]+$/.test(encHex.result)).toBe(true);

    const decFromHex = decryptAsymmetric(encHex.result, {
      algorithm: "SM2",
      key: keyPair.privateKey,
      cipherMode: "1",
      inputFormat: "Hex",
    });
    expect(decFromHex.result).toBe(raw);
  });
});
