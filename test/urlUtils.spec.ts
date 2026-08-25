import { describe, it, expect } from "vitest";
import {
  parseUrl,
  buildUrlFromParts,
  paramsToJson,
  jsonToParams,
} from "../src/tools/dev/urlUtils";

describe("URL Parser Utilities", () => {
  it("parses absolute URL with query parameters and hash correctly", () => {
    const url = "https://api.example.com:8080/v1/users/search?keyword=test&page=1&limit=20#top";
    const res = parseUrl(url);

    expect(res.isValid).toBe(true);
    expect(res.protocol).toBe("https:");
    expect(res.hostname).toBe("api.example.com");
    expect(res.port).toBe("8080");
    expect(res.pathname).toBe("/v1/users/search");
    expect(res.hash).toBe("#top");
    expect(res.params.length).toBe(3);
    expect(res.params[0].key).toBe("keyword");
    expect(res.params[0].value).toBe("test");
  });

  it("parses relative query strings correctly", () => {
    const query = "?source=google&utm_campaign=winter_sale";
    const res = parseUrl(query);

    expect(res.isValid).toBe(true);
    expect(res.params.length).toBe(2);
    expect(res.params[1].key).toBe("utm_campaign");
    expect(res.params[1].value).toBe("winter_sale");
  });

  it("builds URL with updated params and hash correctly", () => {
    const baseUrl = "https://example.com/api";
    const params = [
      { id: "1", key: "lang", value: "zh-CN", enabled: true },
      { id: "2", key: "disabled_param", value: "123", enabled: false },
      { id: "3", key: "tag", value: "react", enabled: true },
    ];
    const full = buildUrlFromParts(baseUrl, params, "#section");
    expect(full).toBe("https://example.com/api?lang=zh-CN&tag=react#section");
  });

  it("converts params to JSON and vice versa accurately", () => {
    const params = [
      { id: "1", key: "name", value: "Alice", enabled: true },
      { id: "2", key: "tags", value: "web", enabled: true },
      { id: "3", key: "tags", value: "tools", enabled: true },
    ];
    const json = paramsToJson(params);
    expect(json).toContain('"name": "Alice"');
    expect(json).toContain('"tags": [\n    "web",\n    "tools"\n  ]');

    const back = jsonToParams(json);
    expect(back.isValid).toBe(true);
    expect(back.params.length).toBe(3);
  });
});
