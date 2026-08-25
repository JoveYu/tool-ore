export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

export interface KeyValueItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface HttpRequestOptions {
  url: string;
  method: HttpMethod;
  headers: KeyValueItem[];
  queryParams: KeyValueItem[];
  bodyType: "none" | "json" | "form" | "text";
  bodyContent: string;
  timeoutMs: number;
}

export interface HttpResponseData {
  success: boolean;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: string;
  isJson: boolean;
  timeMs: number;
  sizeBytes: number;
  error?: string;
}

export const HTTP_PRESETS: { name: string; url: string; method: HttpMethod }[] = [
  { name: "JSONPlaceholder 文章列表 (GET)", url: "https://jsonplaceholder.typicode.com/posts/1", method: "GET" },
  { name: "JSONPlaceholder 创建文章 (POST)", url: "https://jsonplaceholder.typicode.com/posts", method: "POST" },
  { name: "HTTPBin 状态与请求反射 (GET)", url: "https://httpbin.org/get", method: "GET" },
  { name: "HTTPBin POST JSON 反射", url: "https://httpbin.org/post", method: "POST" },
];

/**
 * 纯前端基于 Fetch API 执行网络请求与计时统计
 */
export async function sendHttpRequest(options: HttpRequestOptions): Promise<HttpResponseData> {
  const cleanUrl = options.url.trim();
  if (!cleanUrl) {
    return {
      success: false,
      status: 0,
      statusText: "Invalid URL",
      headers: {},
      data: "",
      isJson: false,
      timeMs: 0,
      sizeBytes: 0,
      error: "请输入有效的请求 URL",
    };
  }

  // 1. 拼装 Query 参数
  let targetUrl = cleanUrl;
  const activeParams = options.queryParams.filter((p) => p.enabled && p.key.trim());
  if (activeParams.length > 0) {
    const urlObj = new URL(cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`);
    activeParams.forEach((p) => {
      urlObj.searchParams.append(p.key.trim(), p.value.trim());
    });
    targetUrl = urlObj.toString();
  }

  // 2. 拼装 Headers
  const headerObj: Record<string, string> = {};
  options.headers
    .filter((h) => h.enabled && h.key.trim())
    .forEach((h) => {
      headerObj[h.key.trim()] = h.value.trim();
    });

  // 3. 准备请求体
  let bodyData: any = undefined;
  if (options.method !== "GET" && options.method !== "HEAD") {
    if (options.bodyType === "json" && options.bodyContent.trim()) {
      bodyData = options.bodyContent;
      if (!headerObj["Content-Type"]) {
        headerObj["Content-Type"] = "application/json";
      }
    } else if (options.bodyType === "text" && options.bodyContent) {
      bodyData = options.bodyContent;
    }
  }

  // 4. 超时控制器
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 10000);

  const startTime = performance.now();

  try {
    const response = await fetch(targetUrl, {
      method: options.method,
      headers: headerObj,
      body: bodyData,
      signal: controller.signal,
    });

    const endTime = performance.now();
    clearTimeout(timeoutId);

    const timeMs = Math.round(endTime - startTime);
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    const text = await response.text();
    const sizeBytes = new Blob([text]).size;

    let isJson = false;
    let formattedText = text;
    try {
      const parsedJson = JSON.parse(text);
      formattedText = JSON.stringify(parsedJson, null, 2);
      isJson = true;
    } catch {
      isJson = false;
    }

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText || (response.ok ? "OK" : "Error"),
      headers: responseHeaders,
      data: formattedText,
      isJson,
      timeMs,
      sizeBytes,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const endTime = performance.now();
    const isAbort = err?.name === "AbortError";

    return {
      success: false,
      status: 0,
      statusText: isAbort ? "Timeout" : "Network Error",
      headers: {},
      data: "",
      isJson: false,
      timeMs: Math.round(endTime - startTime),
      sizeBytes: 0,
      error: isAbort
        ? `请求超时 (${options.timeoutMs}ms)`
        : `网络请求失败: ${err?.message || "可能触发了浏览器的 CORS 跨域安全拦截或目标服务无法连接"}`,
    };
  }
}
