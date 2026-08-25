export type UnicodeFormat =
  | "escape_u" // \u4e2d\u6587
  | "escape_U" // \U00004E2D
  | "code_point" // U+4E2D U+6587
  | "html_hex" // &#x4e2d;&#x6587;
  | "html_dec" // &#20013;&#25991;
  | "utf8_hex"; // E4 B8 AD E6 96 87

export interface UnicodeConvertResult {
  text: string;
  escapeU: string;
  escapeBigU: string;
  codePoint: string;
  htmlHex: string;
  htmlDec: string;
  utf8Hex: string;
}

/**
 * 将普通文本转换为各类 Unicode 编码格式
 */
export function textToUnicodeFormats(text: string): UnicodeConvertResult {
  if (!text) {
    return {
      text: "",
      escapeU: "",
      escapeBigU: "",
      codePoint: "",
      htmlHex: "",
      htmlDec: "",
      utf8Hex: "",
    };
  }

  let escapeU = "";
  let escapeBigU = "";
  const codePointList: string[] = [];
  let htmlHex = "";
  let htmlDec = "";

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const hex = code.toString(16).toUpperCase();

    if (code > 127) {
      escapeU += `\\u${hex.padStart(4, "0").toLowerCase()}`;
      escapeBigU += `\\U${hex.padStart(8, "0")}`;
      codePointList.push(`U+${hex.padStart(4, "0")}`);
      htmlHex += `&#x${hex};`;
      htmlDec += `&#${code};`;
    } else {
      escapeU += text[i];
      escapeBigU += text[i];
      codePointList.push(text[i]);
      htmlHex += text[i];
      htmlDec += text[i];
    }
  }

  // UTF-8 字节十六进制
  const utf8Bytes = new TextEncoder().encode(text);
  const utf8Hex = Array.from(utf8Bytes)
    .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
    .join(" ");

  return {
    text,
    escapeU,
    escapeBigU,
    codePoint: codePointList.join(" "),
    htmlHex,
    htmlDec,
    utf8Hex,
  };
}

/**
 * 自动识别并解码各类 Unicode / 实体 / UTF-8 格式为文本
 */
export function decodeToText(input: string): string {
  const clean = input.trim();
  if (!clean) return "";

  let result = clean;

  // 1. 解码 \uXXXX 或 \U0000XXXX
  result = result.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  result = result.replace(/\\U([0-9a-fA-F]{8})/g, (_, hex) => {
    return String.fromCodePoint(parseInt(hex, 16));
  });

  // 2. 解码 U+XXXX (支持连续由空格分隔的 U+XXXX 码位)
  result = result.replace(/U\+([0-9a-fA-F]{4,6})\s?/gi, (_, hex) => {
    return String.fromCodePoint(parseInt(hex, 16));
  });

  // 3. 解码 HTML 十六进制与十进制实体
  result = result.replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => {
    return String.fromCodePoint(parseInt(hex, 16));
  });
  result = result.replace(/&#(\d+);/g, (_, dec) => {
    return String.fromCodePoint(parseInt(dec, 10));
  });

  // 4. 尝试检测 UTF-8 Hex 空格分隔形式 (如 "E4 B8 AD E6 96 87")
  if (/^([0-9a-fA-F]{2}\s*)+$/.test(clean) && clean.includes(" ")) {
    try {
      const hexArr = clean.split(/\s+/).map((h) => parseInt(h, 16));
      const bytes = new Uint8Array(hexArr);
      const decoded = new TextDecoder().decode(bytes);
      if (decoded && !decoded.includes("\ufffd")) {
        return decoded;
      }
    } catch {}
  }

  return result;
}
