export interface TextStats {
  charactersWithSpaces: number;
  charactersNoSpaces: number;
  chineseCharacters: number;
  englishWords: number;
  numbersCount: number;
  punctuationCount: number;
  linesCount: number;
  paragraphsCount: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}

/**
 * 盘古之白 (Pangu) 中英文混排加空格算法
 * 在中文与英文/数字之间自动补齐空格，标点规范化
 */
export function formatPanguText(text: string): string {
  if (!text) return "";

  let result = text;

  // 1. 中文与英文/数字/符号之间加空格
  // CJK 与 英文/数字
  result = result.replace(/([\u4e00-\u9fa5\u3040-\u30ff])([a-zA-Z0-9_#$])/g, "$1 $2");
  // 英文/数字 与 CJK
  result = result.replace(/([a-zA-Z0-9_#$])([\u4e00-\u9fa5\u3040-\u30ff])/g, "$1 $2");

  // 2. 中文与百分号/美元符号
  result = result.replace(/([\u4e00-\u9fa5])([%])/g, "$1 $2");

  // 3. 处理多余的连续空格 (保留换行)
  result = result.replace(/[ \t]{2,}/g, " ");

  return result;
}

/**
 * 全角字符转半角字符
 */
export function fullWidthToHalfWidth(text: string): string {
  if (!text) return "";
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // 全角空格
    if (code === 12288) {
      result += String.fromCharCode(32);
    } else if (code >= 65281 && code <= 65374) {
      // 全角字符 (除空格外的 ! 到 ~)
      result += String.fromCharCode(code - 65248);
    } else {
      result += text[i];
    }
  }
  return result;
}

/**
 * 半角标点转中文全角标点
 */
export function halfWidthToFullWidthPunctuation(text: string): string {
  if (!text) return "";
  const map: Record<string, string> = {
    ",": "，",
    ".": "。",
    "?": "？",
    "!": "！",
    ":": "：",
    ";": "；",
    "(": "（",
    ")": "）",
  };
  return text.replace(/[,.?!:;()]/g, (m) => map[m] || m);
}

/**
 * 计算文本各项指标统计数据
 */
export function analyzeTextStats(text: string): TextStats {
  if (!text) {
    return {
      charactersWithSpaces: 0,
      charactersNoSpaces: 0,
      chineseCharacters: 0,
      englishWords: 0,
      numbersCount: 0,
      punctuationCount: 0,
      linesCount: 0,
      paragraphsCount: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
    };
  }

  const charactersWithSpaces = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  // 匹配中文字符 (CJK)
  const chineseMatches = text.match(/[\u4e00-\u9fa5]/g);
  const chineseCharacters = chineseMatches ? chineseMatches.length : 0;

  // 匹配英文单词
  const wordsMatches = text.match(/[a-zA-Z0-9]+(?:[-'][a-zA-Z0-9]+)*/g);
  const englishWords = wordsMatches ? wordsMatches.length : 0;

  // 匹配数字串
  const numberMatches = text.match(/\d+/g);
  const numbersCount = numberMatches ? numberMatches.length : 0;

  // 标点符号数
  const punctuationMatches = text.match(/[\p{P}\p{S}]/gu);
  const punctuationCount = punctuationMatches ? punctuationMatches.length : 0;

  // 行数与段落数
  const lines = text.split("\n");
  const linesCount = lines.length;
  const paragraphsCount = lines.filter((l) => l.trim().length > 0).length;

  // 阅读时间估算：中文约 350 字/分钟，英文约 200 词/分钟
  const totalReadUnits = chineseCharacters + englishWords;
  const readingTimeMinutes = Math.max(0.1, parseFloat((totalReadUnits / 300).toFixed(1)));
  // 演讲朗读时间：约 180 字/分钟
  const speakingTimeMinutes = Math.max(0.1, parseFloat((totalReadUnits / 180).toFixed(1)));

  return {
    charactersWithSpaces,
    charactersNoSpaces,
    chineseCharacters,
    englishWords,
    numbersCount,
    punctuationCount,
    linesCount,
    paragraphsCount,
    readingTimeMinutes,
    speakingTimeMinutes,
  };
}
