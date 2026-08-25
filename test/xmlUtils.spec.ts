import { describe, it, expect } from "vitest";
import { formatXml, minifyXml } from "../src/tools/dev/xmlUtils";

describe("XML Formatter Utilities", () => {
  it("formats nested XML nodes with proper indentation", () => {
    const raw = '<root><user id="1"><name>Alice</name><role>Admin</role></user></root>';
    const res = formatXml(raw, 2);

    expect(res.isValid).toBe(true);
    expect(res.result).toContain("<root>\n  <user");
    expect(res.result).toContain("    <name>\n      Alice\n    </name>");
    expect(res.stats?.nodesCount).toBe(8);
  });

  it("minifies XML to a compact string", () => {
    const formatted = `
      <note>
        <!-- 注释 -->
        <to>Tove</to>
        <from>Jani</from>
      </note>
    `;
    const min = minifyXml(formatted);
    expect(min).toBe("<note><to>Tove</to><from>Jani</from></note>");
  });
});
