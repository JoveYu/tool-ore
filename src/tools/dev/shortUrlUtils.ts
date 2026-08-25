export type ShortUrlAlgorithm = "base62" | "base58" | "hash_slice" | "custom_slug";

export interface ShortUrlOptions {
  url: string;
  algorithm: ShortUrlAlgorithm;
  domainPrefix: string;
  customSlug?: string;
}

const BASE62_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * 简单字符串哈希转 32 位无符号数
 */
function hashStringToNumber(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * 生成短链接 Key 标识符
 */
export function generateShortSlug(url: string, algorithm: ShortUrlAlgorithm, customSlug?: string): string {
  const clean = url.trim();
  if (!clean) return "";

  if (algorithm === "custom_slug" && customSlug?.trim()) {
    return customSlug.trim().replace(/[^a-zA-Z0-9_\-]/g, "");
  }

  const num = hashStringToNumber(clean);

  if (algorithm === "base58") {
    let n = num;
    let slug = "";
    while (n > 0) {
      slug = BASE58_ALPHABET[n % 58] + slug;
      n = Math.floor(n / 58);
    }
    return slug.padStart(6, "1");
  }

  if (algorithm === "hash_slice") {
    const hex = num.toString(16).padStart(8, "0");
    return hex.slice(0, 6);
  }

  // 默认 Base62
  let n = num;
  let slug = "";
  while (n > 0) {
    slug = BASE62_ALPHABET[n % 62] + slug;
    n = Math.floor(n / 62);
  }
  return slug.padStart(6, "0");
}

/**
 * 拼装完整短链接
 */
export function buildShortUrl(options: ShortUrlOptions): {
  isValid: boolean;
  shortUrl: string;
  slug: string;
  error?: string;
} {
  const clean = options.url.trim();
  if (!clean) {
    return { isValid: false, shortUrl: "", slug: "", error: "请输入需要缩短的长链接 URL" };
  }

  try {
    const slug = generateShortSlug(clean, options.algorithm, options.customSlug);
    let prefix = options.domainPrefix.trim() || "https://ore.link/";
    if (!prefix.endsWith("/")) prefix += "/";

    return {
      isValid: true,
      shortUrl: `${prefix}${slug}`,
      slug,
    };
  } catch (err: any) {
    return {
      isValid: false,
      shortUrl: "",
      slug: "",
      error: `生成短链接失败: ${err?.message || "URL 格式不合法"}`,
    };
  }
}
