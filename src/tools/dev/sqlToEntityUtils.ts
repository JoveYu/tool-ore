export type TargetLanguage = "typescript" | "go" | "java" | "python" | "rust" | "csharp";

export interface SqlColumn {
  name: string;
  originalType: string;
  genericType: "string" | "number" | "boolean" | "date" | "json" | "bytes" | "unknown";
  isPrimary: boolean;
  isNullable: boolean;
  comment?: string;
  defaultValue?: string;
}

export interface ParsedTable {
  tableName: string;
  tableComment?: string;
  columns: SqlColumn[];
}

export interface SqlToEntityOptions {
  namingStyle: "camelCase" | "snake_case" | "PascalCase";
  includeComments: boolean;
  includeAnnotations: boolean; // Lombok / GORM / Serde / JPA
  optionalNullable: boolean;
}

export const SAMPLE_CREATE_SQL = `CREATE TABLE \`sys_user\` (
  \`id\` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户主键ID',
  \`username\` VARCHAR(64) NOT NULL COMMENT '登录账号用户名',
  \`password_hash\` VARCHAR(128) NOT NULL COMMENT '加密密码哈希',
  \`nickname\` VARCHAR(64) DEFAULT NULL COMMENT '用户昵称',
  \`email\` VARCHAR(128) DEFAULT NULL COMMENT '安全邮箱地址',
  \`phone\` VARCHAR(32) DEFAULT NULL COMMENT '联系手机号码',
  \`avatar_url\` VARCHAR(255) DEFAULT NULL COMMENT '用户头像地址',
  \`gender\` TINYINT(1) DEFAULT '0' COMMENT '性别：0未知 1男 2女',
  \`account_balance\` DECIMAL(10,2) DEFAULT '0.00' COMMENT '账户可用余额',
  \`is_enabled\` TINYINT(1) NOT NULL DEFAULT '1' COMMENT '账号状态：1正常 0禁用',
  \`extra_config\` JSON DEFAULT NULL COMMENT '个性化扩展JSON配置',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_username\` (\`username\`),
  KEY \`idx_phone\` (\`phone\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户基础信息表';`;

/**
 * 转换下划线命名为大驼峰 PascalCase
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/^_+|_+$/g, "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

/**
 * 转换下划线命名为小驼峰 camelCase
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  if (!pascal) return "";
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * 格式化字段名
 */
export function formatFieldName(name: string, style: "camelCase" | "snake_case" | "PascalCase"): string {
  if (style === "camelCase") return toCamelCase(name);
  if (style === "PascalCase") return toPascalCase(name);
  return name.toLowerCase();
}

/**
 * 映射 SQL 数据类型为通用类型
 */
export function mapSqlTypeToGeneric(typeStr: string): "string" | "number" | "boolean" | "date" | "json" | "bytes" | "unknown" {
  const t = typeStr.toLowerCase();

  if (
    t.includes("tinyint(1)") ||
    t === "boolean" ||
    t === "bool" ||
    t.includes("is_")
  ) {
    return "boolean";
  }

  if (
    t.includes("int") ||
    t.includes("float") ||
    t.includes("double") ||
    t.includes("decimal") ||
    t.includes("numeric") ||
    t.includes("real")
  ) {
    return "number";
  }

  if (
    t.includes("char") ||
    t.includes("text") ||
    t.includes("blob") ||
    t.includes("uuid") ||
    t.includes("enum")
  ) {
    return "string";
  }

  if (
    t.includes("date") ||
    t.includes("time") ||
    t.includes("year")
  ) {
    return "date";
  }

  if (t.includes("json")) {
    return "json";
  }

  return "string";
}

/**
 * 解析 SQL CREATE TABLE 语句
 */
