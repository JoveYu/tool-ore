import { describe, it, expect } from "vitest";
import {
  encodeHtmlEntities,
  decodeHtmlEntities,
} from "../src/tools/dev/htmlEntityUtils";

describe("HTML Entity Converter Utilities", () => {
  it("encodes named entities accurately", () => {
    const raw = '<div class="test">Tom & Jerry ©</div>';
    const res = encodeHtmlEntities(raw, "named", false);
    expect(res).toBe("&lt;div class=&quot;test&quot;&gt;Tom &amp; Jerry &copy;&lt;/div&gt;");
  });

  it("encodes decimal and hex entities accurately", () => {
    const raw = "<b>Hello</b>";
    const dec = encodeHtmlEntities(raw, "decimal", false);
    expect(dec).toBe("&#60;b&#62;Hello&#60;/b&#62;");

    const hex = encodeHtmlEntities(raw, "hex", false);
    expect(hex).toBe("&#x3C;b&#x3E;Hello&#x3C;/b&#x3E;");
  });

  it("decodes named, decimal and hex entities back to raw string accurately", () => {
    const encoded = "&lt;h1&gt;你好 &#x4E16;&#x754C; &amp; &#169;&lt;/h1&gt;";
    const decoded = decodeHtmlEntities(encoded);
    expect(decoded).toBe("<h1>你好 世界 & ©</h1>");
  });
});
