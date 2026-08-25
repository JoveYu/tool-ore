import CryptoJS from "crypto-js";
import { sm4 } from "sm-crypto";

export type SymmetricAlgorithm = "AES" | "DES" | "TripleDES" | "RC4" | "Rabbit" | "SM4";
export type CipherMode = "CBC" | "ECB" | "CTR" | "OFB" | "CFB";
export type PaddingMode = "Pkcs7" | "ZeroPadding" | "NoPadding" | "AnsiX923" | "Iso10126";
export type OutputFormat = "Base64" | "Hex";
export type InputCipherFormat = "Auto" | "Base64" | "Hex";

export interface CryptoOptions {
  algorithm: SymmetricAlgorithm;
  key: string;
  iv?: string;
  mode?: CipherMode;
  padding?: PaddingMode;
  outputFormat?: OutputFormat;
  inputFormat?: InputCipherFormat;
}

export interface CryptoProcessResult {
  result: string;
  error?: string;
}

function getCryptoJSMode(mode: CipherMode) {
  switch (mode) {
    case "ECB":
      return CryptoJS.mode.ECB;
    case "CTR":
      return CryptoJS.mode.CTR;
    case "OFB":
      return CryptoJS.mode.OFB;
    case "CFB":
      return CryptoJS.mode.CFB;
    case "CBC":
    default:
      return CryptoJS.mode.CBC;
  }
}

function getCryptoJSPadding(pad: PaddingMode) {
  switch (pad) {
    case "ZeroPadding":
      return CryptoJS.pad.ZeroPadding;
    case "NoPadding":
      return CryptoJS.pad.NoPadding;
    case "AnsiX923":
      return CryptoJS.pad.AnsiX923;
    case "Iso10126":
      return CryptoJS.pad.Iso10126;
    case "Pkcs7":
    default:
      return CryptoJS.pad.Pkcs7;
  }
}

/**
 * 规范化 Key 与 IV 为 CryptoJS WordArray
 */
function parseKeyAndIv(key: string, iv?: string, blockSizeBytes = 16) {
  let keyWordArray: CryptoJS.lib.WordArray;

  // 如果密钥是标准的 Hex（32 / 48 / 64 字符），按 Hex 解析，否则按 UTF-8 解析
  if (/^[0-9a-fA-F]{32}$/.test(key) || /^[0-9a-fA-F]{48}$/.test(key) || /^[0-9a-fA-F]{64}$/.test(key)) {
    keyWordArray = CryptoJS.enc.Hex.parse(key);
  } else {
    // 补齐或截断到标准字节
    keyWordArray = CryptoJS.enc.Utf8.parse(key.padEnd(blockSizeBytes, "0").slice(0, blockSizeBytes));
  }

  let ivWordArray: CryptoJS.lib.WordArray | undefined;
  if (iv) {
    if (/^[0-9a-fA-F]{16}$/.test(iv) || /^[0-9a-fA-F]{32}$/.test(iv)) {
      ivWordArray = CryptoJS.enc.Hex.parse(iv);
    } else {
      ivWordArray = CryptoJS.enc.Utf8.parse(iv.padEnd(blockSizeBytes, "0").slice(0, blockSizeBytes));
    }
  } else {
    ivWordArray = CryptoJS.enc.Utf8.parse("0123456789abcdef".slice(0, blockSizeBytes));
  }

  return { keyWordArray, ivWordArray };
}

/**
 * 通用对称加密（AES / DES / 3DES / RC4 / Rabbit / SM4）
 */
export function encryptText(text: string, options: CryptoOptions): CryptoProcessResult {
  if (!text) return { result: "" };
  if (!options.key) {
    return { result: "", error: "请输入加密密钥" };
  }

  try {
    const isHexOutput = options.outputFormat === "Hex";

    // 1. SM4 加密
    if (options.algorithm === "SM4") {
      let keyHex = options.key;
      if (!/^[0-9a-fA-F]{32}$/.test(keyHex)) {
        keyHex = CryptoJS.enc.Utf8.parse(keyHex).toString(CryptoJS.enc.Hex).padEnd(32, "0").slice(0, 32);
      }

      let ivHex = options.iv;
      if (options.mode === "CBC") {
        if (!ivHex) {
          ivHex = "0123456789abcdeffedcba9876543210";
        } else if (!/^[0-9a-fA-F]{32}$/.test(ivHex)) {
          ivHex = CryptoJS.enc.Utf8.parse(ivHex).toString(CryptoJS.enc.Hex).padEnd(32, "0").slice(0, 32);
        }
      }

      const sm4Res = sm4.encrypt(text, keyHex, {
        mode: options.mode === "ECB" ? "ecb" : "cbc",
        iv: options.mode === "CBC" ? ivHex : undefined,
        output: isHexOutput ? "hex" : "base64",
      });

      return { result: sm4Res };
    }

    // 2. RC4 与 Rabbit
    if (options.algorithm === "RC4") {
      const encrypted = CryptoJS.RC4.encrypt(text, options.key);
      return { result: isHexOutput ? encrypted.ciphertext.toString(CryptoJS.enc.Hex) : encrypted.toString() };
    }

    if (options.algorithm === "Rabbit") {
      const encrypted = CryptoJS.Rabbit.encrypt(text, options.key);
      return { result: isHexOutput ? encrypted.ciphertext.toString(CryptoJS.enc.Hex) : encrypted.toString() };
    }

    // 3. Block Ciphers: AES, DES, TripleDES
    const blockSize = options.algorithm === "DES" || options.algorithm === "TripleDES" ? 8 : 16;
    const { keyWordArray, ivWordArray } = parseKeyAndIv(options.key, options.iv, blockSize);

    const cfg: any = {
      mode: getCryptoJSMode(options.mode || "CBC"),
      padding: getCryptoJSPadding(options.padding || "Pkcs7"),
    };

    if (options.mode !== "ECB") {
      cfg.iv = ivWordArray;
    }

    let encrypted: CryptoJS.lib.CipherParams;
    if (options.algorithm === "DES") {
      encrypted = CryptoJS.DES.encrypt(text, keyWordArray, cfg);
    } else if (options.algorithm === "TripleDES") {
      encrypted = CryptoJS.TripleDES.encrypt(text, keyWordArray, cfg);
    } else {
      // AES
      encrypted = CryptoJS.AES.encrypt(text, keyWordArray, cfg);
    }

    if (isHexOutput) {
      return { result: encrypted.ciphertext.toString(CryptoJS.enc.Hex) };
    }
    return { result: encrypted.toString() };
  } catch (err: any) {
    return { result: "", error: `加密失败: ${err?.message || "参数错误"}` };
  }
}

