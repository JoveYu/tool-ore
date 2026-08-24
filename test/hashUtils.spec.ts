import { describe, it, expect } from "vitest";
import { computeAllHashes } from "../src/tools/crypto/hashUtils";

describe("Hash Utilities", () => {
  it("computes standard hashes for input text including SM3", () => {
    const input = "123456";
    const results = computeAllHashes(input);

    expect(results.length).toBeGreaterThanOrEqual(10);

    const sm3 = results.find((r) => r.algorithm === "sm3");
    expect(sm3).toBeDefined();
    expect(sm3?.hash).toBe("207cf410532f92a47dee245ce9b11ff71f578ebd763eb3bbea44ebd043d018fb");
    expect(sm3?.bitLength).toBe(256);

    const md5 = results.find((r) => r.algorithm === "md5");
    expect(md5?.hash).toBe("e10adc3949ba59abbe56e057f20f883e");

    const sha1 = results.find((r) => r.algorithm === "sha1");
    expect(sha1?.hash).toBe("7c4a8d09ca3762af61e59520943dc26494f8941b");

    const sha256 = results.find((r) => r.algorithm === "sha256");
    expect(sha256?.hash).toBe("8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92");
  });

  it("supports uppercase output", () => {
    const input = "123456";
    const results = computeAllHashes(input, { uppercase: true });
    const md5 = results.find((r) => r.algorithm === "md5");
    expect(md5?.hash).toBe("E10ADC3949BA59ABBE56E057F20F883E");
  });

  it("supports HMAC key calculation", () => {
    const input = "message";
    const key = "secret";
    const results = computeAllHashes(input, { hmacKey: key });
    expect(results[0].name.startsWith("HMAC-")).toBe(true);
    expect(results.find((r) => r.algorithm === "sha256")?.hash).toBeDefined();
  });
});
