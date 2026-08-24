import JSEncrypt from "jsencrypt";
import { sm2 } from "sm-crypto";

export type AsymmetricAlgorithm = "RSA" | "SM2";
export type CipherFormat = "Auto" | "Base64" | "Hex";
export type OutputFormat = "Base64" | "Hex";

export interface KeyPairResult {
  publicKey: string;
  privateKey: string;
}

export interface AsymmetricOptions {
  algorithm: AsymmetricAlgorithm;
  key: string; // 公钥或私钥 (PEM 格式或 Hex 格式)
  cipherMode?: "1" | "0"; // SM2 模式: 1 (C1C3C2) 或 0 (C1C2C3)
  outputFormat?: OutputFormat;
  inputFormat?: CipherFormat;
}

export interface AsymmetricProcessResult {
  result: string;
  error?: string;
}

/**
 * 将 Hex 编码包装为标准的 PEM 格式文本
 */
export function hexToPem(hex: string, type: "PUBLIC" | "PRIVATE"): string {
  let binary = "";
  for (let i = 0; i < hex.length; i += 2) {
    binary += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  const base64 = btoa(binary);
  const lines = base64.match(/.{1,64}/g) || [];
  return `-----BEGIN ${type} KEY-----\n${lines.join("\n")}\n-----END ${type} KEY-----`;
}

/**
 * 从 PEM 文本或纯 Base64 中还原出 Hex 字符串
 */
export function pemToHex(pem: string): string {
  const clean = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");

  if (/^[0-9a-fA-F]+$/.test(clean)) {
    return clean;
  }

  try {
    const binary = atob(clean);
    let hex = "";
    for (let i = 0; i < binary.length; i++) {
      const h = binary.charCodeAt(i).toString(16);
      hex += h.length === 1 ? "0" + h : h;
    }
    return hex;
  } catch {
    return clean;
  }
}

/**
 * 转换 Base64 与 Hex 格式
 */
export function base64ToHex(base64: string): string {
  const clean = base64.trim();
  const binary = atob(clean);
  let hex = "";
  for (let i = 0; i < binary.length; i++) {
    const h = binary.charCodeAt(i).toString(16);
    hex += h.length === 1 ? "0" + h : h;
  }
  return hex;
}

export function hexToBase64(hex: string): string {
  const clean = hex.trim();
  let binary = "";
  for (let i = 0; i < clean.length; i += 2) {
    binary += String.fromCharCode(parseInt(clean.substr(i, 2), 16));
  }
  return btoa(binary);
}

/**
 * 纯前端本地生成 RSA 或 SM2 密钥对（统一以 PEM 格式输出）
 */
export async function generateAsymmetricKeyPair(
  algorithm: AsymmetricAlgorithm,
  keySize: 1024 | 2048 = 2048
): Promise<KeyPairResult> {
  if (algorithm === "SM2") {
    // 纯前端生成 SM2 密钥对 (256-bit 椭圆曲线)，包装为标准 PEM 格式
    const keypair = sm2.generateKeyPairHex();
    return {
      publicKey: hexToPem(keypair.publicKey, "PUBLIC"),
      privateKey: hexToPem(keypair.privateKey, "PRIVATE"),
    };
  }

  // Web Crypto 原生生成 RSA 密钥对并转换为标准 PEM 格式
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: keySize,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  const spki = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
  const pkcs8 = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  const toPem = (buffer: ArrayBuffer, type: "PUBLIC" | "PRIVATE") => {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    const base64 = btoa(binary);
    const lines = base64.match(/.{1,64}/g) || [];
    return `-----BEGIN ${type} KEY-----\n${lines.join("\n")}\n-----END ${type} KEY-----`;
  };

  return {
    publicKey: toPem(spki, "PUBLIC"),
    privateKey: toPem(pkcs8, "PRIVATE"),
  };
}

/**
 * 非对称公钥加密（支持 PEM 与 Hex 输入，支持 Base64 / Hex 输出）
 */
export function encryptAsymmetric(
  text: string,
  options: AsymmetricOptions
): AsymmetricProcessResult {
  if (!text) return { result: "" };
  if (!options.key.trim()) {
    return { result: "", error: "请输入公钥 (Public Key)" };
  }

  const outputFormat = options.outputFormat || "Base64";

  try {
    if (options.algorithm === "SM2") {
      let pubKeyHex = pemToHex(options.key.trim());
      if (pubKeyHex.length === 128) {
        pubKeyHex = "04" + pubKeyHex;
      }
      const cipherMode = options.cipherMode ? parseInt(options.cipherMode, 10) : 1;
      const cipherHex = sm2.doEncrypt(text, pubKeyHex, cipherMode);
      if (!cipherHex) {
        return { result: "", error: "SM2 加密失败，请检查公钥格式是否正确" };
      }

      if (outputFormat === "Base64") {
        return { result: hexToBase64(cipherHex) };
      }
      return { result: cipherHex };
    }

    // RSA 加密 (JSEncrypt 默认输出 Base64)
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(options.key.trim());
    const encryptedBase64 = encryptor.encrypt(text);

    if (!encryptedBase64) {
      return { result: "", error: "RSA 加密失败，请检查公钥格式是否正确（需包含 PEM 头尾）" };
    }

    if (outputFormat === "Hex") {
      return { result: base64ToHex(encryptedBase64) };
    }
    return { result: encryptedBase64 };
  } catch (err: any) {
    return { result: "", error: `加密失败: ${err?.message || "公钥无效"}` };
  }
}

/**
 * 非对称私钥解密（支持指定输入格式 Auto / Base64 / Hex）
 */
export function decryptAsymmetric(
  ciphertext: string,
  options: AsymmetricOptions
): AsymmetricProcessResult {
  if (!ciphertext.trim()) return { result: "" };
  if (!options.key.trim()) {
    return { result: "", error: "请输入私钥 (Private Key)" };
  }

  const clean = ciphertext.trim();
  const format = options.inputFormat || "Auto";

  let isHex: boolean;
  if (format === "Hex") {
    isHex = true;
  } else if (format === "Base64") {
    isHex = false;
  } else {
    // Auto detect
    isHex = /^[0-9a-fA-F]+$/.test(clean) && clean.length % 2 === 0 && !clean.includes("=");
  }

  try {
    if (options.algorithm === "SM2") {
      const privKeyHex = pemToHex(options.key.trim());
      const cipherMode = options.cipherMode ? parseInt(options.cipherMode, 10) : 1;
      const cipherHex = isHex ? clean : base64ToHex(clean);

      const decrypted = sm2.doDecrypt(cipherHex, privKeyHex, cipherMode);
      if (!decrypted) {
        return { result: "", error: "SM2 解密失败，请检查私钥、密文或输入格式设置" };
      }
      return { result: decrypted };
    }

    // RSA 私钥解密 (JSEncrypt 接收 Base64 密文)
    const cipherBase64 = isHex ? hexToBase64(clean) : clean;
    const decryptor = new JSEncrypt();
    decryptor.setPrivateKey(options.key.trim());
    const decrypted = decryptor.decrypt(cipherBase64);

    if (!decrypted) {
      return { result: "", error: "RSA 解密失败，请检查私钥、密文或输入格式设置" };
    }

    return { result: decrypted };
  } catch (err: any) {
    return { result: "", error: `解密失败: ${err?.message || "私钥或密文格式无效"}` };
  }
}
