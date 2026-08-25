export type HarResourceType = "xhr" | "js" | "css" | "img" | "font" | "doc" | "other";

export interface HarTimingBreakdown {
  blocked: number;
  dns: number;
  connect: number;
  ssl: number;
  send: number;
  wait: number; // TTFB
  receive: number;
}

export interface HarEntryItem {
  id: string;
  index: number;
  startTime: number; // 毫秒级时间戳
  time: number; // 总耗时 (ms)
  method: string;
  url: string;
  pathname: string;
  domain: string;
  status: number;
  statusText: string;
  resourceType: HarResourceType;
  mimeType: string;
  bodySize: number; // 传输体积 (bytes)
  contentSize: number; // 解压后实际内容大小 (bytes)
  serverIP?: string;
  timings: HarTimingBreakdown;
  requestHeaders: { name: string; value: string }[];
  responseHeaders: { name: string; value: string }[];
  queryString: { name: string; value: string }[];
  postData?: { mimeType: string; text?: string };
  responseBody?: { mimeType: string; text?: string; encoding?: string };
}

export interface HarSummary {
  pageTitle?: string;
  totalRequests: number;
  totalBytes: number;
  totalTime: number; // 会话总耗时
  sessionStartTime: number;
  sessionEndTime: number;
  statusCounts: { [key: string]: number }; // "2xx", "3xx", "4xx", "5xx"
  typeCounts: { [key in HarResourceType]?: number };
}

export interface HarAnalysisResult {
  summary: HarSummary;
  entries: HarEntryItem[];
}

/**
 * 根据 MIME Type 和 URL 智能推导资源类型
 */
export function getResourceType(mimeType: string = "", url: string = ""): HarResourceType {
  const mime = mimeType.toLowerCase();
  const u = url.toLowerCase();

  if (mime.includes("json") || mime.includes("xml") || u.includes("/api/") || u.includes("/v1/")) {
    return "xhr";
  }
  if (mime.includes("javascript") || mime.includes("ecmascript") || u.endsWith(".js")) {
    return "js";
  }
  if (mime.includes("css") || u.endsWith(".css")) {
    return "css";
  }
  if (
    mime.startsWith("image/") ||
    u.endsWith(".png") ||
    u.endsWith(".jpg") ||
    u.endsWith(".jpeg") ||
    u.endsWith(".webp") ||
    u.endsWith(".svg") ||
    u.endsWith(".gif") ||
    u.endsWith(".ico")
  ) {
    return "img";
  }
  if (mime.includes("font") || u.endsWith(".woff") || u.endsWith(".woff2") || u.endsWith(".ttf") || u.endsWith(".otf")) {
    return "font";
  }
  if (mime.includes("html") || u.endsWith(".html") || u.endsWith(".htm")) {
    return "doc";
  }
  return "other";
}

/**
 * 解析 URL 获取域名与路径
 */
function parseUrlDetails(urlString: string): { domain: string; pathname: string } {
  try {
    const parsed = new URL(urlString);
    return {
      domain: parsed.host,
      pathname: parsed.pathname + parsed.search,
    };
  } catch {
    const parts = urlString.split("/");
    return {
      domain: parts[2] || "unknown",
      pathname: "/" + parts.slice(3).join("/"),
    };
  }
}

/**
 * 格式化字节数大小显示
 */
export function formatHarBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * 格式化耗时毫秒显示
 */
