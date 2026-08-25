import { describe, it, expect } from "vitest";
import { parseJwt, base64UrlEncode, verifyHs256Signature } from "../src/tools/dev/jwtUtils";

describe("JWT Debugger Utilities", () => {
  it("decodes valid JWT with claims correctly", () => {
    const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = base64UrlEncode(
      JSON.stringify({
        sub: "user_12345",
        name: "张三",
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000) - 60,
      })
    );
    const token = `${header}.${payload}.mockSignature123`;

    const res = parseJwt(token);
    expect(res.isValid).toBe(true);
    expect(res.headerObj.alg).toBe("HS256");
    expect(res.payloadObj.name).toBe("张三");
    expect(res.claims.isExpired).toBe(false);
    expect(res.claims.remainingTime).toContain("小时后过期");
  });

  it("identifies expired tokens accurately", () => {
    const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = base64UrlEncode(
      JSON.stringify({
        sub: "admin",
        exp: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
      })
    );
    const token = `${header}.${payload}.sig`;

    const res = parseJwt(token);
    expect(res.isValid).toBe(true);
    expect(res.claims.isExpired).toBe(true);
    expect(res.claims.remainingTime).toContain("已过期");
  });

  it("handles malformed tokens gracefully", () => {
    const res = parseJwt("invalid.token");
    expect(res.isValid).toBe(false);
    expect(res.error).toBeDefined();
  });

  it("verifies HS256 signature correctly", async () => {
    const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = base64UrlEncode(JSON.stringify({ user: "alice" }));
    const secret = "super-secret-key-123";

    // Generate valid signature using crypto.subtle
    const encoder = new TextEncoder();
    const data = encoder.encode(`${header}.${payload}`);
    const keyData = encoder.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, data);
    const sigBytes = new Uint8Array(signatureBuffer);
    let binary = "";
    for (let i = 0; i < sigBytes.byteLength; i++) {
      binary += String.fromCharCode(sigBytes[i]);
    }
    const signature = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const validToken = `${header}.${payload}.${signature}`;
    const checkValid = await verifyHs256Signature(validToken, secret);
    expect(checkValid.isValid).toBe(true);

    const checkInvalid = await verifyHs256Signature(validToken, "wrong-secret");
    expect(checkInvalid.isValid).toBe(false);
  });
});
