import { describe, it, expect } from "vitest";
import { testRegex } from "../src/tools/dev/regexUtils";

describe("Regex Tester Utilities", () => {
  it("matches simple patterns with global flag", () => {
    const pattern = "\\d+";
    const text = "Item 100 costs 250 dollars";
    const result = testRegex(pattern, "g", text);

    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(2);
    expect(result.matches[0].match).toBe("100");
    expect(result.matches[1].match).toBe("250");
  });

  it("extracts capture groups correctly", () => {
    const pattern = "([a-zA-Z0-9]+)@([a-zA-Z0-9.-]+)";
    const text = "support@example.com";
    const result = testRegex(pattern, "g", text);

    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(1);
    expect(result.matches[0].groups[0]).toBe("support");
    expect(result.matches[0].groups[1]).toBe("example.com");
  });

  it("performs replacement correctly", () => {
    const pattern = "\\d+";
    const text = "1 2 3";
    const result = testRegex(pattern, "g", text, "[$&]");

    expect(result.replacedText).toBe("[1] [2] [3]");
  });

  it("reports syntax error for invalid regex", () => {
    const pattern = "[a-z";
    const result = testRegex(pattern, "g", "test");

    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
