export type IdType = "uuid_v4" | "uuid_v1" | "nanoid" | "ulid" | "short_id";

export interface GenerateIdOptions {
  type: IdType;
  quantity: number;
  uppercase: boolean;
  hyphens: boolean;
  nanoidLength?: number;
  nanoidAlphabet?: string;
  prefix?: string;
  suffix?: string;
  quoteType?: "none" | "single" | "double";
  separator?: "newline" | "comma" | "json_array" | "sql_in";
}

const DEFAULT_NANOID_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-";

const CROCKFORD_BASE32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/**
 * 获取底层密码学随机字节
 */
function getRandomBytes(len: number): Uint8Array {
  const bytes = new Uint8Array(len);
  const cryptoObj = typeof window !== "undefined" ? window.crypto : (globalThis as any).crypto;
  if (cryptoObj && cryptoObj.getRandomValues) {
    cryptoObj.getRandomValues(bytes);
  } else {
    for (let i = 0; i < len; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytes;
}

/**
 * 生成单个标准 UUID v4
 */
export function generateUuidV4(): string {
  const cryptoObj = typeof window !== "undefined" ? window.crypto : (globalThis as any).crypto;
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }

  const bytes = getRandomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant RFC 4122

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * 生成基于时间戳的 UUID v1 模拟
 */
export function generateUuidV1(): string {
  const now = Date.now();
  const msecs = now & 0xffffffff;
  const timeMid = ((now / 0x100000000) & 0xffff);
  const timeHiAndVersion = (((now / 0x1000000000000) & 0x0fff) | 0x1000);

  const bytes = getRandomBytes(8);
  const clockSeq = (bytes[0] & 0x3f) | 0x80;
  const clockSeqLow = bytes[1];
  const node = Array.from(bytes.slice(2))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const tl = msecs.toString(16).padStart(8, "0");
  const tm = timeMid.toString(16).padStart(4, "0");
  const th = timeHiAndVersion.toString(16).padStart(4, "0");
  const cs = clockSeq.toString(16).padStart(2, "0") + clockSeqLow.toString(16).padStart(2, "0");

  return `${tl}-${tm}-${th}-${cs}-${node}`;
}

/**
 * 生成 NanoID
 */
export function generateNanoId(
  length: number = 21,
  alphabet: string = DEFAULT_NANOID_ALPHABET
): string {
  const customAlphabet = alphabet.length > 0 ? alphabet : DEFAULT_NANOID_ALPHABET;
  const alphabetLen = customAlphabet.length;
  const bytes = getRandomBytes(length);
  let id = "";
  for (let i = 0; i < length; i++) {
    id += customAlphabet[bytes[i] % alphabetLen];
  }
  return id;
}

/**
 * 生成 ULID (26 位 Crockford's Base32)
 */
export function generateUlid(timestamp: number = Date.now()): string {
  // 10 字符时间戳 (48-bit)
  let timeStr = "";
  let t = timestamp;
  for (let i = 9; i >= 0; i--) {
    const mod = t % 32;
    timeStr = CROCKFORD_BASE32[mod] + timeStr;
    t = Math.floor(t / 32);
  }

  // 16 字符随机数 (80-bit)
  const randBytes = getRandomBytes(16);
  let randStr = "";
  for (let i = 0; i < 16; i++) {
    randStr += CROCKFORD_BASE32[randBytes[i] % 32];
  }

  return timeStr + randStr;
}

/**
 * 生成 10 位短 ID
 */
export function generateShortId(): string {
  return generateNanoId(10, "0123456789abcdefghijklmnopqrstuvwxyz");
}

/**
 * 批量生成 ID 列表
 */
export function generateBatchIds(options: GenerateIdOptions): string[] {
  const count = Math.min(Math.max(options.quantity || 1, 1), 1000);
  const results: string[] = [];

  for (let i = 0; i < count; i++) {
    let raw = "";
    switch (options.type) {
      case "uuid_v1":
        raw = generateUuidV1();
        break;
      case "nanoid":
        raw = generateNanoId(options.nanoidLength || 21, options.nanoidAlphabet);
        break;
      case "ulid":
        raw = generateUlid();
        break;
      case "short_id":
        raw = generateShortId();
        break;
      case "uuid_v4":
      default:
        raw = generateUuidV4();
        break;
    }

    if (!options.hyphens && (options.type === "uuid_v4" || options.type === "uuid_v1")) {
      raw = raw.replace(/-/g, "");
    }

    if (options.uppercase) {
      raw = raw.toUpperCase();
    } else {
      raw = raw.toLowerCase();
    }

    if (options.prefix) {
      raw = `${options.prefix}${raw}`;
    }
    if (options.suffix) {
      raw = `${raw}${options.suffix}`;
    }

    results.push(raw);
  }

  return results;
}

/**
 * 格式化批量结果为目标字符串输出
 */
export function formatIdListOutput(
  ids: string[],
  separator: "newline" | "comma" | "json_array" | "sql_in" = "newline",
  quoteType: "none" | "single" | "double" = "none"
): string {
  const quote = (s: string) => {
    if (quoteType === "single") return `'${s}'`;
    if (quoteType === "double") return `"${s}"`;
    return s;
  };

  const quoted = ids.map(quote);

  switch (separator) {
    case "comma":
      return quoted.join(", ");
    case "json_array":
      return JSON.stringify(ids, null, 2);
    case "sql_in":
      return `IN (${ids.map((id) => `'${id}'`).join(", ")})`;
    case "newline":
    default:
      return quoted.join("\n");
  }
}
