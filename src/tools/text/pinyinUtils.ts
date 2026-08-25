import { pinyin } from "pinyin-pro";
import * as OpenCC from "opencc-js";

export type PinyinToneType = "symbol" | "none" | "num" | "first_letter" | "ruby_html";

export interface PinyinOptions {
  toneType: PinyinToneType;
  separator: string; // 空格、无分隔符、短横线
  uppercase: boolean;
}

// 基于成熟 OpenCC 引擎初始化简繁转换器
const s2tConverter = OpenCC.Converter({ from: "cn", to: "tw" });
const s2hkConverter = OpenCC.Converter({ from: "cn", to: "hk" });
const t2sConverter = OpenCC.Converter({ from: "tw", to: "cn" });
const hk2sConverter = OpenCC.Converter({ from: "hk", to: "cn" });

/**
 * 简体中文转繁体中文（支持台湾正体、香港繁体、标准繁体）
 */
export function convertToTraditional(text: string, variant: "tw" | "hk" | "t" = "tw"): string {
  if (!text) return "";
  if (variant === "hk") {
    return s2hkConverter(text);
  }
  return s2tConverter(text);
}

/**
 * 繁体中文转简体中文
 */
export function convertToSimplified(text: string): string {
  if (!text) return "";
  // 经两遍转换确保全面覆盖港台异体字
  return t2sConverter(hk2sConverter(text));
}

/**
 * 汉字转拼音主函数
 */
export function convertToPinyin(text: string, options: PinyinOptions): string {
  const clean = text.trim();
  if (!clean) return "";

  if (options.toneType === "ruby_html") {
    // 渲染带有 <ruby> 汉字注音标签的 HTML
    let rubyHtml = "";
    for (let i = 0; i < clean.length; i++) {
      const char = clean[i];
      if (/[\u4e00-\u9fa5]/.test(char)) {
        const py = pinyin(char, { toneType: "symbol" });
        rubyHtml += `<ruby>${char}<rt>${py}</rt></ruby>`;
      } else if (char === "\n") {
        rubyHtml += "<br/>";
      } else {
        rubyHtml += char;
      }
    }
    return rubyHtml;
  }

  let pyResult = "";
  if (options.toneType === "first_letter") {
    pyResult = pinyin(clean, { pattern: "first", separator: options.separator });
  } else {
    pyResult = pinyin(clean, {
      toneType: options.toneType as any,
      separator: options.separator,
    });
  }

  if (options.uppercase) {
    pyResult = pyResult.toUpperCase();
  }

  return pyResult;
}
