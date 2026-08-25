/**
 * Base64 编解码核心工具类
 * 纯前端本地处理，支持 UTF-8 文本完整字符集与 URL 安全模式
 */

export function encodeBase64(text: string, urlSafe: boolean = false): string {
  if (!text) return "";
  const utf8Bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  let base64 = btoa(binary);
  if (urlSafe) {
    base64 = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return base64;
}

export function decodeBase64(base64: string, urlSafe: boolean = false): {
  result: string;
  error?: string;
} {
  if (!base64.trim()) return { result: "" };
  try {
    let clean = base64.trim();
    if (urlSafe || clean.includes("-") || clean.includes("_")) {
      clean = clean.replace(/-/g, "+").replace(/_/g, "/");
      while (clean.length % 4 !== 0) {
        clean += "=";
      }
    }
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const result = new TextDecoder().decode(bytes);
    return { result };
  } catch (err) {
    return { result: "", error: "Base64 字符串格式不正确，解码失败" };
  }
}

export function fileToBase64(file: File): Promise<{
  dataUrl: string;
  rawBase64: string;
  size: number;
  type: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("读取文件失败"));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const rawBase64 = dataUrl.split(",")[1] || "";
      resolve({
        dataUrl,
        rawBase64,
        size: file.size,
        type: file.type || "application/octet-stream",
      });
    };
    reader.readAsDataURL(file);
  });
}
