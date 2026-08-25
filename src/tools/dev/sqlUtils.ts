import { format, SqlLanguage } from "sql-formatter";

export type SqlDialect =
  | "sql"
  | "mysql"
  | "postgresql"
  | "sqlite"
  | "mariadb"
  | "plsql"
  | "spark"
  | "transactsql";

export interface SqlFormatOptions {
  dialect: SqlDialect;
  keywordCase: "upper" | "lower" | "preserve";
  indent: number; // 2 or 4
  minify: boolean;
}

export const SQL_DIALECTS: { id: SqlDialect; label: string }[] = [
  { id: "sql", label: "Standard SQL (标准)" },
  { id: "mysql", label: "MySQL" },
  { id: "postgresql", label: "PostgreSQL" },
  { id: "sqlite", label: "SQLite" },
  { id: "mariadb", label: "MariaDB" },
  { id: "transactsql", label: "SQL Server (T-SQL)" },
  { id: "plsql", label: "Oracle (PL/SQL)" },
  { id: "spark", label: "Spark SQL" },
];

/**
 * 格式化或单行压缩 SQL
 */
export function formatSql(
  sql: string,
  options: SqlFormatOptions = {
    dialect: "sql",
    keywordCase: "upper",
    indent: 2,
    minify: false,
  }
): { isValid: boolean; result: string; error?: string } {
  const clean = sql.trim();
  if (!clean) return { isValid: true, result: "" };

  if (options.minify) {
    // 单行压缩
    const minified = clean
      .replace(/--.*$/gm, "") // 移除单行注释
      .replace(/\/\*[\s\S]*?\*\//g, "") // 移除多行注释
      .replace(/\s+/g, " ")
      .trim();
    return { isValid: true, result: minified };
  }

  try {
    const formatted = format(clean, {
      language: options.dialect as SqlLanguage,
      tabWidth: options.indent,
      keywordCase: options.keywordCase,
      linesBetweenQueries: 2,
    });

    return {
      isValid: true,
      result: formatted,
    };
  } catch (err: any) {
    return {
      isValid: false,
      result: clean,
      error: `SQL 解析提示: ${err?.message || "语法结构可能有误"}`,
    };
  }
}
