export interface CronParseResult {
  isValid: boolean;
  error?: string;
  partsCount: number;
  hasSeconds: boolean;
  chineseExplanation: string;
  nextExecutions: string[];
}

export interface CronPreset {
  name: string;
  expression: string;
  description: string;
}

export const COMMON_CRON_PRESETS: CronPreset[] = [
  { name: "每分钟执行一次", expression: "* * * * *", description: "每分钟的第 00 秒触发" },
  { name: "每 5 分钟执行一次", expression: "*/5 * * * *", description: "在 0, 5, 10, 15... 分钟触发" },
  { name: "每 15 分钟执行一次", expression: "*/15 * * * *", description: "在 0, 15, 30, 45 分钟触发" },
  { name: "每小时整点触发", expression: "0 * * * *", description: "每小时的 00 分触发" },
  { name: "每天凌晨 0 点", expression: "0 0 * * *", description: "每天 00:00:00 准时执行" },
  { name: "每天上午 9 点", expression: "0 9 * * *", description: "每天 09:00:00 执行" },
  { name: "工作日上午 9 点至下午 6 点整点", expression: "0 9-18 * * 1-5", description: "周一至周五 09:00 ~ 18:00 每个整点触发" },
  { name: "每周一凌晨 2 点", expression: "0 2 * * 1", description: "每周一 02:00 触发（常用于全量备份）" },
  { name: "每月 1 日凌晨 0 点", expression: "0 0 1 * *", description: "每月首日 00:00 触发（常用于月度结算）" },
];

const WEEKDAY_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];

/**
 * 解析单个 Cron 字段生成自然语言
 */
function parseFieldText(field: string, unitName: string, mapNames?: string[]): string {
  if (field === "*") return `每${unitName}`;
  if (field === "?") return "不指定";

  if (field.startsWith("*/")) {
    const step = field.slice(2);
    return `每隔 ${step} ${unitName}`;
  }

  if (field.includes("-")) {
    const [start, end] = field.split("-");
    const sName = mapNames ? mapNames[Number(start)] || start : start;
    const eName = mapNames ? mapNames[Number(end)] || end : end;
    return `在第 ${sName} 到 ${eName} ${unitName}`;
  }

  if (field.includes(",")) {
    const list = field.split(",").map((v) => (mapNames ? mapNames[Number(v)] || v : v));
    return `在第 [${list.join(", ")}] ${unitName}`;
  }

  const name = mapNames ? mapNames[Number(field)] || field : field;
  return `在第 ${name} ${unitName}`;
}

/**
 * 翻译 Cron 表达式为中文自然语言
 */
export function explainCron(expression: string): string {
  const parts = expression.trim().split(/\s+/);
  if (parts.length < 5 || parts.length > 6) {
    return "格式错误：标准 Cron 需包含 5 位（分 时 日 月 周）或 6 位（秒 分 时 日 月 周）";
  }

  const hasSeconds = parts.length === 6;
  const sec = hasSeconds ? parts[0] : "";
  const min = hasSeconds ? parts[1] : parts[0];
  const hour = hasSeconds ? parts[2] : parts[1];
  const dom = hasSeconds ? parts[3] : parts[2];
  const mon = hasSeconds ? parts[4] : parts[3];
  const dow = hasSeconds ? parts[5] : parts[4];

  // 常见固定模式简译
  if (expression.trim() === "* * * * *") return "每分钟执行一次";
  if (expression.trim() === "*/5 * * * *") return "每 5 分钟执行一次";
  if (expression.trim() === "0 * * * *") return "每小时整点执行一次";
  if (expression.trim() === "0 0 * * *") return "每天凌晨 00:00 执行一次";

  const segments: string[] = [];

  // 月份
  if (mon !== "*") {
    segments.push(parseFieldText(mon, "月"));
  }

  // 星期 / 日
  if (dow !== "*" && dow !== "?") {
    segments.push(parseFieldText(dow, "", WEEKDAY_NAMES));
  }
  if (dom !== "*" && dom !== "?") {
    segments.push(parseFieldText(dom, "日"));
  }

  // 小时与分钟
  if (hour === "*" && min === "*") {
    segments.push("每小时每分钟");
  } else if (hour === "*") {
    segments.push(`每小时的 ${parseFieldText(min, "分")}`);
  } else if (min === "*") {
    segments.push(`${parseFieldText(hour, "点")} 的每分钟`);
  } else {
    segments.push(`在 ${hour} 点 ${min} 分`);
  }

  // 秒
  if (hasSeconds && sec !== "0" && sec !== "*") {
    segments.push(parseFieldText(sec, "秒"));
  }

  return segments.join("，") + " 执行";
}

/**
 * 展开单个 cron 字段的所有可能取值
 */
