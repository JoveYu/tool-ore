export interface TimeZoneItem {
  name: string;
  timeZone: string;
  offset: string;
  formatted: string;
}

export interface TimestampParseResult {
  isValid: boolean;
  error?: string;
  date?: Date;
  seconds?: number;
  milliseconds?: number;
  isoString?: string;
  utcString?: string;
  localString?: string;
  relativeString?: string;
}

/**
 * 格式化日期为 YYYY-MM-DD HH:mm:ss
 */
export function formatStandardDate(date: Date, timeZone?: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("zh-CN", {
      timeZone: timeZone || undefined,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "00";
    return `${getPart("year")}-${getPart("month")}-${getPart("day")} ${getPart("hour")}:${getPart("minute")}:${getPart("second")}`;
  } catch {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    const s = pad(date.getSeconds());
    return `${y}-${m}-${d} ${h}:${min}:${s}`;
  }
}

/**
 * 计算人性化相对时间（如“3 分钟前”、“2 小时后”）
 */
export function getRelativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);

  if (absSec < 5) return "刚刚";

  const isPast = diffSec < 0;
  const suffix = isPast ? "前" : "后";

  if (absSec < 60) return `${absSec} 秒${suffix}`;
  const diffMin = Math.round(absSec / 60);
  if (diffMin < 60) return `${diffMin} 分钟${suffix}`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour} 小时${suffix}`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 30) return `${diffDay} 天${suffix}`;
  const diffMonth = Math.round(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} 个月${suffix}`;
  const diffYear = Math.round(diffDay / 365);
  return `${diffYear} 年${suffix}`;
}

/**
 * 解析输入为时间戳或标准日期
 */
export function parseTimestampInput(
  input: string,
  unitMode: "auto" | "s" | "ms" = "auto"
): TimestampParseResult {
  const clean = input.trim();
  if (!clean) {
    return { isValid: false, error: "请输入时间戳或日期字符串" };
  }

  let parsedDate: Date | null = null;

  // 1. 判断是否为纯数字（时间戳）
  if (/^-?\d+$/.test(clean)) {
    const num = Number(clean);
    if (isNaN(num)) {
      return { isValid: false, error: "时间戳数值溢出或无效" };
    }

    if (unitMode === "s") {
      parsedDate = new Date(num * 1000);
    } else if (unitMode === "ms") {
      parsedDate = new Date(num);
    } else {
      // 自动模式：10 位左右为秒，13 位左右为毫秒
      if (Math.abs(num) < 10000000000) {
        parsedDate = new Date(num * 1000);
      } else {
        parsedDate = new Date(num);
      }
    }
  } else {
    // 2. 尝试常规日期字符串解析 (YYYY-MM-DD HH:mm:ss 或 ISO 标准)
    let normalized = clean;
    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}(:\d{2})?$/.test(clean)) {
      normalized = clean.replace(" ", "T");
    }
    const d = new Date(normalized);
    if (!isNaN(d.getTime())) {
      parsedDate = d;
    } else {
      // 兜底尝试 Date.parse
      const ts = Date.parse(clean);
      if (!isNaN(ts)) {
        parsedDate = new Date(ts);
      }
    }
  }

  if (!parsedDate || isNaN(parsedDate.getTime())) {
    return { isValid: false, error: "无法解析该时间格式，请检查输入" };
  }

  const ms = parsedDate.getTime();
  const sec = Math.floor(ms / 1000);

  return {
    isValid: true,
    date: parsedDate,
    seconds: sec,
    milliseconds: ms,
    isoString: parsedDate.toISOString(),
    utcString: parsedDate.toUTCString(),
    localString: formatStandardDate(parsedDate),
    relativeString: getRelativeTime(parsedDate),
  };
}

export const COMMON_TIMEZONES = [
  { name: "北京 / 上海 (中国标准时间)", timeZone: "Asia/Shanghai", offset: "UTC+8" },
  { name: "世界标准时间 (UTC / GMT)", timeZone: "UTC", offset: "UTC+0" },
  { name: "东京 (日本标准时间)", timeZone: "Asia/Tokyo", offset: "UTC+9" },
  { name: "新加坡 / 香港", timeZone: "Asia/Singapore", offset: "UTC+8" },
  { name: "伦敦 (格林威治标准时间)", timeZone: "Europe/London", offset: "UTC+0 / +1" },
  { name: "巴黎 / 柏林 (中欧时间)", timeZone: "Europe/Paris", offset: "UTC+1 / +2" },
  { name: "纽约 (美国东部时间)", timeZone: "America/New_York", offset: "UTC-5 / -4" },
  { name: "旧金山 / 洛杉矶 (美国太平洋时间)", timeZone: "America/Los_Angeles", offset: "UTC-8 / -7" },
  { name: "悉尼 (澳大利亚东部时间)", timeZone: "Australia/Sydney", offset: "UTC+10 / +11" },
];

/**
 * 获取全球各大主要时区当前时间列表
 */
export function getTimeZoneList(date: Date): TimeZoneItem[] {
  return COMMON_TIMEZONES.map((tz) => ({
    name: tz.name,
    timeZone: tz.timeZone,
    offset: tz.offset,
    formatted: formatStandardDate(date, tz.timeZone),
  }));
}

/**
 * 常用开发语言获取当前时间戳的代码片段
 */
export const LANGUAGE_SNIPPETS = [
  { lang: "JavaScript / TypeScript", code: "Math.floor(Date.now() / 1000) // 秒\nDate.now() // 毫秒" },
  { lang: "Python", code: "import time\nint(time.time()) # 秒\nint(time.time() * 1000) # 毫秒" },
  { lang: "Go", code: "time.Now().Unix() // 秒\ntime.Now().UnixMilli() // 毫秒" },
  { lang: "Java", code: "System.currentTimeMillis() / 1000L; // 秒\nSystem.currentTimeMillis(); // 毫秒" },
  { lang: "PHP", code: "time(); // 秒\nround(microtime(true) * 1000); // 毫秒" },
  { lang: "Rust", code: "std::time::SystemTime::now()\n  .duration_since(std::time::UNIX_EPOCH)\n  .unwrap().as_secs();" },
  { lang: "Shell / Bash", code: "date +%s # 秒\ndate +%s%3N # 毫秒" },
  { lang: "SQL (MySQL)", code: "UNIX_TIMESTAMP(); -- 当前秒时间戳\nFROM_UNIXTIME(1700000000); -- 时间戳转日期" },
];
