import { describe, it, expect } from "vitest";
import { yamlToJson, jsonToYaml } from "../src/tools/dev/yamlUtils";

describe("YAML & JSON Converter Utilities", () => {
  it("converts YAML to formatted JSON accurately", () => {
    const yaml = `
server:
  port: 8080
  host: localhost
tags:
  - web
  - tools
`;
    const res = yamlToJson(yaml);
    expect(res.isValid).toBe(true);
    expect(res.result).toContain('"port": 8080');
    expect(res.result).toContain('"host": "localhost"');
    expect(res.result).toContain('"tags": [\n    "web",\n    "tools"\n  ]');
  });

  it("converts JSON to standard YAML accurately", () => {
    const json = JSON.stringify({
      app: "tool-ore",
      features: ["crypto", "images", "text"],
      config: { enabled: true, count: 10 },
    });

    const res = jsonToYaml(json);
    expect(res.isValid).toBe(true);
    expect(res.result).toContain("app: tool-ore");
    expect(res.result).toContain("features:\n  - crypto");
    expect(res.result).toContain("enabled: true");
  });

  it("handles syntax error in invalid YAML", () => {
    const badYaml = "key: : value";
    const res = yamlToJson(badYaml);
    expect(res.isValid).toBe(false);
    expect(res.error).toBeDefined();
  });

  it("handles syntax error in invalid JSON", () => {
    const badJson = '{"key": "unclosed}';
    const res = jsonToYaml(badJson);
    expect(res.isValid).toBe(false);
    expect(res.error).toBeDefined();
  });
});
