import { describe, it, expect } from "vitest";
import { compareChecksums, FileChecksumResult } from "../src/tools/crypto/fileHashUtils";

describe("File Hash Checker Utilities", () => {
  const fileA: FileChecksumResult = {
    fileName: "release-v1.0.tar.gz",
    fileSize: 1048576,
    md5: "d41d8cd98f00b204e9800998ecf8427e",
    sha1: "da39a3ee5e6b4b0d3255bfef95601890afd80709",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    sha512: "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e",
  };

  it("identifies matching SHA-256 string accurately", () => {
    const res = compareChecksums(
      fileA,
      "E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855"
    );
    expect(res.isMatch).toBe(true);
    expect(res.algorithmMatch).toBe("SHA-256");
  });

  it("identifies matching between two file checksums", () => {
    const fileB: FileChecksumResult = { ...fileA, fileName: "copy.tar.gz" };
    const res = compareChecksums(fileA, fileB);
    expect(res.isMatch).toBe(true);
  });

  it("detects mismatch correctly", () => {
    const res = compareChecksums(fileA, "wrong-sha256-hash-value");
    expect(res.isMatch).toBe(false);
  });
});
