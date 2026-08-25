import { describe, it, expect } from "vitest";
import {
  parseTimestampInput,
  formatStandardDate,
  getRelativeTime,
  getTimeZoneList,
} from "../src/tools/dev/timestampUtils";

describe("Timestamp Converter Utilities", () => {
  it("parses 10-digit second timestamp correctly", () => {
    const res = parseTimestampInput("1700000000");
    expect(res.isValid).toBe(true);
    expect(res.seconds).toBe(1700000000);
    expect(res.milliseconds).toBe(1700000000000);
    expect(res.isoString).toBe("2023-11-14T22:13:20.000Z");
  });

  it("parses 13-digit millisecond timestamp correctly", () => {
    const res = parseTimestampInput("1700000000000");
    expect(res.isValid).toBe(true);
    expect(res.seconds).toBe(1700000000);
    expect(res.milliseconds).toBe(1700000000000);
  });

  it("parses standard date string correctly", () => {
    const res = parseTimestampInput("2026-08-25 12:00:00");
    expect(res.isValid).toBe(true);
    expect(res.seconds).toBeDefined();
  });

  it("calculates relative time accurately", () => {
    const now = new Date(1700000000000);
    const past5Min = new Date(1700000000000 - 5 * 60 * 1000);
    expect(getRelativeTime(past5Min, now)).toBe("5 分钟前");

    const future2Hours = new Date(1700000000000 + 2 * 3600 * 1000);
    expect(getRelativeTime(future2Hours, now)).toBe("2 小时后");
  });

  it("formats timezone list without errors", () => {
    const d = new Date("2026-08-25T12:00:00Z");
    const list = getTimeZoneList(d);
    expect(list.length).toBeGreaterThan(5);
    const bj = list.find((tz) => tz.timeZone === "Asia/Shanghai");
    expect(bj?.formatted).toContain("2026-08-25 20:00:00");
  });
});
