import { describe, it, expect } from "vitest";
import {
  explainCron,
  getNextCronExecutions,
  parseCronExpression,
} from "../src/tools/dev/cronUtils";

describe("Cron Expression Parser Utilities", () => {
  it("translates standard 5-part cron expressions to Chinese explanation accurately", () => {
    expect(explainCron("* * * * *")).toBe("每分钟执行一次");
    expect(explainCron("*/5 * * * *")).toBe("每 5 分钟执行一次");
    expect(explainCron("0 * * * *")).toBe("每小时整点执行一次");
    expect(explainCron("0 0 * * *")).toBe("每天凌晨 00:00 执行一次");
  });

  it("calculates future executions accurately", () => {
    const base = new Date("2026-08-25T10:00:00Z");
    const nextList = getNextCronExecutions("0 * * * *", 3, base);
    expect(nextList.length).toBe(3);
    expect(nextList[0]).toContain(":00:00");
  });

  it("validates and parses cron expression results cleanly", () => {
    const res = parseCronExpression("0 9 * * 1-5");
    expect(res.isValid).toBe(true);
    expect(res.hasSeconds).toBe(false);
    expect(res.nextExecutions.length).toBeGreaterThan(0);
  });
});