function expandFieldValues(field: string, min: number, max: number): number[] {
  if (field === "*" || field === "?") {
    const list: number[] = [];
    for (let i = min; i <= max; i++) list.push(i);
    return list;
  }

  if (field.startsWith("*/")) {
    const step = parseInt(field.slice(2), 10) || 1;
    const list: number[] = [];
    for (let i = min; i <= max; i += step) list.push(i);
    return list;
  }

  if (field.includes(",")) {
    const list: number[] = [];
    field.split(",").forEach((item) => {
      list.push(...expandFieldValues(item, min, max));
    });
    return Array.from(new Set(list)).sort((a, b) => a - b);
  }

  if (field.includes("-")) {
    const [start, end] = field.split("-").map((v) => parseInt(v, 10));
    const list: number[] = [];
    for (let i = start; i <= end; i++) list.push(i);
    return list;
  }

  const val = parseInt(field, 10);
  return isNaN(val) ? [] : [val];
}

/**
 * 预估未来执行时间点
 */
export function getNextCronExecutions(
  expression: string,
  count: number = 5,
  startDate: Date = new Date()
): string[] {
  const parts = expression.trim().split(/\s+/);
  if (parts.length < 5 || parts.length > 6) return [];

  const hasSeconds = parts.length === 6;
  const secParts = hasSeconds ? expandFieldValues(parts[0], 0, 59) : [0];
  const minParts = expandFieldValues(hasSeconds ? parts[1] : parts[0], 0, 59);
  const hourParts = expandFieldValues(hasSeconds ? parts[2] : parts[1], 0, 23);
  const domParts = expandFieldValues(hasSeconds ? parts[3] : parts[2], 1, 31);
  const monParts = expandFieldValues(hasSeconds ? parts[4] : parts[3], 1, 12);
  const dowParts = expandFieldValues(hasSeconds ? parts[5] : parts[4], 0, 6);

  const results: string[] = [];
  let current = new Date(startDate.getTime() + 1000);
  current.setMilliseconds(0);
  if (!hasSeconds) current.setSeconds(0);

  let iterations = 0;
  const maxIterations = 50000;

  while (results.length < count && iterations < maxIterations) {
    iterations++;

    const m = current.getMonth() + 1;
    if (!monParts.includes(m)) {
      current.setMonth(current.getMonth() + 1, 1);
      current.setHours(0, 0, 0, 0);
      continue;
    }

    const d = current.getDate();
    const w = current.getDay();
    const isDomMatch = (hasSeconds ? parts[3] : parts[2]) === "*" || domParts.includes(d);
    const isDowMatch = (hasSeconds ? parts[5] : parts[4]) === "*" || (hasSeconds ? parts[5] : parts[4]) === "?" || dowParts.includes(w);

    if (!isDomMatch || !isDowMatch) {
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
      continue;
    }

    const h = current.getHours();
    if (!hourParts.includes(h)) {
      current.setHours(current.getHours() + 1, 0, 0, 0);
      continue;
    }

    const min = current.getMinutes();
    if (!minParts.includes(min)) {
      current.setMinutes(current.getMinutes() + 1, 0, 0);
      continue;
    }

    const s = current.getSeconds();
    if (!secParts.includes(s)) {
      current.setSeconds(current.getSeconds() + 1);
      continue;
    }

    // 匹配成功
    const y = current.getFullYear();
    const mo = String(current.getMonth() + 1).padStart(2, "0");
    const da = String(current.getDate()).padStart(2, "0");
    const hr = String(current.getHours()).padStart(2, "0");
    const mi = String(current.getMinutes()).padStart(2, "0");
    const se = String(current.getSeconds()).padStart(2, "0");
    const weekName = WEEKDAY_NAMES[current.getDay()];

    results.push(`${y}-${mo}-${da} ${hr}:${mi}:${se} (${weekName})`);

    // 步进一秒继续探测
    current = new Date(current.getTime() + 1000);
  }

  return results;
}

/**
 * 完整校验与解析 Cron 表达式
 */
export function parseCronExpression(expression: string): CronParseResult {
  const clean = expression.trim();
  if (!clean) {
    return {
      isValid: false,
      error: "请输入 Cron 表达式",
      partsCount: 0,
      hasSeconds: false,
      chineseExplanation: "",
      nextExecutions: [],
    };
  }

  const parts = clean.split(/\s+/);
  if (parts.length < 5 || parts.length > 6) {
    return {
      isValid: false,
      error: `表达式包含 ${parts.length} 个字段，标准 Cron 必须为 5 位或 6 位`,
      partsCount: parts.length,
      hasSeconds: false,
      chineseExplanation: "",
      nextExecutions: [],
    };
  }

  try {
    const chineseExplanation = explainCron(clean);
    const nextExecutions = getNextCronExecutions(clean, 5);

    return {
      isValid: true,
      partsCount: parts.length,
      hasSeconds: parts.length === 6,
      chineseExplanation,
      nextExecutions,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: `解析异常: ${err?.message || "语法格式不正确"}`,
      partsCount: parts.length,
      hasSeconds: parts.length === 6,
      chineseExplanation: "",
      nextExecutions: [],
    };
  }
}
