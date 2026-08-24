import CryptoJS from "crypto-js";
import { sm3 } from "sm-crypto";

export interface HashResult {
  algorithm: string;
  name: string;
  hash: string;
  bitLength: number;
}

export function computeAllHashes(
  input: string,
  options?: { uppercase?: boolean; hmacKey?: string }
): HashResult[] {
  if (!input) return [];

  const key = options?.hmacKey?.trim();
  const isUppercase = !!options?.uppercase;

  const algorithms = [
    {
      id: "md5",
      name: "MD5",
      bitLength: 128,
      calc: (msg: string) => (key ? CryptoJS.HmacMD5(msg, key) : CryptoJS.MD5(msg)),
    },
    {
      id: "sha1",
      name: "SHA-1",
      bitLength: 160,
      calc: (msg: string) => (key ? CryptoJS.HmacSHA1(msg, key) : CryptoJS.SHA1(msg)),
    },
    {
      id: "sha224",
      name: "SHA-224",
      bitLength: 224,
      calc: (msg: string) => (key ? CryptoJS.HmacSHA224(msg, key) : CryptoJS.SHA224(msg)),
    },
    {
      id: "sha256",
      name: "SHA-256",
      bitLength: 256,
      calc: (msg: string) => (key ? CryptoJS.HmacSHA256(msg, key) : CryptoJS.SHA256(msg)),
    },
    {
      id: "sha384",
      name: "SHA-384",
      bitLength: 384,
      calc: (msg: string) => (key ? CryptoJS.HmacSHA384(msg, key) : CryptoJS.SHA384(msg)),
    },
    {
      id: "sha512",
      name: "SHA-512",
      bitLength: 512,
      calc: (msg: string) => (key ? CryptoJS.HmacSHA512(msg, key) : CryptoJS.SHA512(msg)),
    },
    {
      id: "sha3-256",
      name: "SHA3-256",
      bitLength: 256,
      calc: (msg: string) => (key ? CryptoJS.HmacSHA3(msg, key) : CryptoJS.SHA3(msg, { outputLength: 256 })),
    },
    {
      id: "sha3-512",
      name: "SHA3-512",
      bitLength: 512,
      calc: (msg: string) => (key ? CryptoJS.HmacSHA3(msg, key) : CryptoJS.SHA3(msg, { outputLength: 512 })),
    },
    {
      id: "ripemd160",
      name: "RIPEMD-160",
      bitLength: 160,
      calc: (msg: string) => (key ? CryptoJS.HmacRIPEMD160(msg, key) : CryptoJS.RIPEMD160(msg)),
    },
    {
      id: "sm3",
      name: "SM3",
      bitLength: 256,
      calc: (msg: string) => {
        if (key) {
          return sm3(msg, { key });
        }
        return sm3(msg);
      },
      isRawHex: true,
    },
  ];

  return algorithms.map((alg) => {
    let hex: string;
    if ("isRawHex" in alg && alg.isRawHex) {
      hex = String(alg.calc(input));
    } else {
      hex = (alg.calc(input) as CryptoJS.lib.WordArray).toString(CryptoJS.enc.Hex);
    }

    if (isUppercase) {
      hex = hex.toUpperCase();
    } else {
      hex = hex.toLowerCase();
    }
    return {
      algorithm: alg.id,
      name: key ? `HMAC-${alg.name}` : alg.name,
      hash: hex,
      bitLength: alg.bitLength,
    };
  });
}

export async function computeFileHashes(
  file: File,
  options?: { uppercase?: boolean }
): Promise<HashResult[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("读取文件失败"));
    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
        const uint8Array = new Uint8Array(arrayBuffer);
        const isUppercase = !!options?.uppercase;

        const sm3Hex = sm3(uint8Array);

        const results = [
          { name: "MD5", bitLength: 128, hash: CryptoJS.MD5(wordArray).toString() },
          { name: "SHA-1", bitLength: 160, hash: CryptoJS.SHA1(wordArray).toString() },
          { name: "SHA-256", bitLength: 256, hash: CryptoJS.SHA256(wordArray).toString() },
          { name: "SHA-512", bitLength: 512, hash: CryptoJS.SHA512(wordArray).toString() },
          { name: "SM3", bitLength: 256, hash: sm3Hex },
        ].map((r) => ({
          algorithm: r.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
          name: r.name,
          hash: isUppercase ? r.hash.toUpperCase() : r.hash.toLowerCase(),
          bitLength: r.bitLength,
        }));

        resolve(results);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}
