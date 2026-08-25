import Mint from "mint-filter";

export type WordCategory = "ad_law" | "spam_marketing" | "profanity";

export interface SensitiveWordResult {
  hasSensitiveWord: boolean;
  matchedWords: string[];
  wordCounts: Record<string, number>;
  totalMatches: number;
  filteredText: string;
  highlightedHtml: string;
}

// 1. 广告法常见极限词与虚假夸大词库
export const AD_LAW_WORDS = [
  "最先进", "最高级", "最顶级", "第一名", "首选品牌", "顶级", "国家级", "全球第一", "全国第一",
  "全网第一", "独家", "极品", "绝无仅有", "史无前例", "前无古人", "世界领先", "独一无二",
  "万能", "全能", "永久免费", "百分之百", "100%", "包治百病", "根治", "无毒副作用", "无任何副作用",
  "特效", "神效", "纯天然", "免检产品", "特供", "专供", "军工品质", "驰名商标", "销量第一",
  "行业领先", "首个", "第一家", "唯一", "不可替代", "极致", "终极", "王牌", "领袖品牌"
];

// 2. 营销引流与高频黑灰产诈骗导流词库
export const SPAM_MARKETING_WORDS = [
  "加微信", "加V", "私聊领资料", "扫码进群", "代开发票", "兼职刷单", "刷单兼职", "博彩",
  "日赚千元", "高额返利", "稳赚不赔", "零风险高收益", "低投入高回报", "内部内幕消息",
  "代写论文", "代考", "办证", "刻章", "套现", "无抵押贷款", "黑户秒过", "裸贷",
  "买卖银行卡", "买卖电话卡", "微商代理", "加盟躺赚", "自动挂机赚钱", "打字兼职"
];

// 3. 常见粗俗辱骂与低俗违规词库
export const PROFANITY_WORDS = [
  "傻逼", "弱智", "脑残", "草泥马", "操你妈", "妈的", "滚蛋", "王八蛋", "狗日的", "死全家",
  "煞笔", "贱人", "装逼", "牛逼", "婊子", "混账", "狗杂种", "你大爷的", "神经病", "变态"
];

/**
 * 汇总当前选用的词库列表
 */
export function getActiveDictionary(
  categories: Record<WordCategory, boolean>,
  customWords: string[] = []
): string[] {
  const dict = new Set<string>();

  if (categories.ad_law) {
    AD_LAW_WORDS.forEach((w) => dict.add(w));
  }
  if (categories.spam_marketing) {
    SPAM_MARKETING_WORDS.forEach((w) => dict.add(w));
  }
  if (categories.profanity) {
    PROFANITY_WORDS.forEach((w) => dict.add(w));
  }

  customWords.forEach((w) => {
    const trimmed = w.trim();
    if (trimmed) dict.add(trimmed);
  });

  return Array.from(dict);
}

/**
 * 基于 Mint (Aho-Corasick / DFA) 执行敏感词检测、脱敏替换与高亮渲染
 */
export function detectSensitiveWords(
  text: string,
  categories: Record<WordCategory, boolean> = {
    ad_law: true,
    spam_marketing: true,
    profanity: true,
  },
  customWords: string[] = [],
  replaceChar: string = "*"
): SensitiveWordResult {
  const clean = text.trim();
  if (!clean) {
    return {
      hasSensitiveWord: false,
      matchedWords: [],
      wordCounts: {},
      totalMatches: 0,
      filteredText: "",
      highlightedHtml: "",
    };
  }

  const dictionary = getActiveDictionary(categories, customWords);
  if (dictionary.length === 0) {
    return {
      hasSensitiveWord: false,
      matchedWords: [],
      wordCounts: {},
      totalMatches: 0,
      filteredText: text,
      highlightedHtml: escapeHtml(text),
    };
  }

  const mint = new Mint(dictionary);
  const filterRes = mint.filter(text, { replace: true });

  const matchedSet = new Set(filterRes.words);
  const wordCounts: Record<string, number> = {};
  let totalMatches = 0;

  // 统计每个命中敏感词的出现次数
  matchedSet.forEach((word) => {
    const reg = new RegExp(escapeRegex(word), "g");
    const count = (text.match(reg) || []).length;
    wordCounts[word] = count;
    totalMatches += count;
  });

  // 自定义脱敏符号替换
  let filteredText = text;
  matchedSet.forEach((word) => {
    const reg = new RegExp(escapeRegex(word), "g");
    filteredText = filteredText.replace(reg, replaceChar.repeat(word.length));
  });

  // 生成 HTML 视觉高亮标记
  let highlightedHtml = escapeHtml(text);
  matchedSet.forEach((word) => {
    const escapedWord = escapeHtml(word);
    const reg = new RegExp(escapeRegex(escapedWord), "g");
    highlightedHtml = highlightedHtml.replace(
      reg,
      `<mark class="bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold px-1 py-0.5 rounded border border-rose-300 dark:border-rose-800 shadow-2xs">${escapedWord}</mark>`
    );
  });

  return {
    hasSensitiveWord: matchedSet.size > 0,
    matchedWords: Array.from(matchedSet),
    wordCounts,
    totalMatches,
    filteredText,
    highlightedHtml,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
