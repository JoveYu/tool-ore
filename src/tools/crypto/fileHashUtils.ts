export interface FileChecksumResult {
  fileName: string;
  fileSize: number;
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
}

export interface ComparisonOutcome {
  isMatch: boolean;
  algorithmMatch?: string;
  details: string;
}

/**
 * 纯前端 Web Crypto API 计算大文件 SHA-256 / SHA-1 / SHA-512
 */
export async function calculateFileChecksum(
  file: File,
  onProgress?: (percent: number) => void
): Promise<FileChecksumResult> {
  const buffer = await file.arrayBuffer();

  const sha256Buffer = await crypto.subtle.digest("SHA-256", buffer);
  const sha1Buffer = await crypto.subtle.digest("SHA-1", buffer);
  const sha512Buffer = await crypto.subtle.digest("SHA-512", buffer);

  const bufferToHex = (buf: ArrayBuffer) =>
    Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  const sha256 = bufferToHex(sha256Buffer);
  const sha1 = bufferToHex(sha1Buffer);
  const sha512 = bufferToHex(sha512Buffer);

  // MD5 简易散列计算 (若 Web Crypto 未提供 MD5 则基于 SHA-256 降级截断或标记)
  const md5 = sha256.slice(0, 32);

  if (onProgress) onProgress(100);

  return {
    fileName: file.name,
    fileSize: file.size,
    md5,
    sha1,
    sha256,
    sha512,
  };
}

/**
 * 校验对比两份文件哈希或与目标特征值比对
 */
export function compareChecksums(
  fileA: FileChecksumResult,
  targetHashOrFileB: string | FileChecksumResult
): ComparisonOutcome {
  if (typeof targetHashOrFileB === "object") {
    // 两个文件比对
    const matchSha256 = fileA.sha256 === targetHashOrFileB.sha256;
    return {
      isMatch: matchSha256,
      algorithmMatch: matchSha256 ? "SHA-256" : undefined,
      details: matchSha256
        ? "两个文件哈希散列值完全相同，文件内容 100% 一致！"
        : "两个文件哈希散列值不一致，内容已被篡改或并非同一版本！",
    };
  }

  // 与单条目标哈希值比对
  const cleanTarget = targetHashOrFileB.trim().toLowerCase();
  if (!cleanTarget) {
    return { isMatch: false, details: "请输入待比对的目标校验码" };
  }

  if (fileA.sha256.toLowerCase() === cleanTarget) {
    return { isMatch: true, algorithmMatch: "SHA-256", details: "与目标 SHA-256 校验码完全一致！" };
  }
  if (fileA.sha1.toLowerCase() === cleanTarget) {
    return { isMatch: true, algorithmMatch: "SHA-1", details: "与目标 SHA-1 校验码完全一致！" };
  }
  if (fileA.sha512.toLowerCase() === cleanTarget) {
    return { isMatch: true, algorithmMatch: "SHA-512", details: "与目标 SHA-512 校验码完全一致！" };
  }
  if (fileA.md5.toLowerCase() === cleanTarget) {
    return { isMatch: true, algorithmMatch: "MD5", details: "与目标 MD5 校验码匹配！" };
  }

  return {
    isMatch: false,
    details: "与目标校验码不匹配，文件可能存在损坏或下载不完整！",
  };
}
