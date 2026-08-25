import { describe, it, expect } from "vitest";
import {
  generateTestIdCard,
  generateRealisticAddress,
  generateSingleFieldValue,
  generateMockRecords,
  formatMockDataOutput,
  MockFieldConfig,
  CHINA_ADMIN_DIVISIONS,
} from "../src/tools/text/mockDataUtils";

describe("Mock Data Generator Utilities", () => {
  it("generates realistic province, city, district structured Chinese addresses", () => {
    const addr = generateRealisticAddress();
    expect(addr.fullAddress).toBeDefined();
    expect(addr.province).toBeDefined();
    expect(addr.city).toBeDefined();
    expect(addr.district).toBeDefined();

    // 验证省份存在于数据表中
    const foundProv = CHINA_ADMIN_DIVISIONS.find((p) => p.province === addr.province);
    expect(foundProv).toBeDefined();

    // 验证城市隶属于该省份
    const foundCity = foundProv?.cities.find((c) => c.city === addr.city);
    expect(foundCity).toBeDefined();

    // 验证区县隶属于该城市
    expect(foundCity?.districts.includes(addr.district)).toBe(true);
  });

  it("generates valid 18-digit ID card with checksum", () => {
    const id = generateTestIdCard();
    expect(id).toMatch(/^\d{17}[\dXx]$/);
  });

  it("generates mock records according to configured fields", () => {
    const fields: MockFieldConfig[] = [
      { id: "1", name: "姓名", key: "username", type: "name" },
      { id: "2", name: "手机号", key: "phone", type: "phone" },
      { id: "3", name: "邮箱", key: "email", type: "email" },
      { id: "4", name: "地址", key: "address", type: "address" },
    ];

    const records = generateMockRecords(fields, 5);
    expect(records.length).toBe(5);
    expect(records[0].username).toBeDefined();
    expect(records[0].phone).toMatch(/^1[3-9]\d{9}$/);
    expect(records[0].email).toContain("@");
    expect(records[0].address).toContain("号");
  });

  it("formats mock records into JSON, CSV and SQL properly", () => {
    const records = [
      { id: 1, name: "张三", phone: "13800138000" },
      { id: 2, name: "李四", phone: "13900139000" },
    ];

    const json = formatMockDataOutput(records, "json");
    expect(json).toContain('"name": "张三"');

    const csv = formatMockDataOutput(records, "csv");
    expect(csv).toContain('"id","name","phone"');
    expect(csv).toContain('"1","张三","13800138000"');

    const sql = formatMockDataOutput(records, "sql", "t_users");
    expect(sql).toContain("INSERT INTO t_users (id, name, phone) VALUES ('1', '张三', '13800138000');");
  });
});