/**
 * 通用对称解密（AES / DES / 3DES / RC4 / Rabbit / SM4）
 */
export function decryptText(ciphertext: string, options: CryptoOptions): CryptoProcessResult {
  if (!ciphertext.trim()) return { result: "" };
  if (!options.key) {
    return { result: "", error: "请输入解密密钥" };
  }

  const clean = ciphertext.trim();
  const format = options.inputFormat || "Auto";

  let isHex = false;
  if (format === "Hex") {
    isHex = true;
  } else if (format === "Base64") {
    isHex = false;
  } else {
    isHex = /^[0-9a-fA-F]+$/.test(clean) && clean.length % 2 === 0 && !clean.includes("=");
  }

  try {
    // 1. SM4 解密
    if (options.algorithm === "SM4") {
      let keyHex = options.key;
      if (!/^[0-9a-fA-F]{32}$/.test(keyHex)) {
        keyHex = CryptoJS.enc.Utf8.parse(keyHex).toString(CryptoJS.enc.Hex).padEnd(32, "0").slice(0, 32);
      }

      let ivHex = options.iv;
      if (options.mode === "CBC") {
        if (!ivHex) {
          ivHex = "0123456789abcdeffedcba9876543210";
        } else if (!/^[0-9a-fA-F]{32}$/.test(ivHex)) {
          ivHex = CryptoJS.enc.Utf8.parse(ivHex).toString(CryptoJS.enc.Hex).padEnd(32, "0").slice(0, 32);
        }
      }

      const decrypted = sm4.decrypt(clean, keyHex, {
        mode: options.mode === "ECB" ? "ecb" : "cbc",
        iv: options.mode === "CBC" ? ivHex : undefined,
        input: isHex ? "hex" : "base64",
      });

      if (!decrypted) {
        return { result: "", error: "SM4 解密失败，请检查密钥、密文或模式参数" };
      }
      return { result: decrypted };
    }

    // 2. RC4 与 Rabbit
    if (options.algorithm === "RC4" || options.algorithm === "Rabbit") {
      const cipherParams = isHex
        ? CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Hex.parse(clean) })
        : clean;

      const cipher = options.algorithm === "RC4" ? CryptoJS.RC4 : CryptoJS.Rabbit;
      const decrypted = cipher.decrypt(cipherParams as any, options.key);
      const str = decrypted.toString(CryptoJS.enc.Utf8);
      if (!str) {
        return { result: "", error: "解密失败，请检查密钥与密文" };
      }
      return { result: str };
    }

    // 3. Block Ciphers: AES, DES, TripleDES
    const blockSize = options.algorithm === "DES" || options.algorithm === "TripleDES" ? 8 : 16;
    const { keyWordArray, ivWordArray } = parseKeyAndIv(options.key, options.iv, blockSize);

    const cfg: any = {
      mode: getCryptoJSMode(options.mode || "CBC"),
      padding: getCryptoJSPadding(options.padding || "Pkcs7"),
    };

    if (options.mode !== "ECB") {
      cfg.iv = ivWordArray;
    }

    let cipherParams: CryptoJS.lib.CipherParams | string;
    if (isHex) {
      cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(clean),
      });
    } else {
      cipherParams = clean;
    }

    let decrypted: CryptoJS.lib.WordArray;
    if (options.algorithm === "DES") {
      decrypted = CryptoJS.DES.decrypt(cipherParams as any, keyWordArray, cfg);
    } else if (options.algorithm === "TripleDES") {
      decrypted = CryptoJS.TripleDES.decrypt(cipherParams as any, keyWordArray, cfg);
    } else {
      // AES
      decrypted = CryptoJS.AES.decrypt(cipherParams as any, keyWordArray, cfg);
    }

    const str = decrypted.toString(CryptoJS.enc.Utf8);
    if (!str) {
      return { result: "", error: "解密失败，密文或密钥、模式参数不匹配" };
    }
    return { result: str };
  } catch (err: any) {
    return { result: "", error: `解密失败: ${err?.message || "密文格式或密钥错误"}` };
  }
}
