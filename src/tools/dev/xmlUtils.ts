export interface XmlFormatResult {
  isValid: boolean;
  result: string;
  error?: {
    message: string;
    line?: number;
    column?: number;
  };
  stats?: {
    nodesCount: number;
    lines: number;
    sizeBytes: number;
  };
}

/**
 * 纯前端高精度 XML 格式化与语法树美化
 */
export function formatXml(xmlStr: string, indentSpaces: number = 2): XmlFormatResult {
  const clean = xmlStr.trim();
  if (!clean) return { isValid: true, result: "" };

  // 1. DOMParser 语法校验
  if (typeof DOMParser !== "undefined") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(clean, "application/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      const errorText = parseError.textContent || "XML 语法错误";
      let line: number | undefined;
      let column: number | undefined;

      const lineMatch = errorText.match(/line\s*(\d+)/i) || errorText.match(/行\s*(\d+)/);
      if (lineMatch) line = parseInt(lineMatch[1], 10);

      const colMatch = errorText.match(/column\s*(\d+)/i) || errorText.match(/列\s*(\d+)/);
      if (colMatch) column = parseInt(colMatch[1], 10);

      return {
        isValid: false,
        result: clean,
        error: {
          message: errorText.split("\n")[0].trim(),
          line,
          column,
        },
      };
    }
  }

  // 2. 格式化缩进排版
  try {
    const indent = " ".repeat(indentSpaces);
    let formatted = "";
    let pad = 0;

    // 清洗多余空格与换行，按标签切分
    const sanitized = clean
      .replace(/>\s*</g, "><")
      .replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/\n/g, " "));

    const reg = /(<[^\/>][^>]*>)|(<\/[^>]+>)|(<[^>]+\/>)|([^<]+)/g;
    let match: RegExpExecArray | null;

    while ((match = reg.exec(sanitized)) !== null) {
      const token = match[0];
      if (!token.trim()) continue;

      if (token.startsWith("</")) {
        // 闭合标签
        pad = Math.max(0, pad - 1);
        formatted += `${indent.repeat(pad)}${token}\n`;
      } else if (token.startsWith("<?") || token.startsWith("<!") || token.endsWith("/>")) {
        // XML 声明、注释或自闭合单标签
        formatted += `${indent.repeat(pad)}${token}\n`;
      } else if (token.startsWith("<")) {
        // 开始标签
        formatted += `${indent.repeat(pad)}${token}\n`;
        pad++;
      } else {
        // 文本内容节点
        const textVal = token.trim();
        if (textVal) {
          formatted += `${indent.repeat(pad)}${textVal}\n`;
        }
      }
    }

    const finalStr = formatted.trim();
    const sizeBytes = new Blob([finalStr]).size;
    const lines = finalStr.split("\n").length;
    const nodesCount = (finalStr.match(/<[^>]+>/g) || []).length;

    return {
      isValid: true,
      result: finalStr,
      stats: {
        nodesCount,
        lines,
        sizeBytes,
      },
    };
  } catch (err: any) {
    return {
      isValid: false,
      result: clean,
      error: {
        message: err?.message || "格式化异常",
      },
    };
  }
}

/**
 * 单行压缩 XML
 */
export function minifyXml(xmlStr: string): string {
  return xmlStr
    .trim()
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ");
}
