import YAML from "yaml";

export interface YamlConvertResult {
  isValid: boolean;
  result: string;
  error?: {
    message: string;
    line?: number;
    column?: number;
  };
}

/**
 * 将 YAML 文本转换为格式化 JSON
 */
export function yamlToJson(yamlStr: string, indent: number = 2): YamlConvertResult {
  const clean = yamlStr.trim();
  if (!clean) {
    return { isValid: true, result: "" };
  }

  try {
    const parsed = YAML.parse(yamlStr);
    return {
      isValid: true,
      result: JSON.stringify(parsed, null, indent),
    };
  } catch (err: any) {
    let line: number | undefined;
    let column: number | undefined;

    if (err?.linePos && Array.isArray(err.linePos)) {
      line = err.linePos[0]?.line;
      column = err.linePos[0]?.col;
    }

    return {
      isValid: false,
      result: "",
      error: {
        message: err?.message || "YAML 语法解析错误",
        line,
        column,
      },
    };
  }
}

/**
 * 将 JSON 文本转换为标准 YAML
 */
export function jsonToYaml(jsonStr: string, indent: number = 2): YamlConvertResult {
  const clean = jsonStr.trim();
  if (!clean) {
    return { isValid: true, result: "" };
  }

  try {
    const parsed = JSON.parse(jsonStr);
    const yamlResult = YAML.stringify(parsed, {
      indent,
    });
    return {
      isValid: true,
      result: yamlResult,
    };
  } catch (err: any) {
    let line: number | undefined;
    let column: number | undefined;

    const match = err?.message?.match(/at position (\d+)/);
    if (match) {
      const pos = parseInt(match[1], 10);
      const lines = jsonStr.slice(0, pos).split("\n");
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    return {
      isValid: false,
      result: "",
      error: {
        message: err?.message || "JSON 语法格式无效",
        line,
        column,
      },
    };
  }
}
