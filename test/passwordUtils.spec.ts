import { describe, it, expect } from "vitest";
import {
  generateSinglePassword,
  generatePasswords,
  evaluatePasswordStrength,
} from "../src/tools/crypto/passwordUtils";

describe("Password Generator Utilities", () => {
  it("generates password with specific length and character sets", () => {
    const pwd = generateSinglePassword({
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
    });

    expect(pwd.length).toBe(16);
    expect(/[A-Z]/.test(pwd)).toBe(true);
    expect(/[a-z]/.test(pwd)).toBe(true);
    expect(/\d/.test(pwd)).toBe(true);
  });

  it("excludes similar characters when option enabled", () => {
    const pwd = generateSinglePassword({
      length: 32,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: true,
      excludeAmbiguous: false,
    });

    expect(/[il1Lo0O]/.test(pwd)).toBe(false);
  });

  it("generates batch passwords", () => {
    const list = generatePasswords({
      length: 12,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: false,
      excludeAmbiguous: false,
      quantity: 5,
    });

    expect(list.length).toBe(5);
    expect(list.every((p) => p.length === 12)).toBe(true);
  });

  it("evaluates password strength and entropy score correctly", () => {
    const weak = evaluatePasswordStrength("123456");
    expect(weak.score).toBeLessThanOrEqual(1);

    const strong = evaluatePasswordStrength("A#9xK!2m$Lp8@vQz");
    expect(strong.score).toBeGreaterThanOrEqual(3);
  });
});
