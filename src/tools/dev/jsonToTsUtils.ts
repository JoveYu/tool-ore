export interface JsonToTsOptions {
  rootName: string;
  useType: boolean; // type vs interface
  readonlyProps: boolean;
  exportKeyword: boolean;
  optionalNulls: boolean;
  indent: number; // 2 or 4
}

export const DEFAULT_JSON_TO_TS_OPTIONS: JsonToTsOptions = {
  rootName: "RootObject",
  useType: false,
  readonlyProps: false,
  exportKeyword: true,
  optionalNulls: false,
  indent: 2,
};

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[a-z]/, (chr) => chr.toUpperCase());
}

/**
 * 递归类型推导与 TypeScript 声明生成器
 */
export function jsonToTypeScript(
  jsonString: string,
  options: JsonToTsOptions = DEFAULT_JSON_TO_TS_OPTIONS
): { isValid: boolean; result: string; error?: string } {
  const clean = jsonString.trim();
  if (!clean) return { isValid: true, result: "" };

  let parsed: any;
  try {
    parsed = JSON.parse(clean);
  } catch (err: any) {
    return {
      isValid: false,
      result: "",
      error: `JSON 语法解析错误: ${err?.message || "格式不合法"}`,
    };
  }

  const generatedInterfaces: Map<string, string> = new Map();
  const indentStr = " ".repeat(options.indent);

  function inferType(val: any, fieldName: string): string {
    if (val === null) return options.optionalNulls ? "any" : "null | any";
    if (typeof val === "string") return "string";
    if (typeof val === "number") return "number";
    if (typeof val === "boolean") return "boolean";

    if (Array.isArray(val)) {
      if (val.length === 0) return "any[]";
      // 聚合数组所有元素的类型
      const elementTypes = Array.from(
        new Set(val.map((item) => inferType(item, fieldName)))
      );
      if (elementTypes.length === 1) {
        return `${elementTypes[0]}[]`;
      }
      return `(${elementTypes.join(" | ")})[]`;
    }

    if (typeof val === "object") {
      const subInterfaceName = toPascalCase(fieldName || "Item");
      createInterface(val, subInterfaceName);
      return subInterfaceName;
    }

    return "any";
  }

  function createInterface(obj: Record<string, any>, name: string): void {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return;

    // 避免重复生成同名接口
    if (generatedInterfaces.has(name)) return;

    const lines: string[] = [];
    const exportPrefix = options.exportKeyword ? "export " : "";
    const declKeyword = options.useType ? "type" : "interface";
    const declHeader = options.useType
      ? `${exportPrefix}type ${name} = {`
      : `${exportPrefix}interface ${name} {`;

    lines.push(declHeader);

    for (const [key, val] of Object.entries(obj)) {
      const isIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
      const safeKey = isIdentifier ? key : `"${key}"`;
      const readonlyPrefix = options.readonlyProps ? "readonly " : "";
      const optionalSuffix = options.optionalNulls && val === null ? "?" : "";
      const typeStr = inferType(val, key);

      lines.push(`${indentStr}${readonlyPrefix}${safeKey}${optionalSuffix}: ${typeStr};`);
    }

    lines.push(options.useType ? "};" : "}");
    generatedInterfaces.set(name, lines.join("\n"));
  }

  const rootName = options.rootName.trim() || "RootObject";

  if (Array.isArray(parsed)) {
    if (parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null) {
      createInterface(parsed[0], `${rootName}Item`);
      const exportPrefix = options.exportKeyword ? "export " : "";
      const rootTypeDecl = `${exportPrefix}type ${rootName} = ${rootName}Item[];`;
      const allDecls = [...Array.from(generatedInterfaces.values()), rootTypeDecl];
      return { isValid: true, result: allDecls.join("\n\n") };
    } else {
      const itemType = parsed.length > 0 ? typeof parsed[0] : "any";
      const exportPrefix = options.exportKeyword ? "export " : "";
      return { isValid: true, result: `${exportPrefix}type ${rootName} = ${itemType}[];` };
    }
  } else if (typeof parsed === "object" && parsed !== null) {
    createInterface(parsed, rootName);
    return {
      isValid: true,
      result: Array.from(generatedInterfaces.values()).reverse().join("\n\n"),
    };
  }

  return {
    isValid: true,
    result: `export type ${rootName} = ${typeof parsed};`,
  };
}