export function formatHarTime(ms: number): string {
  if (ms < 0) return "0 ms";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

/**
 * 解析 HAR JSON 结构并构建索引
 */
export function parseHarJson(jsonString: string): HarAnalysisResult {
  const raw = JSON.parse(jsonString);
  const log = raw.log;
  if (!log || !Array.isArray(log.entries)) {
    throw new Error("无效的 HAR 文件格式：缺少 log.entries 数据");
  }

  const entries: HarEntryItem[] = [];
  const statusCounts: { [key: string]: number } = { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0, other: 0 };
  const typeCounts: { [key in HarResourceType]?: number } = {};

  let minStartTime = Infinity;
  let maxEndTime = 0;
  let totalBytes = 0;

  log.entries.forEach((rawEntry: any, index: number) => {
    const startTs = new Date(rawEntry.startedDateTime).getTime();
    const duration = Math.max(0, rawEntry.time || 0);
    const endTs = startTs + duration;

    if (startTs < minStartTime) minStartTime = startTs;
    if (endTs > maxEndTime) maxEndTime = endTs;

    const req = rawEntry.request || {};
    const res = rawEntry.response || {};
    const content = res.content || {};

    const url = req.url || "";
    const { domain, pathname } = parseUrlDetails(url);
    const mimeType = content.mimeType || res.headers?.find((h: any) => h.name?.toLowerCase() === "content-type")?.value || "";
    const resourceType = getResourceType(mimeType, url);

    const bodySize = Math.max(0, res.bodySize > 0 ? res.bodySize : content.size || 0);
    totalBytes += bodySize;

    // Status group
    const status = res.status || 0;
    if (status >= 200 && status < 300) statusCounts["2xx"]++;
    else if (status >= 300 && status < 400) statusCounts["3xx"]++;
    else if (status >= 400 && status < 500) statusCounts["4xx"]++;
    else if (status >= 500 && status < 600) statusCounts["5xx"]++;
    else statusCounts.other++;

    // Type group
    typeCounts[resourceType] = (typeCounts[resourceType] || 0) + 1;

    const timings = rawEntry.timings || {};
    const timingBreakdown: HarTimingBreakdown = {
      blocked: Math.max(0, timings.blocked || 0),
      dns: Math.max(0, timings.dns || 0),
      connect: Math.max(0, timings.connect || 0),
      ssl: Math.max(0, timings.ssl || 0),
      send: Math.max(0, timings.send || 0),
      wait: Math.max(0, timings.wait || 0),
      receive: Math.max(0, timings.receive || 0),
    };

    entries.push({
      id: Math.random().toString(36).slice(2, 9),
      index: index + 1,
      startTime: startTs,
      time: duration,
      method: req.method || "GET",
      url,
      pathname,
      domain,
      status,
      statusText: res.statusText || "",
      resourceType,
      mimeType,
      bodySize,
      contentSize: content.size || 0,
      serverIP: rawEntry.serverIPAddress,
      timings: timingBreakdown,
      requestHeaders: req.headers || [],
      responseHeaders: res.headers || [],
      queryString: req.queryString || [],
      postData: req.postData,
      responseBody: content.text ? { mimeType, text: content.text, encoding: content.encoding } : undefined,
    });
  });

  const sessionStartTime = minStartTime === Infinity ? Date.now() : minStartTime;
  const sessionEndTime = maxEndTime === 0 ? sessionStartTime : maxEndTime;
  const totalTime = Math.max(1, sessionEndTime - sessionStartTime);

  const summary: HarSummary = {
    pageTitle: log.pages?.[0]?.title,
    totalRequests: entries.length,
    totalBytes,
    totalTime,
    sessionStartTime,
    sessionEndTime,
    statusCounts,
    typeCounts,
  };

  return { summary, entries };
}

/**
 * 筛选 HAR 请求列表
 */
export function filterHarEntries(
  entries: HarEntryItem[],
  searchQuery: string,
  selectedType: string,
  selectedStatus: string
): HarEntryItem[] {
  return entries.filter((item) => {
    if (selectedType !== "all" && item.resourceType !== selectedType) {
      return false;
    }
    if (selectedStatus !== "all") {
      if (selectedStatus === "2xx" && (item.status < 200 || item.status >= 300)) return false;
      if (selectedStatus === "3xx" && (item.status < 300 || item.status >= 400)) return false;
      if (selectedStatus === "4xx" && (item.status < 400 || item.status >= 500)) return false;
      if (selectedStatus === "5xx" && item.status < 500) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.url.toLowerCase().includes(q) ||
        item.method.toLowerCase().includes(q) ||
        item.status.toString().includes(q) ||
        item.mimeType.toLowerCase().includes(q)
      );
    }
    return true;
  });
}
