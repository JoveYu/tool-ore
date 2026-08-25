import { describe, it, expect } from "vitest";
import {
  filterHttpStatusList,
  HTTP_STATUS_LIST,
} from "../src/tools/dev/httpStatusUtils";

describe("HTTP Status Lookup Utilities", () => {
  it("contains all standard HTTP status categories", () => {
    expect(HTTP_STATUS_LIST.length).toBeGreaterThan(20);
    expect(HTTP_STATUS_LIST.some((s) => s.code === 200)).toBe(true);
    expect(HTTP_STATUS_LIST.some((s) => s.code === 404)).toBe(true);
    expect(HTTP_STATUS_LIST.some((s) => s.code === 502)).toBe(true);
  });

  it("filters status codes by query and category accurately", () => {
    const list404 = filterHttpStatusList("404");
    expect(list404.length).toBe(1);
    expect(list404[0].name).toBe("未找到资源");

    const list5xx = filterHttpStatusList("", "5xx");
    expect(list5xx.every((s) => s.category === "5xx")).toBe(true);

    const listGateway = filterHttpStatusList("网关");
    expect(listGateway.some((s) => s.code === 502)).toBe(true);
    expect(listGateway.some((s) => s.code === 504)).toBe(true);
  });
});
