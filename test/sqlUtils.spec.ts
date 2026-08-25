import { describe, it, expect } from "vitest";
import { formatSql } from "../src/tools/dev/sqlUtils";

describe("SQL Formatter Utilities", () => {
  it("formats SQL query and capitalizes keywords properly", () => {
    const raw = "select id, name, age from users where age > 18 order by id desc limit 10";
    const res = formatSql(raw, {
      dialect: "mysql",
      keywordCase: "upper",
      indent: 2,
      minify: false,
    });

    expect(res.isValid).toBe(true);
    expect(res.result).toContain("SELECT");
    expect(res.result).toContain("FROM");
    expect(res.result).toContain("WHERE");
    expect(res.result).toContain("ORDER BY");
  });

  it("minifies SQL into a single line cleanly", () => {
    const raw = `
      SELECT
        u.id,
        u.name
      FROM users u
      -- 这是一个单行注释
      WHERE u.status = 1;
    `;
    const res = formatSql(raw, {
      dialect: "sql",
      keywordCase: "upper",
      indent: 2,
      minify: true,
    });

    expect(res.isValid).toBe(true);
    expect(res.result).not.toContain("\n");
    expect(res.result).toBe("SELECT u.id, u.name FROM users u WHERE u.status = 1;");
  });
});
