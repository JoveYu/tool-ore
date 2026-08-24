export interface JsonFormatOptions {
  indent: number; // 2 or 4 or tab
  sortKeys?: boolean;
  unescapeUnicode?: boolean;
}

export interface JsonProcessResult {
  formattedText: string;
  isValid: boolean;
  error?: {
    message: string;
    line?: number;
    column?: number;
  };
  stats?: {
    sizeBytes: number;
    lines: number;
    depth: number;
    keysCount: number;
  };
}

/**
 * 递归对对象的键进行字典序升序排序
 */
export function sortObjectKeys(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  const sorted: Record<string, any> = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = sortObjectKeys(obj[key]);
    });
  return sorted;
}

/**
 * 计算 JSON 对象的最大嵌套深度与总键数
 */
export function analyzeJsonStructure(obj: any, currentDepth = 1): { depth: number; keysCount: number } {
  if (obj === null || typeof obj !== "object") {
    return { depth: currentDepth, keysCount: 0 };
  }

  let maxDepth = currentDepth;
  let totalKeys = 0;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const res = analyzeJsonStructure(item, currentDepth + 1);
      maxDepth = Math.max(maxDepth, res.depth);
      totalKeys += res.keysCount;
    }
  } else {
    const keys = Object.keys(obj);
    totalKeys += keys.length;
    for (const key of keys) {
      const res = analyzeJsonStructure(obj[key], currentDepth + 1);
      maxDepth = Math.max(maxDepth, res.depth);
      totalKeys += res.keysCount;
    }
  }

  return { depth: maxDepth, keysCount: totalKeys };
}

/**
 * 解析错误信息中的行列号
 */
export function parseJsonError(err: Error, text: string): { message: string; line?: number; column?: number } {
  const msg = err.message;
  let line: number | undefined;
  let column: number | undefined;

  // Chrome / V8: "Unexpected token X in JSON at position 123"
  const posMatch = msg.match(/at position (\d+)/i);
  if (posMatch) {
    const pos = parseInt(posMatch[1], 10);
    const lines = text.slice(0, pos).split("\n");
    line = lines.length;
    column = lines[lines.length - 1].length + 1;
  }

  // Firefox: "JSON.parse: expected property name or '}' at line 2 column 5 of the JSON data"
  const lineColMatch = msg.match(/line (\d+) column (\d+)/i);
  if (lineColMatch) {
    line = parseInt(lineColMatch[1], 10);
    column = parseInt(lineColMatch[2], 10);
  }

  return {
    message: msg,
    line,
    column,
  };
}

/**
 * 格式化 / 美化 JSON
 */
export function formatJson(text: string, options: JsonFormatOptions): JsonProcessResult {
  if (!text.trim()) {
    return { formattedText: "", isValid: true };
  }

  try {
    let parsed = JSON.parse(text);

    if (options.sortKeys) {
      parsed = sortObjectKeys(parsed);
    }

    let indentStr: string | number = options.indent;
    let formatted = JSON.stringify(parsed, null, indentStr);

    if (options.unescapeUnicode) {
      formatted = formatted.replace(/\\u[\dA-Fa-f]{4}/g, (match) => {
        return String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16));
      });
    }

    const structure = analyzeJsonStructure(parsed);

    return {
      formattedText: formatted,
      isValid: true,
      stats: {
        sizeBytes: new Blob([formatted]).size,
        lines: formatted.split("\n").length,
        depth: structure.depth,
        keysCount: structure.keysCount,
      },
    };
  } catch (err: any) {
    return {
      formattedText: text,
      isValid: false,
      error: parseJsonError(err, text),
    };
  }
}

/**
 * 压缩/单行化 JSON
 */
export function minifyJson(text: string): JsonProcessResult {
  if (!text.trim()) {
    return { formattedText: "", isValid: true };
  }

  try {
    const parsed = JSON.parse(text);
    const minified = JSON.stringify(parsed);
    return {
      formattedText: minified,
      isValid: true,
      stats: {
        sizeBytes: new Blob([minified]).size,
        lines: 1,
        depth: 0,
        keysCount: 0,
      },
    };
  } catch (err: any) {
    return {
      formattedText: text,
      isValid: false,
      error: parseJsonError(err, text),
    };
  }
}
