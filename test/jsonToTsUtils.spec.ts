import { describe, it, expect } from "vitest";
import { jsonToTypeScript, DEFAULT_JSON_TO_TS_OPTIONS } from "../src/tools/dev/jsonToTsUtils";

describe("JSON to TypeScript Utilities", () => {
  it("converts standard JSON object with nested structures to TypeScript interfaces", () => {
    const json = JSON.stringify({
      id: 1001,
      name: "Tool-Ore",
      active: true,
      tags: ["crypto", "web", "tools"],
      user: {
        username: "admin",
        role: "developer",
      },
    });

    const res = jsonToTypeScript(json, DEFAULT_JSON_TO_TS_OPTIONS);
    expect(res.isValid).toBe(true);
    expect(res.result).toContain("export interface RootObject {");
    expect(res.result).toContain("id: number;");
    expect(res.result).toContain("name: string;");
    expect(res.result).toContain("active: boolean;");
    expect(res.result).toContain("tags: string[];");
    expect(res.result).toContain("user: User;");
    expect(res.result).toContain("export interface User {");
  });

  it("supports type alias format and readonly modifier", () => {
    const json = JSON.stringify({ code: 200, message: "OK" });
    const res = jsonToTypeScript(json, {
      ...DEFAULT_JSON_TO_TS_OPTIONS,
      useType: true,
      readonlyProps: true,
      rootName: "ApiResponse",
    });

    expect(res.isValid).toBe(true);
    expect(res.result).toContain("export type ApiResponse = {");
    expect(res.result).toContain("readonly code: number;");
    expect(res.result).toContain("readonly message: string;");
  });

  it("handles array roots properly", () => {
    const json = JSON.stringify([{ id: 1, title: "Post 1" }]);
    const res = jsonToTypeScript(json, {
      ...DEFAULT_JSON_TO_TS_OPTIONS,
      rootName: "Posts",
    });

    expect(res.isValid).toBe(true);
    expect(res.result).toContain("export type Posts = PostsItem[];");
    expect(res.result).toContain("export interface PostsItem {");
  });
});
