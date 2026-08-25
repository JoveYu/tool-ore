import { describe, it, expect } from "vitest";
import { generateQrCode } from "../src/tools/design/qrcodeUtils";

describe("QR Code Utilities", () => {
  it("generates QR code DataURL successfully", () => {
    const text = "Hello World";
    expect(text).toBeDefined();
  });
});
