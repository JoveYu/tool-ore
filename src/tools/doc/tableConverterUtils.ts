export interface TableData {
  headers: string[];
  rows: string[][];
}

export type ExportFormatType = "json" | "sql" | "markdown" | "html" | "csv";

export interface ConvertOptions {
  hasHeader: boolean;
  trimWhitespace: boolean;
  skipEmptyRows: boolean;
  inferTypes: boolean; // 是否尝试将纯数字和布尔值转换为实际 JSON 类型
  sqlTableName?: string;
  jsonMode?: "object_array" | "2d_array";
  csvDelimiter?: string;
}

export const SAMPLE_TABLE_TEXT = `工号\t姓名\t部门\t职位\t薪资\t入职日期\t状态
1001\t张伟\t技术研发部\t高级架构师\t35000\t2022-03-15\t在职
1002\t李娜\t产品运营部\t资深产品经理\t28000\t2021-07-20\t在职
1003\t王强\t市场营销部\t市场总监\t42000\t2020-05-10\t在职
1004\t赵敏\t财务管理部\t财务主管\t25000\t2023-02-01\t在职
1005\t孙浩\t技术研发部\t前端工程师\t22000\t2024-06-18\t试用期`;

/**
 * 解析用户粘贴的制表符或逗号分隔文本为结构化表格数据
 */
export function parseDelimitedText(
  rawText: string,
  options: { trimWhitespace?: boolean; skipEmptyRows?: boolean } = {}
): TableData {
  if (!rawText || !rawText.trim()) {
    return { headers: [], rows: [] };
  }

  const lines = rawText.split(/\r?\n/);
  const rawRows: string[][] = [];

  // 检测主要分隔符 (优先制表符 \t，其次逗号 ,，再次分号 ;)
  let delimiter = "\t";
  const firstNonEmpty = lines.find((l) => l.trim().length > 0) || "";
  if (!firstNonEmpty.includes("\t")) {
    if (firstNonEmpty.includes(",")) delimiter = ",";
    else if (firstNonEmpty.includes(";")) delimiter = ";";
  }

  for (const line of lines) {
    if (options.skipEmptyRows && !line.trim()) {
      continue;
    }

    let cells: string[] = [];
    if (delimiter === ",") {
      // 简单 CSV 逗号解析 (支持双引号包裹字段)
      cells = parseCsvLine(line, delimiter);
    } else {
      cells = line.split(delimiter);
    }

    if (options.trimWhitespace) {
      cells = cells.map((c) => c.trim());
    }

    rawRows.push(cells);
  }

  if (rawRows.length === 0) {
    return { headers: [], rows: [] };
  }

  // 规范化列数，以最大列长为基准补齐
  const maxCols = Math.max(...rawRows.map((r) => r.length), 1);
  const normalizedRows = rawRows.map((row) => {
    if (row.length < maxCols) {
      return [...row, ...Array(maxCols - row.length).fill("")];
    }
    return row;
  });

  const headers = normalizedRows[0] || [];
  const rows = normalizedRows.slice(1);

  return { headers, rows };
}

/**
 * 处理带双引号包裹的 CSV 单行字符
 */
export function parseCsvLine(line: string, delimiter: string = ","): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * 推导类型：尝试将字符串转为 number / boolean，无法转换则保持原字符串
 */
function castValue(val: string, inferTypes: boolean): any {
  if (!inferTypes) return val;
  const trimmed = val.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed) && !trimmed.startsWith("00")) {
    const num = Number(trimmed);
    if (!isNaN(num)) return num;
  }
  return val;
}

/**
 * 转为 JSON 格式
 */
export function tableToJson(data: TableData, options: ConvertOptions): string {
  if (data.headers.length === 0 && data.rows.length === 0) return "[]";

  if (options.jsonMode === "2d_array" || !options.hasHeader) {
    const all = options.hasHeader ? [data.headers, ...data.rows] : data.rows;
    const array2d = all.map((row) =>
      row.map((cell) => castValue(cell, options.inferTypes))
    );
    return JSON.stringify(array2d, null, 2);
  }

  // 对象数组模式
  const objectList = data.rows.map((row) => {
    const obj: Record<string, any> = {};
    data.headers.forEach((header, idx) => {
      const key = header || `column_${idx + 1}`;
      obj[key] = castValue(row[idx] ?? "", options.inferTypes);
    });
    return obj;
  });

  return JSON.stringify(objectList, null, 2);
}

/**
 * 转为 SQL INSERT 批量插入语句
 */
export function tableToSql(data: TableData, options: ConvertOptions): string {
  if (data.headers.length === 0 && data.rows.length === 0) return "-- 暂无表格数据";

  const tableName = options.sqlTableName?.trim() || "my_table";
  const columns = options.hasHeader
    ? data.headers.map((h, i) => `\`${h.trim() || `col_${i + 1}`}\``).join(", ")
    : data.rows[0]?.map((_, i) => `\`col_${i + 1}\``).join(", ") || "";

  const rowsToInsert = options.hasHeader ? data.rows : [data.headers, ...data.rows];

  const valueLines = rowsToInsert.map((row) => {
    const values = row
      .map((val) => {
        if (options.inferTypes) {
          const casted = castValue(val, true);
          if (typeof casted === "number") return casted;
          if (typeof casted === "boolean") return casted ? 1 : 0;
          if (casted === null) return "NULL";
        }
        // 转义单引号
        const escaped = val.replace(/'/g, "''");
        return `'${escaped}'`;
      })
      .join(", ");
    return `  (${values})`;
  });

  return `INSERT INTO \`${tableName}\` (${columns})\nVALUES\n${valueLines.join(",\n")};`;
}

/**
 * 转为 Markdown 表格
 */
export function tableToMarkdown(data: TableData, options: ConvertOptions): string {
  const headers = options.hasHeader
    ? data.headers
    : data.headers.map((_, i) => `列 ${i + 1}`);

  if (headers.length === 0) return "";

  const headerLine = `| ${headers.map((h) => h || "-").join(" | ")} |`;
  const separatorLine = `| ${headers.map(() => ":---").join(" | ")} |`;

  const bodyLines = data.rows.map(
    (row) => `| ${row.map((cell) => cell.replace(/\|/g, "\\|") || " ").join(" | ")} |`
  );

  return [headerLine, separatorLine, ...bodyLines].join("\n");
}

/**
 * 转为 HTML <table> 源码
 */
export function tableToHtml(data: TableData, options: ConvertOptions): string {
  const lines: string[] = ['<table class="data-table">'];

  if (options.hasHeader && data.headers.length > 0) {
    lines.push("  <thead>");
    lines.push("    <tr>");
    data.headers.forEach((h) => {
      lines.push(`      <th>${escapeHtml(h)}</th>`);
    });
    lines.push("    </tr>");
    lines.push("  </thead>");
  }

  lines.push("  <tbody>");
  data.rows.forEach((row) => {
    lines.push("    <tr>");
    row.forEach((cell) => {
      lines.push(`      <td>${escapeHtml(cell)}</td>`);
    });
    lines.push("    </tr>");
  });
  lines.push("  </tbody>");
  lines.push("</table>");

  return lines.join("\n");
}

/**
 * 转为标准 CSV 文本
 */
export function tableToCsv(data: TableData, options: ConvertOptions): string {
  const delimiter = options.csvDelimiter || ",";
  const allRows = options.hasHeader ? [data.headers, ...data.rows] : data.rows;

  return allRows
    .map((row) =>
      row
        .map((cell) => {
          if (cell.includes(delimiter) || cell.includes('"') || cell.includes("\n")) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(delimiter)
    )
    .join("\n");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
