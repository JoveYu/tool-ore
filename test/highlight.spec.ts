import { describe, it, expect } from "vitest";
import { highlightCode } from "../src/utils/highlight";

describe("Syntax Highlighter Utilities", () => {
  it("highlights JSON code accurately with token classes", () => {
    const json = '{"name": "Tool-Ore", "stars": 100}';
    const highlighted = highlightCode(json, "json");
    expect(highlighted).toContain("hljs-attr");
    expect(highlighted).toContain("hljs-string");
    expect(highlighted).toContain("hljs-number");
  });

  it("highlights SQL queries properly", () => {
    const sql = "SELECT id, name FROM users WHERE id = 1;";
    const highlighted = highlightCode(sql, "sql");
    expect(highlighted).toContain("hljs-keyword");
  });

  it("highlights XML / HTML properly", () => {
    const xml = '<note><to>User</to></note>';
    const highlighted = highlightCode(xml, "xml");
    expect(highlighted).toContain("hljs-tag");
  });
});
