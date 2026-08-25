export interface RegexMatchItem {
  index: number;
  match: string;
  groups: string[];
  namedGroups?: Record<string, string>;
  start: number;
  end: number;
}

export interface RegexTestResult {
  isValid: boolean;
  error?: string;
  matches: RegexMatchItem[];
  matchCount: number;
  replacedText?: string;
}

export interface RegexPreset {
  category: string;
  name: string;
  pattern: string;
  flags: string;
  description: string;
  sample: string;
}

export const REGEX_PRESETS: RegexPreset[] = [
  {
    category: "常用验证",
    name: "中国大陆手机号",
    pattern: "1[3-9]\\d{9}",
    flags: "g",
    description: "匹配以 1 开头，第二位 3-9 的 11 位国内手机号",
    sample: "我的手机号是 13800138000，他的电话是 18812345678，座机 010-12345678 不匹配。",
  },
  {
    category: "常用验证",
    name: "电子邮箱",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    flags: "g",
    description: "匹配标准电子邮件地址格式",
    sample: "联系邮箱：support@example.com 或 personal_dev-99@gmail.com 欢迎反馈！",
  },
  {
    category: "常用验证",
    name: "中国大陆二代身份证",
    pattern: "[1-9]\\d{5}(?:18|19|20)\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]",
    flags: "g",
    description: "匹配 18 位二代身份证号码（含年月日与校验位）",
    sample: "示例身份证号：11010119900307239X 与 320102198811221234。",
  },
  {
    category: "网络与开发",
    name: "URL 网页网址",
    pattern: "https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
    flags: "g",
    description: "匹配 http/https 开头的完整网页 URL 链接",
    sample: "访问官网：https://example.com/ 或 http://localhost:5173/test?query=abc#hash",
  },
  {
    category: "网络与开发",
    name: "IPv4 地址",
    pattern: "(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)",
    flags: "g",
    description: "匹配 0.0.0.0 到 255.255.255.255 的标准 IPv4 地址",
    sample: "本地回环 127.0.0.1，路由器网关 192.168.1.1，DNS 8.8.8.8，非法地址 999.999.1.1 不匹配。",
  },
  {
    category: "网络与开发",
    name: "十六进制颜色码",
    pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b",
    flags: "g",
    description: "匹配 #RGB 或 #RRGGBB 十六进制颜色代码",
    sample: "品牌主题色：#6366F1，文字暗色：#0F172A，纯白色：#FFF 与 #FFFFFF。",
  },
  {
    category: "文本字符",
    name: "中文字符",
    pattern: "[\\u4e00-\\u9fa5]+",
    flags: "g",
    description: "匹配连续的一个或多个 Unicode 中文汉字",
    sample: "Hello 在线工具 2026 年前端极速本地运算。",
  },
  {
    category: "文本字符",
    name: "HTML 标签",
    pattern: "<([a-zA-Z0-9]+)(\\s*[^>]*)?>.*?<\\/\\1>|<([a-zA-Z0-9]+)(\\s*[^>]*)?\\/>",
    flags: "g",
    description: "匹配成对或自闭合的 HTML 标签及内容",
    sample: "<div class=\"hero\"><h1 id=\"title\">标题</h1><img src=\"logo.png\" /></div>",
  },
];

export function testRegex(
  pattern: string,
  flags: string,
  testText: string,
  replacePattern?: string
): RegexTestResult {
  if (!pattern) {
    return {
      isValid: true,
      matches: [],
      matchCount: 0,
      replacedText: testText,
    };
  }

  try {
    const regex = new RegExp(pattern, flags);
    const isGlobal = flags.includes("g");

    const matches: RegexMatchItem[] = [];

    if (isGlobal) {
      let matchResult: RegExpExecArray | null;
      let lastIdx = -1;

      // 防止零宽正则无限死循环
      while ((matchResult = regex.exec(testText)) !== null) {
        if (regex.lastIndex === lastIdx) {
          regex.lastIndex++;
          continue;
        }
        lastIdx = regex.lastIndex;

        const groups = matchResult.slice(1).map((g) => g || "");
        matches.push({
          index: matchResult.index,
          match: matchResult[0],
          groups,
          namedGroups: matchResult.groups,
          start: matchResult.index,
          end: matchResult.index + matchResult[0].length,
        });

        if (!matchResult[0]) {
          regex.lastIndex++;
        }
      }
    } else {
      const matchResult = regex.exec(testText);
      if (matchResult) {
        const groups = matchResult.slice(1).map((g) => g || "");
        matches.push({
          index: matchResult.index,
          match: matchResult[0],
          groups,
          namedGroups: matchResult.groups,
          start: matchResult.index,
          end: matchResult.index + matchResult[0].length,
        });
      }
    }

    let replacedText: string | undefined = undefined;
    if (replacePattern !== undefined) {
      try {
        replacedText = testText.replace(regex, replacePattern);
      } catch {
        replacedText = undefined;
      }
    }

    return {
      isValid: true,
      matches,
      matchCount: matches.length,
      replacedText,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: err?.message || "正则表达式语法错误",
      matches: [],
      matchCount: 0,
    };
  }
}
