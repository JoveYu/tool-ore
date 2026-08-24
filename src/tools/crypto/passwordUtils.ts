export interface PasswordOptions {
  length: number; // 4 ~ 64
  includeUppercase: boolean; // A-Z
  includeLowercase: boolean; // a-z
  includeNumbers: boolean; // 0-9
  includeSymbols: boolean; // !@#$%^&*...
  excludeSimilar: boolean; // il1Lo0O
  excludeAmbiguous: boolean; // {}[]()/\'"`~,;:.<>
  quantity?: number; // 批量生成数量 (1 ~ 50)
}

export interface PasswordStrength {
  score: number; // 0 ~ 4 (0: 极弱, 1: 弱, 2: 中等, 3: 强, 4: 极强)
  label: string;
  color: string;
  crackTimeEstimate: string;
}

const UPPERCASE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ"; // 移除了容易混淆的 I, L, O
const UPPERCASE_ALL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const LOWERCASE_CHARS = "abcdefghjkmnpqrstuvwxyz"; // 移除了容易混淆的 i, l, o
const LOWERCASE_ALL = "abcdefghijklmnopqrstuvwxyz";

const NUMBER_CHARS = "23456789"; // 移除了容易混淆的 0, 1
const NUMBER_ALL = "0123456789";

const SIMPLE_SYMBOLS = "!@#$%^&*()_+~=";
const AMBIGUOUS_SYMBOLS = "{}[]()/'\"`~,;:.<>";
const ALL_SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

/**
 * 跨环境获取加密安全随机数（兼容浏览器 window.crypto 与 Node/Bun 测试环境 globalThis.crypto）
 */
function getRandomValues(buffer: Uint32Array): Uint32Array {
  const cryptoObj = typeof globalThis !== "undefined" && globalThis.crypto ? globalThis.crypto : (typeof window !== "undefined" ? window.crypto : null);
  if (cryptoObj && cryptoObj.getRandomValues) {
    return cryptoObj.getRandomValues(buffer);
  }
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = Math.floor(Math.random() * 4294967296);
  }
  return buffer;
}

/**
 * 基于浏览器加密安全随机数生成单个随机密码
 */
export function generateSinglePassword(options: PasswordOptions): string {
  let charPool = "";
  const guaranteedChars: string[] = [];

  const useUpper = options.includeUppercase;
  const useLower = options.includeLowercase;
  const useNumbers = options.includeNumbers;
  const useSymbols = options.includeSymbols;

  if (!useUpper && !useLower && !useNumbers && !useSymbols) {
    return "";
  }

  // 大写字符集
  if (useUpper) {
    const chars = options.excludeSimilar ? UPPERCASE_CHARS : UPPERCASE_ALL;
    charPool += chars;
    guaranteedChars.push(getRandomChar(chars));
  }

  // 小写字符集
  if (useLower) {
    const chars = options.excludeSimilar ? LOWERCASE_CHARS : LOWERCASE_ALL;
    charPool += chars;
    guaranteedChars.push(getRandomChar(chars));
  }

  // 数字字符集
  if (useNumbers) {
    const chars = options.excludeSimilar ? NUMBER_CHARS : NUMBER_ALL;
    charPool += chars;
    guaranteedChars.push(getRandomChar(chars));
  }

  // 特殊符号字符集
  if (useSymbols) {
    let chars = options.excludeAmbiguous ? SIMPLE_SYMBOLS : ALL_SYMBOLS;
    charPool += chars;
    guaranteedChars.push(getRandomChar(chars));
  }

  const length = Math.max(guaranteedChars.length, options.length);
  const passwordChars = [...guaranteedChars];

  // 生成剩余随机字符
  const remainingCount = length - guaranteedChars.length;
  if (remainingCount > 0 && charPool.length > 0) {
    const randomBuffer = new Uint32Array(remainingCount);
    getRandomValues(randomBuffer);
    for (let i = 0; i < remainingCount; i++) {
      const idx = randomBuffer[i] % charPool.length;
      passwordChars.push(charPool[idx]);
    }
  }

  // 使用 Fisher-Yates 洗牌打乱顺序
  return shuffleArray(passwordChars).join("");
}

/**
 * 批量生成密码
 */
export function generatePasswords(options: PasswordOptions): string[] {
  const count = Math.min(50, Math.max(1, options.quantity || 1));
  const list: string[] = [];
  for (let i = 0; i < count; i++) {
    list.push(generateSinglePassword(options));
  }
  return list;
}

/**
 * 安全获取单个随机字符
 */
function getRandomChar(chars: string): string {
  const buf = new Uint32Array(1);
  getRandomValues(buf);
  return chars[buf[0] % chars.length];
}

/**
 * 洗牌算法
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  const buf = new Uint32Array(arr.length);
  getRandomValues(buf);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = buf[i] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 密码强度评估与破解时间估算
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: "无", color: "bg-slate-300", crackTimeEstimate: "0 秒" };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/\d/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

  if (poolSize === 0) poolSize = 1;

  // 熵值 (Entropy in bits) = length * log2(poolSize)
  const entropy = password.length * Math.log2(poolSize);

  let score = 0;
  let label = "极弱";
  let color = "bg-rose-500";
  let crackTimeEstimate = "几毫秒";

  if (entropy < 28) {
    score = 0;
    label = "极弱";
    color = "bg-rose-500";
    crackTimeEstimate = "几毫秒至几秒";
  } else if (entropy < 45) {
    score = 1;
    label = "弱";
    color = "bg-amber-500";
    crackTimeEstimate = "几分钟至几小时";
  } else if (entropy < 65) {
    score = 2;
    label = "中等";
    color = "bg-yellow-500";
    crackTimeEstimate = "数周至数年";
  } else if (entropy < 85) {
    score = 3;
    label = "强";
    color = "bg-emerald-500";
    crackTimeEstimate = "数百年至数万年";
  } else {
    score = 4;
    label = "极强";
    color = "bg-indigo-500";
    crackTimeEstimate = "数亿年 (无法暴力破解)";
  }

  return {
    score,
    label,
    color,
    crackTimeEstimate,
  };
}
