export type EntityEncodeType = "named" | "decimal" | "hex" | "full_hex";

export interface HtmlEntityOptions {
  mode: "encode" | "decode";
  encodeType: EntityEncodeType;
  encodeNonAscii: boolean; // 是否同时编码中文等非 ASCII 字符
}

const NAMED_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "©": "&copy;",
  "®": "&reg;",
  "™": "&trade;",
  "¥": "&yen;",
  "€": "&euro;",
  "£": "&pound;",
  "×": "&times;",
  "÷": "&divide;",
  "±": "&plusmn;",
  "§": "&sect;",
};

const REVERSE_NAMED_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&copy;": "©",
  "&reg;": "®",
  "&trade;": "™",
  "&yen;": "¥",
  "&euro;": "€",
  "&pound;": "£",
  "&nbsp;": " ",
  "&times;": "×",
  "&divide;": "÷",
  "&plusmn;": "±",
  "&sect;": "§",
};

/**
 * HTML / XML 实体编码
 */
export function encodeHtmlEntities(
  text: string,
  type: EntityEncodeType = "named",
  encodeNonAscii: boolean = false
): string {
  if (!text) return "";

  let result = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = text.charCodeAt(i);

    // 1. 关键特殊符号 ( & < > " ' )
    if (NAMED_ENTITIES[char]) {
      if (type === "named") {
        result += NAMED_ENTITIES[char];
      } else if (type === "decimal") {
        result += `&#${code};`;
      } else {
        result += `&#x${code.toString(16).toUpperCase()};`;
      }
      continue;
    }

    // 2. 非 ASCII 字符 (如中文、特殊符号)
    if (code > 127 && (encodeNonAscii || type === "full_hex")) {
      if (type === "decimal") {
        result += `&#${code};`;
      } else {
        result += `&#x${code.toString(16).toUpperCase()};`;
      }
      continue;
    }

    result += char;
  }

  return result;
}

/**
 * HTML / XML 实体解码
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return "";

  let result = text;

  // 1. 解码常见命名实体
  for (const [entity, char] of Object.entries(REVERSE_NAMED_ENTITIES)) {
    result = result.split(entity).join(char);
  }

  // 2. 解码十六进制实体 (&#x4e2d; / &#X4E2D;)
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    const code = parseInt(hex, 16);
    return !isNaN(code) ? String.fromCharCode(code) : _;
  });

  // 3. 解码十进制实体 (&#20013;)
  result = result.replace(/&#(\d+);/g, (_, dec) => {
    const code = parseInt(dec, 10);
    return !isNaN(code) ? String.fromCharCode(code) : _;
  });

  return result;
}

export const COMMON_HTML_ENTITIES = [
  { char: "<", name: "&lt;", dec: "&#60;", hex: "&#x3C;", desc: "小于号 Less Than" },
  { char: ">", name: "&gt;", dec: "&#62;", hex: "&#x3E;", desc: "大于号 Greater Than" },
  { char: "&", name: "&amp;", dec: "&#38;", hex: "&#x26;", desc: "和号 Ampersand" },
  { char: '"', name: "&quot;", dec: "&#34;", hex: "&#x22;", desc: "双引号 Quotation Mark" },
  { char: "'", name: "&apos;", dec: "&#39;", hex: "&#x27;", desc: "单引号 Apostrophe" },
  { char: " ", name: "&nbsp;", dec: "&#160;", hex: "&#xA0;", desc: "不换行空格 Non-breaking Space" },
  { char: "©", name: "&copy;", dec: "&#169;", hex: "&#xA9;", desc: "版权所有 Copyright" },
  { char: "®", name: "&reg;", dec: "&#174;", hex: "&#xAE;", desc: "注册商标 Registered" },
  { char: "¥", name: "&yen;", dec: "&#165;", hex: "&#xA5;", desc: "人民币 / 日元符号" },
];
