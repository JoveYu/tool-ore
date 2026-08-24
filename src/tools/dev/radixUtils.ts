export type CommonRadix = 2 | 8 | 10 | 16 | 32 | 36 | 64;

export interface RadixItem {
  radix: number;
  name: string;
  prefix?: string;
  value: string;
  error?: string;
}

const BASE64_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

/**
 * 将任意 Base64 自定义大数转为 BigInt
 */
function base64ToBigInt(str: string): bigint {
  let result = 0n;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const index = BigInt(BASE64_ALPHABET.indexOf(char));
    if (index === -1n) {
      throw new Error(`非法 64 进制字符: "${char}"`);
    }
    result = result * 64n + index;
  }
  return result;
}

/**
 * 将 BigInt 转为 64 进制字符串
 */
function bigIntToBase64(num: bigint): string {
  if (num === 0n) return "0";
  let result = "";
  let n = num < 0n ? -num : num;
  while (n > 0n) {
    const remainder = Number(n % 64n);
    result = BASE64_ALPHABET[remainder] + result;
    n = n / 64n;
  }
  return (num < 0n ? "-" : "") + result;
}

/**
 * 校验特定进制的输入合法性
 */
export function validateRadixInput(value: string, fromRadix: number): { isValid: boolean; error?: string } {
  if (!value.trim()) return { isValid: true };

  const clean = value.trim();
  const isNegative = clean.startsWith("-");
  const numStr = isNegative ? clean.slice(1) : clean;

  if (!numStr) return { isValid: false, error: "请输入有效数字" };

  if (fromRadix === 2) {
    if (!/^[01]+$/.test(numStr)) return { isValid: false, error: "二进制只允许输入 0 和 1" };
  } else if (fromRadix === 8) {
    if (!/^[0-7]+$/.test(numStr)) return { isValid: false, error: "八进制只允许输入 0 到 7" };
  } else if (fromRadix === 10) {
    if (!/^\d+$/.test(numStr)) return { isValid: false, error: "十进制只允许输入 0 到 9" };
  } else if (fromRadix === 16) {
    if (!/^[0-9a-fA-F]+$/.test(numStr)) return { isValid: false, error: "十六进制只允许输入 0-9, a-f, A-F" };
  } else if (fromRadix <= 36) {
    const validChars = "0123456789abcdefghijklmnopqrstuvwxyz".slice(0, fromRadix);
    const reg = new RegExp(`^[${validChars}]+$`, "i");
    if (!reg.test(numStr)) return { isValid: false, error: `请输入有效的 ${fromRadix} 进制字符` };
  } else if (fromRadix === 64) {
    for (const char of numStr) {
      if (!BASE64_ALPHABET.includes(char)) {
        return { isValid: false, error: `包含非法的 64 进制字符: "${char}"` };
      }
    }
  }

  return { isValid: true };
}

/**
 * 核心大数任意进制互转 (基于 BigInt)
 */
export function convertRadix(
  input: string,
  fromRadix: number,
  customRadixList: number[] = [2, 8, 10, 16, 32, 36, 64]
): {
  isValid: boolean;
  error?: string;
  results: RadixItem[];
  bitLength?: number;
  byteCount?: number;
} {
  const clean = input.trim();
  if (!clean) {
    return {
      isValid: true,
      results: customRadixList.map((r) => ({
        radix: r,
        name: getRadixName(r),
        prefix: getRadixPrefix(r),
        value: "",
      })),
    };
  }

  const validation = validateRadixInput(clean, fromRadix);
  if (!validation.isValid) {
    return {
      isValid: false,
      error: validation.error,
      results: [],
    };
  }

  const isNegative = clean.startsWith("-");
  const rawNum = isNegative ? clean.slice(1) : clean;

  try {
    let bigNum = 0n;

    if (fromRadix === 64) {
      bigNum = base64ToBigInt(rawNum);
    } else if (fromRadix === 2) {
      bigNum = BigInt("0b" + rawNum);
    } else if (fromRadix === 8) {
      bigNum = BigInt("0o" + rawNum);
    } else if (fromRadix === 10) {
      bigNum = BigInt(rawNum);
    } else if (fromRadix === 16) {
      bigNum = BigInt("0x" + rawNum);
    } else {
      // 32 或 36 进制等通用转换
      const lower = rawNum.toLowerCase();
      const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
      for (let i = 0; i < lower.length; i++) {
        const val = BigInt(alphabet.indexOf(lower[i]));
        bigNum = bigNum * BigInt(fromRadix) + val;
      }
    }

    if (isNegative) {
      bigNum = -bigNum;
    }

    // 计算二进制位长与字节数
    const absNum = bigNum < 0n ? -bigNum : bigNum;
    const binStr = absNum.toString(2);
    const bitLength = absNum === 0n ? 1 : binStr.length;
    const byteCount = Math.ceil(bitLength / 8);

    const results: RadixItem[] = customRadixList.map((r) => {
      let val = "";
      if (r === 64) {
        val = bigIntToBase64(bigNum);
      } else {
        val = bigNum.toString(r);
        if (r === 16) {
          val = val.toUpperCase();
        }
      }

      return {
        radix: r,
        name: getRadixName(r),
        prefix: getRadixPrefix(r),
        value: val,
      };
    });

    return {
      isValid: true,
      results,
      bitLength,
      byteCount,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: `转换失败: ${err?.message || "数值过大或格式有误"}`,
      results: [],
    };
  }
}

export function getRadixName(radix: number): string {
  switch (radix) {
    case 2:
      return "二进制 (Binary)";
    case 8:
      return "八进制 (Octal)";
    case 10:
      return "十进制 (Decimal)";
    case 16:
      return "十六进制 (Hex)";
    case 32:
      return "三十二进制 (Base32)";
    case 36:
      return "三十六进制 (Base36)";
    case 64:
      return "六十四进制 (Base64)";
    default:
      return `${radix} 进制`;
  }
}

export function getRadixPrefix(radix: number): string {
  switch (radix) {
    case 2:
      return "0b";
    case 8:
      return "0o";
    case 16:
      return "0x";
    default:
      return "";
  }
}
