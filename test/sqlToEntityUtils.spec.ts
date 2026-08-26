import { describe, it, expect } from "vitest";
import {
  parseCreateTableSql,
  generateTypeScript,
  generateGoStruct,
  generateJavaEntity,
  generatePythonModel,
  generateRustStruct,
  convertSqlToLanguage,
  SAMPLE_CREATE_SQL,
  SqlToEntityOptions,
} from "../src/tools/dev/sqlToEntityUtils";

describe("SQL To Entity Utilities", () => {
  const defaultOptions: SqlToEntityOptions = {
    namingStyle: "camelCase",
    includeComments: true,
    includeAnnotations: true,
    optionalNullable: true,
  };

  it("parses MySQL CREATE TABLE statement correctly", () => {
    const table = parseCreateTableSql(SAMPLE_CREATE_SQL);
    expect(table.tableName).toBe("sys_user");
    expect(table.tableComment).toBe("系统用户基础信息表");
    expect(table.columns.length).toBeGreaterThan(8);

    const idCol = table.columns.find((c) => c.name === "id");
    expect(idCol?.isPrimary).toBe(true);
    expect(idCol?.genericType).toBe("number");
    expect(idCol?.comment).toBe("用户主键ID");

    const emailCol = table.columns.find((c) => c.name === "email");
    expect(emailCol?.isNullable).toBe(true);
  });

  it("generates TypeScript interface with proper types and JSDoc", () => {
    const tsCode = convertSqlToLanguage(SAMPLE_CREATE_SQL, "typescript", defaultOptions);
    expect(tsCode).toContain("export interface SysUser {");
    expect(tsCode).toContain("id: number;");
    expect(tsCode).toContain("email?: string;");
    expect(tsCode).toContain("/** 用户主键ID */");
  });

  it("generates Go struct with json and GORM tags", () => {
    const goCode = convertSqlToLanguage(SAMPLE_CREATE_SQL, "go", defaultOptions);
    expect(goCode).toContain("type SysUser struct {");
    expect(goCode).toContain('json:"id" gorm:"column:id;primaryKey;not null"');
    expect(goCode).toContain("*string"); // optional nullable pointer
  });

  it("generates Java entity with Lombok annotations", () => {
    const javaCode = convertSqlToLanguage(SAMPLE_CREATE_SQL, "java", defaultOptions);
    expect(javaCode).toContain("@Data");
    expect(javaCode).toContain("public class SysUser implements Serializable {");
    expect(javaCode).toContain("private Long id;");
    expect(javaCode).toContain("private BigDecimal accountBalance;");
  });

  it("generates Python Pydantic models", () => {
    const pyCode = convertSqlToLanguage(SAMPLE_CREATE_SQL, "python", defaultOptions);
    expect(pyCode).toContain("class SysUser(BaseModel):");
    expect(pyCode).toContain("id: int");
    expect(pyCode).toContain("Optional[str]");
  });

  it("generates Rust struct with Serde attributes", () => {
    const rustCode = convertSqlToLanguage(SAMPLE_CREATE_SQL, "rust", defaultOptions);
    expect(rustCode).toContain("#[derive(Debug, Clone, Serialize, Deserialize)]");
    expect(rustCode).toContain("pub struct SysUser {");
    expect(rustCode).toContain("pub id: i64,");
  });
});
