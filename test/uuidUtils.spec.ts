import { describe, it, expect } from "vitest";
import {
  generateUuidV4,
  generateUuidV1,
  generateNanoId,
  generateUlid,
  generateBatchIds,
  formatIdListOutput,
} from "../src/tools/dev/uuidUtils";

describe("UUID & NanoID Generator Utilities", () => {
  it("generates valid UUID v4 format", () => {
    const id = generateUuidV4();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("generates UUID v1 format", () => {
    const id = generateUuidV1();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it("generates custom length NanoID with custom alphabet", () => {
    const id = generateNanoId(10, "0123456789");
    expect(id.length).toBe(10);
    expect(id).toMatch(/^\d{10}$/);
  });

  it("generates 26-char valid ULID", () => {
    const id = generateUlid();
    expect(id.length).toBe(26);
  });

  it("generates batch IDs with prefix and suffix", () => {
    const list = generateBatchIds({
      type: "uuid_v4",
      quantity: 5,
      uppercase: true,
      hyphens: false,
      prefix: "usr_",
      suffix: "_prod",
    });

    expect(list.length).toBe(5);
    expect(list[0].startsWith("usr_")).toBe(true);
    expect(list[0].endsWith("_prod")).toBe(true);
    expect(list[0]).not.toContain("-");
  });

  it("formats ID outputs into JSON and SQL IN clauses correctly", () => {
    const ids = ["id_1", "id_2"];
    const jsonStr = formatIdListOutput(ids, "json_array");
    expect(jsonStr).toBe('[\n  "id_1",\n  "id_2"\n]');

    const sqlStr = formatIdListOutput(ids, "sql_in");
    expect(sqlStr).toBe("IN ('id_1', 'id_2')");
  });
});
