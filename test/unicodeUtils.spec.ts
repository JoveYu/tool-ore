import { describe, it, expect } from "vitest";
import { textToUnicodeFormats, decodeToText } from "../src/tools/convert/unicodeUtils";

describe("Unicode Converter Utilities", () => {
  it("converts text to multiple Unicode representations", () => {
    const text = "中文 abc";
    const res = textToUnicodeFormats(text);

    expect(res.escapeU).toBe("\\u4e2d\\u6587 abc");
    expect(res.htmlHex).toBe("&#x4E2D;&#x6587; abc");
    expect(res.htmlDec).toBe("&#20013;&#25991; abc");
    expect(res.utf8Hex).toContain("E4 B8 AD E6 96 87");
  });

  it("decodes unicode escape, html entities and code points back to raw text", () => {
    expect(decodeToText("\\u4e2d\\u6587")).toBe("中文");
    expect(decodeToText("&#x4E2D;&#x6587;")).toBe("中文");
    expect(decodeToText("&#20013;&#25991;")).toBe("中文");
    expect(decodeToText("U+4E2D U+6587")).toBe("中文");
  });
});
