import { describe, it, expect } from "vitest";
import {
  parseDelimitedText,
  parseCsvLine,
  tableToJson,
  tableToSql,
  tableToMarkdown,
  tableToHtml,
  tableToCsv,
  SAMPLE_TABLE_TEXT,
  ConvertOptions,
} from "../src/tools/doc/tableConverterUtils";

describe("Table Converter Utilities", () => {
  const defaultOptions: ConvertOptions = {
    hasHeader: true,
    trimWhitespace: true,
    skipEmptyRows: true,
    inferTypes: true,
    sqlTableName: "users",
    jsonMode: "object_array",
    csvDelimiter: ",",
  };

  it("parses tab-delimited Excel text correctly", () => {
    const data = parseDelimitedText(SAMPLE_TABLE_TEXT, { trimWhitespace: true });
    expect(data.headers).toEqual(["工号", "姓名", "部门", "职位", "薪资", "入职日期", "状态"]);
    expect(data.rows.length).toBe(5);
    expect(data.rows[0][1]).toBe("张伟");
    expect(data.rows[0][4]).toBe("35000");
  });

  it("parses CSV lines with escaped quotes properly", () => {
    const line = '101,"Beijing, China","Software ""Senior"" Engineer"';
    const parsed = parseCsvLine(line, ",");
    expect(parsed).toEqual(["101", "Beijing, China", 'Software "Senior" Engineer']);
  });

  it("converts table data to JSON objects array with inferred types", () => {
    const data = parseDelimitedText("id\tname\tage\tisAdmin\n1\tAlice\t28\ttrue\n2\tBob\t34\tfalse", {
      trimWhitespace: true,
    });
    const jsonStr = tableToJson(data, defaultOptions);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.length).toBe(2);
    expect(parsed[0].id).toBe(1); // inferred number
    expect(parsed[0].age).toBe(28);
    expect(parsed[0].isAdmin).toBe(true); // inferred boolean
  });

  it("converts table data to SQL INSERT statements", () => {
    const data = parseDelimitedText("id\tname\tscore\n1\tTom\t95.5\n2\tJerry\t88", {
      trimWhitespace: true,
    });
    const sql = tableToSql(data, defaultOptions);

    expect(sql).toContain("INSERT INTO `users` (`id`, `name`, `score`)");
    expect(sql).toContain("(1, 'Tom', 95.5)");
  });

  it("converts table data to Markdown table format", () => {
    const data = parseDelimitedText("姓名\t年龄\n张三\t25", { trimWhitespace: true });
    const md = tableToMarkdown(data, defaultOptions);

    expect(md).toContain("| 姓名 | 年龄 |");
    expect(md).toContain("| :--- | :--- |");
    expect(md).toContain("| 张三 | 25 |");
  });

  it("converts table data to HTML table string", () => {
    const data = parseDelimitedText("a\tb\n1\t2", { trimWhitespace: true });
    const html = tableToHtml(data, defaultOptions);

    expect(html).toContain('<table class="data-table">');
    expect(html).toContain("<th>a</th>");
    expect(html).toContain("<td>1</td>");
  });

  it("converts table data to standard CSV with auto-escaping", () => {
    const data = parseDelimitedText('item\tdesc\nBook\t"Hello, World!"', { trimWhitespace: true });
    const csv = tableToCsv(data, defaultOptions);

    expect(csv).toContain("item,desc");
    expect(csv).toContain('Book,"""Hello, World!"""');
  });
});
