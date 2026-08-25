import { describe, it, expect } from "vitest";
import { parseRegexToRailroadAst } from "../src/tools/dev/regexRailroadUtils";

describe("Regex Railroad Utilities", () => {
  it("parses choice alternation into AST branch", () => {
    const ast = parseRegexToRailroadAst("cat|dog|fish");
    expect(ast.type).toBe("choice");
    expect(ast.subNodes?.length).toBe(3);
  });

  it("extracts character classes and quantifiers", () => {
    const ast = parseRegexToRailroadAst("^[a-z0-9]+$");
    expect(ast.type).toBe("group");
    expect(ast.subNodes?.some((n) => n.type === "anchor")).toBe(true);
    expect(ast.subNodes?.some((n) => n.type === "charset")).toBe(true);
  });
});