export function parseCreateTableSql(sql: string): ParsedTable {
  if (!sql.trim()) {
    return { tableName: "MyEntity", columns: [] };
  }

  // 1. 提取表名
  const tableMatch = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`|'|")?([a-zA-Z0-9_]+)(?:`|'|")?/i);
  const tableName = tableMatch ? tableMatch[1] : "MyEntity";

  // 提取表注释
  const tableCommentMatch = sql.match(/COMMENT\s*=\s*(?:'|")([^'"]+)(?:'|")/i);
  const tableComment = tableCommentMatch ? tableCommentMatch[1] : undefined;

  // 2. 提取列定义块
  const bodyStart = sql.indexOf("(");
  const bodyEnd = sql.lastIndexOf(")");
  if (bodyStart === -1 || bodyEnd === -1 || bodyEnd <= bodyStart) {
    return { tableName, tableComment, columns: [] };
  }

  const bodyContent = sql.substring(bodyStart + 1, bodyEnd);
  const lines = bodyContent.split("\n").map((l) => l.trim()).filter(Boolean);

  const columns: SqlColumn[] = [];
  const primaryKeys = new Set<string>();

  // 寻找主键声明 PRIMARY KEY (`id`)
  const pkMatch = bodyContent.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
  if (pkMatch) {
    const pkFields = pkMatch[1].replace(/[`'"]/g, "").split(",").map((f) => f.trim());
    pkFields.forEach((f) => primaryKeys.add(f));
  }

  for (const line of lines) {
    // 过滤索引与约束行
    if (
      line.startsWith("PRIMARY KEY") ||
      line.startsWith("KEY") ||
      line.startsWith("UNIQUE KEY") ||
      line.startsWith("INDEX") ||
      line.startsWith("CONSTRAINT") ||
      line.startsWith("FOREIGN KEY")
    ) {
      continue;
    }

    // 解析字段: `field_name` TYPE [NOT NULL] [DEFAULT ...] [COMMENT '...']
    const colMatch = line.match(/^(?:`|'|")?([a-zA-Z0-9_]+)(?:`|'|")?\s+([a-zA-Z0-9_]+(?:\([^)]+\))?)/);
    if (!colMatch) continue;

    const colName = colMatch[1];
    const originalType = colMatch[2];
    const genericType = mapSqlTypeToGeneric(originalType);

    const isPrimary = primaryKeys.has(colName) || /PRIMARY\s+KEY/i.test(line);
    const isNullable = !/NOT\s+NULL/i.test(line) && !isPrimary;

    // 提取注释
    const commentMatch = line.match(/COMMENT\s+(?:'|")([^'"]+)(?:'|")/i);
    const comment = commentMatch ? commentMatch[1] : undefined;

    columns.push({
      name: colName,
      originalType,
      genericType,
      isPrimary,
      isNullable,
      comment,
    });
  }

  return {
    tableName,
    tableComment,
    columns,
  };
}

/**
 * 生成 TypeScript Interface / Type
 */
export function generateTypeScript(table: ParsedTable, options: SqlToEntityOptions): string {
  const interfaceName = toPascalCase(table.tableName);
  const lines: string[] = [];

  if (options.includeComments && table.tableComment) {
    lines.push(`/**\n * ${table.tableComment}\n */`);
  }
  lines.push(`export interface ${interfaceName} {`);

  table.columns.forEach((col) => {
    const fieldName = formatFieldName(col.name, options.namingStyle);
    const isOptional = options.optionalNullable && col.isNullable;

    let tsType = "string";
    switch (col.genericType) {
      case "number":
        tsType = "number";
        break;
      case "boolean":
        tsType = "boolean";
        break;
      case "date":
        tsType = "string | Date";
        break;
      case "json":
        tsType = "Record<string, any>";
        break;
      default:
        tsType = "string";
    }

    if (options.includeComments && col.comment) {
      lines.push(`  /** ${col.comment} */`);
    }
    lines.push(`  ${fieldName}${isOptional ? "?" : ""}: ${tsType};`);
  });

  lines.push(`}`);
  return lines.join("\n");
}

/**
 * 生成 Go Struct (带 json / gorm 标签)
 */
export function generateGoStruct(table: ParsedTable, options: SqlToEntityOptions): string {
  const structName = toPascalCase(table.tableName);
  const lines: string[] = [];

  if (options.includeComments && table.tableComment) {
    lines.push(`// ${structName} ${table.tableComment}`);
  }
  lines.push(`type ${structName} struct {`);

  table.columns.forEach((col) => {
    const fieldName = toPascalCase(col.name);
    let goType = "string";

    switch (col.genericType) {
      case "number":
        goType = col.originalType.toLowerCase().includes("bigint") ? "int64" : col.originalType.toLowerCase().includes("decimal") ? "float64" : "int";
        break;
      case "boolean":
        goType = "bool";
        break;
      case "date":
        goType = "time.Time";
        break;
      case "json":
        goType = "json.RawMessage";
        break;
      default:
        goType = "string";
    }

    if (col.isNullable && options.optionalNullable) {
      goType = `*${goType}`;
    }

    const tags: string[] = [];
    tags.push(`json:"${col.name}${col.isNullable ? ",omitempty" : ""}"`);
    if (options.includeAnnotations) {
      const gormTags: string[] = [`column:${col.name}`];
      if (col.isPrimary) gormTags.push("primaryKey");
      if (!col.isNullable) gormTags.push("not null");
      tags.push(`gorm:"${gormTags.join(";")}"`);
    }

    const commentStr = options.includeComments && col.comment ? ` // ${col.comment}` : "";
    lines.push(`\t${fieldName.padEnd(16)} ${goType.padEnd(14)} \`${tags.join(" ")}\`${commentStr}`);
  });

  lines.push(`}`);
  return lines.join("\n");
}

/**
 * 生成 Java Entity (Lombok / JPA)
 */
export function generateJavaEntity(table: ParsedTable, options: SqlToEntityOptions): string {
  const className = toPascalCase(table.tableName);
  const lines: string[] = [];

  if (options.includeAnnotations) {
    lines.push(`import lombok.Data;`);
    lines.push(`import java.io.Serializable;`);
    lines.push(`import java.time.LocalDateTime;`);
    lines.push(`import java.math.BigDecimal;`);
    lines.push(``);
    lines.push(`@Data`);
  }

  if (options.includeComments && table.tableComment) {
    lines.push(`/**\n * ${table.tableComment}\n */`);
  }
  lines.push(`public class ${className} implements Serializable {`);
  lines.push(`    private static final long serialVersionUID = 1L;`);
  lines.push(``);

  table.columns.forEach((col) => {
    const fieldName = formatFieldName(col.name, "camelCase");
    let javaType = "String";

    switch (col.genericType) {
      case "number":
        if (col.originalType.toLowerCase().includes("bigint")) javaType = "Long";
        else if (col.originalType.toLowerCase().includes("decimal")) javaType = "BigDecimal";
        else if (col.originalType.toLowerCase().includes("double") || col.originalType.toLowerCase().includes("float")) javaType = "Double";
        else javaType = "Integer";
        break;
      case "boolean":
        javaType = "Boolean";
        break;
      case "date":
        javaType = "LocalDateTime";
        break;
      case "json":
        javaType = "String";
        break;
      default:
        javaType = "String";
    }

    if (options.includeComments && col.comment) {
      lines.push(`    /**\n     * ${col.comment}\n     */`);
    }
    lines.push(`    private ${javaType} ${fieldName};`);
    lines.push(``);
  });

  lines.push(`}`);
  return lines.join("\n");
}

/**
 * 生成 Python Pydantic Model
 */
export function generatePythonModel(table: ParsedTable, options: SqlToEntityOptions): string {
  const className = toPascalCase(table.tableName);
  const lines: string[] = [];

  lines.push(`from pydantic import BaseModel, Field`);
  lines.push(`from typing import Optional, Any, Dict`);
  lines.push(`from datetime import datetime`);
  lines.push(``);

  if (options.includeComments && table.tableComment) {
    lines.push(`class ${className}(BaseModel):\n    """${table.tableComment}"""`);
  } else {
    lines.push(`class ${className}(BaseModel):`);
  }

  table.columns.forEach((col) => {
    const fieldName = col.name;
    let pyType = "str";

    switch (col.genericType) {
      case "number":
        pyType = col.originalType.toLowerCase().includes("decimal") || col.originalType.toLowerCase().includes("float") ? "float" : "int";
        break;
      case "boolean":
        pyType = "bool";
        break;
      case "date":
        pyType = "datetime";
        break;
      case "json":
        pyType = "Dict[str, Any]";
        break;
      default:
        pyType = "str";
    }

    if (col.isNullable && options.optionalNullable) {
      pyType = `Optional[${pyType}]`;
    }

    const fieldParams: string[] = [];
    if (col.isNullable && options.optionalNullable) {
      fieldParams.push("default=None");
    }
    if (options.includeComments && col.comment) {
      fieldParams.push(`description="${col.comment}"`);
    }

    const fieldCall = fieldParams.length > 0 ? ` = Field(${fieldParams.join(", ")})` : "";
    lines.push(`    ${fieldName}: ${pyType}${fieldCall}`);
  });

  return lines.join("\n");
}

/**
 * 生成 Rust Struct (Serde)
 */
export function generateRustStruct(table: ParsedTable, options: SqlToEntityOptions): string {
  const structName = toPascalCase(table.tableName);
  const lines: string[] = [];

  if (options.includeAnnotations) {
    lines.push(`use serde::{Deserialize, Serialize};`);
    lines.push(`use chrono::{DateTime, Utc};`);
    lines.push(``);
    lines.push(`#[derive(Debug, Clone, Serialize, Deserialize)]`);
  }

  if (options.includeComments && table.tableComment) {
    lines.push(`/// ${table.tableComment}`);
  }
  lines.push(`pub struct ${structName} {`);

  table.columns.forEach((col) => {
    const fieldName = col.name.toLowerCase();
    let rustType = "String";

    switch (col.genericType) {
      case "number":
        rustType = col.originalType.toLowerCase().includes("bigint") ? "i64" : col.originalType.toLowerCase().includes("decimal") ? "f64" : "i32";
        break;
      case "boolean":
        rustType = "bool";
        break;
      case "date":
        rustType = "DateTime<Utc>";
        break;
      case "json":
        rustType = "serde_json::Value";
        break;
      default:
        rustType = "String";
    }

    if (col.isNullable && options.optionalNullable) {
      rustType = `Option<${rustType}>`;
    }

    if (options.includeComments && col.comment) {
      lines.push(`    /// ${col.comment}`);
    }
    lines.push(`    pub ${fieldName}: ${rustType},`);
  });

  lines.push(`}`);
  return lines.join("\n");
}

/**
 * 根据语言导出目标代码
 */
export function convertSqlToLanguage(
  sql: string,
  language: TargetLanguage,
  options: SqlToEntityOptions
): string {
  const parsed = parseCreateTableSql(sql);
  if (parsed.columns.length === 0) return "// 未能从输入中解析出有效的 CREATE TABLE 列定义";

  switch (language) {
    case "typescript":
      return generateTypeScript(parsed, options);
    case "go":
      return generateGoStruct(parsed, options);
    case "java":
      return generateJavaEntity(parsed, options);
    case "python":
      return generatePythonModel(parsed, options);
    case "rust":
      return generateRustStruct(parsed, options);
    case "csharp":
      return generateTypeScript(parsed, options); // fallback
    default:
      return generateTypeScript(parsed, options);
  }
}
