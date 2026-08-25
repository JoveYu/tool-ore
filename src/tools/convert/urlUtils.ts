export interface QueryParamItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface ParsedUrlDetails {
  isValid: boolean;
  error?: string;
  origin: string;
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  hash: string;
  search: string;
  params: QueryParamItem[];
}

/**
 * 解析完整 URL 或相对路径
 */
export function parseUrl(input: string): ParsedUrlDetails {
  const clean = input.trim();
  if (!clean) {
    return {
      isValid: false,
      error: "请输入 URL 或查询参数字符串",
      origin: "",
      protocol: "",
      host: "",
      hostname: "",
      port: "",
      pathname: "",
      hash: "",
      search: "",
      params: [],
    };
  }

  try {
    let urlObj: URL;
    let isRelative = false;

    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(clean)) {
      urlObj = new URL(clean);
    } else if (clean.startsWith("//")) {
      urlObj = new URL("https:" + clean);
    } else {
      isRelative = true;
      // 构造临时基准解析相对路径或纯 query
      const base = clean.startsWith("?") || clean.startsWith("/") ? "https://example.com" : "https://example.com/";
      urlObj = new URL(clean, base);
    }

    const params: QueryParamItem[] = [];
    urlObj.searchParams.forEach((value, key) => {
      params.push({
        id: Math.random().toString(36).slice(2, 9),
        key,
        value,
        enabled: true,
      });
    });

    return {
      isValid: true,
      origin: isRelative ? "" : urlObj.origin,
      protocol: isRelative ? "" : urlObj.protocol,
      host: isRelative ? "" : urlObj.host,
      hostname: isRelative ? "" : urlObj.hostname,
      port: isRelative ? "" : urlObj.port,
      pathname: isRelative && clean.startsWith("?") ? "" : urlObj.pathname,
      hash: urlObj.hash,
      search: urlObj.search,
      params,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: err?.message || "URL 格式无效",
      origin: "",
      protocol: "",
      host: "",
      hostname: "",
      port: "",
      pathname: "",
      hash: "",
      search: "",
      params: [],
    };
  }
}

/**
 * 根据基础 URL 与参数列表重新组装完整 URL
 */
export function buildUrlFromParts(
  baseUrl: string,
  params: QueryParamItem[],
  hash: string = ""
): string {
  if (!baseUrl.trim()) return "";

  try {
    let urlObj: URL;
    let isRelative = false;
    const cleanBase = baseUrl.split("?")[0].split("#")[0].trim();

    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(cleanBase)) {
      urlObj = new URL(cleanBase);
    } else {
      isRelative = true;
      urlObj = new URL(cleanBase || "/", "https://example.com");
    }

    // 清空现有 searchParams
    const searchParams = new URLSearchParams();
    params
      .filter((p) => p.enabled && p.key.trim() !== "")
      .forEach((p) => {
        searchParams.append(p.key, p.value);
      });

    const searchStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const hashStr = hash.trim() ? (hash.startsWith("#") ? hash : `#${hash}`) : "";

    if (isRelative) {
      const path = cleanBase;
      return `${path}${searchStr}${hashStr}`;
    }

    urlObj.search = searchStr;
    urlObj.hash = hashStr;
    return urlObj.toString();
  } catch {
    const searchParams = new URLSearchParams();
    params
      .filter((p) => p.enabled && p.key.trim() !== "")
      .forEach((p) => {
        searchParams.append(p.key, p.value);
      });
    const searchStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const hashStr = hash.trim() ? (hash.startsWith("#") ? hash : `#${hash}`) : "";
    return `${baseUrl.split("?")[0]}${searchStr}${hashStr}`;
  }
}

/**
 * 参数列表转换为 JSON 对象
 */
export function paramsToJson(params: QueryParamItem[]): string {
  const obj: Record<string, string | string[]> = {};
  params
    .filter((p) => p.enabled && p.key.trim())
    .forEach((p) => {
      if (obj[p.key] !== undefined) {
        if (Array.isArray(obj[p.key])) {
          (obj[p.key] as string[]).push(p.value);
        } else {
          obj[p.key] = [obj[p.key] as string, p.value];
        }
      } else {
        obj[p.key] = p.value;
      }
    });
  return JSON.stringify(obj, null, 2);
}

/**
 * JSON 对象解析为参数列表
 */
export function jsonToParams(jsonStr: string): { isValid: boolean; error?: string; params: QueryParamItem[] } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { isValid: false, error: "JSON 根节点必须为键值对对象", params: [] };
    }

    const params: QueryParamItem[] = [];
    Object.entries(parsed).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        val.forEach((item) => {
          params.push({
            id: Math.random().toString(36).slice(2, 9),
            key,
            value: String(item),
            enabled: true,
          });
        });
      } else {
        params.push({
          id: Math.random().toString(36).slice(2, 9),
          key,
          value: val !== null && val !== undefined ? String(val) : "",
          enabled: true,
        });
      }
    });

    return { isValid: true, params };
  } catch (err: any) {
    return { isValid: false, error: `JSON 解析失败: ${err?.message || "语法有误"}`, params: [] };
  }
}
