export interface JwtClaimDetails {
  exp?: number;
  expFormatted?: string;
  isExpired?: boolean;
  remainingTime?: string;
  iat?: number;
  iatFormatted?: string;
  nbf?: number;
  nbfFormatted?: string;
  isNotBeforeValid?: boolean;
  iss?: string;
  sub?: string;
  aud?: string | string[];
}

export interface JwtParseResult {
  isValid: boolean;
  error?: string;
  rawHeader: string;
  rawPayload: string;
  rawSignature: string;
  headerObj: Record<string, any>;
  payloadObj: Record<string, any>;
  formattedHeader: string;
  formattedPayload: string;
  claims: JwtClaimDetails;
}

/**
 * Base64Url 安全解码为 UTF-8 字符串
 */
export function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Base64Url 安全编码
 */
export function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * 解析 JWT 字符串
 */
export function parseJwt(token: string): JwtParseResult {
  const clean = token.trim();
  if (!clean) {
    return {
      isValid: false,
      error: "请输入待解析的 JWT Token",
      rawHeader: "",
      rawPayload: "",
      rawSignature: "",
      headerObj: {},
      payloadObj: {},
      formattedHeader: "",
      formattedPayload: "",
      claims: {},
    };
  }

  const parts = clean.split(".");
  if (parts.length !== 3) {
    return {
      isValid: false,
      error: "无效的 JWT 格式（JWT 必须由两处点号分隔为三段结构）",
      rawHeader: "",
      rawPayload: "",
      rawSignature: "",
      headerObj: {},
      payloadObj: {},
      formattedHeader: "",
      formattedPayload: "",
      claims: {},
    };
  }

  try {
    const headerStr = base64UrlDecode(parts[0]);
    const payloadStr = base64UrlDecode(parts[1]);

    const headerObj = JSON.parse(headerStr);
    const payloadObj = JSON.parse(payloadStr);

    const nowSec = Math.floor(Date.now() / 1000);
    const claims: JwtClaimDetails = {};

    if (typeof payloadObj.exp === "number") {
      claims.exp = payloadObj.exp;
      const expDate = new Date(payloadObj.exp * 1000);
      claims.expFormatted = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, "0")}-${String(expDate.getDate()).padStart(2, "0")} ${String(expDate.getHours()).padStart(2, "0")}:${String(expDate.getMinutes()).padStart(2, "0")}:${String(expDate.getSeconds()).padStart(2, "0")}`;
      claims.isExpired = payloadObj.exp < nowSec;

      const diffSec = payloadObj.exp - nowSec;
      if (diffSec > 0) {
        if (diffSec < 60) claims.remainingTime = `${diffSec} 秒后过期`;
        else if (diffSec < 3600) claims.remainingTime = `${Math.floor(diffSec / 60)} 分钟后过期`;
        else if (diffSec < 86400) claims.remainingTime = `${Math.floor(diffSec / 3600)} 小时后过期`;
        else claims.remainingTime = `${Math.floor(diffSec / 86400)} 天后过期`;
      } else {
        const absDiff = Math.abs(diffSec);
        if (absDiff < 60) claims.remainingTime = `已过期 ${absDiff} 秒`;
        else if (absDiff < 3600) claims.remainingTime = `已过期 ${Math.floor(absDiff / 60)} 分钟`;
        else claims.remainingTime = `已过期 ${Math.floor(absDiff / 86400)} 天`;
      }
    }

    if (typeof payloadObj.iat === "number") {
      claims.iat = payloadObj.iat;
      const iatDate = new Date(payloadObj.iat * 1000);
      claims.iatFormatted = `${iatDate.getFullYear()}-${String(iatDate.getMonth() + 1).padStart(2, "0")}-${String(iatDate.getDate()).padStart(2, "0")} ${String(iatDate.getHours()).padStart(2, "0")}:${String(iatDate.getMinutes()).padStart(2, "0")}:${String(iatDate.getSeconds()).padStart(2, "0")}`;
    }

    if (typeof payloadObj.nbf === "number") {
      claims.nbf = payloadObj.nbf;
      const nbfDate = new Date(payloadObj.nbf * 1000);
      claims.nbfFormatted = `${nbfDate.getFullYear()}-${String(nbfDate.getMonth() + 1).padStart(2, "0")}-${String(nbfDate.getDate()).padStart(2, "0")} ${String(nbfDate.getHours()).padStart(2, "0")}:${String(nbfDate.getMinutes()).padStart(2, "0")}:${String(nbfDate.getSeconds()).padStart(2, "0")}`;
      claims.isNotBeforeValid = nowSec >= payloadObj.nbf;
    }

    if (payloadObj.iss) claims.iss = String(payloadObj.iss);
    if (payloadObj.sub) claims.sub = String(payloadObj.sub);
    if (payloadObj.aud) claims.aud = payloadObj.aud;

    return {
      isValid: true,
      rawHeader: parts[0],
      rawPayload: parts[1],
      rawSignature: parts[2],
      headerObj,
      payloadObj,
      formattedHeader: JSON.stringify(headerObj, null, 2),
      formattedPayload: JSON.stringify(payloadObj, null, 2),
      claims,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: `Token 解码失败: ${err?.message || "Base64 或 JSON 格式损坏"}`,
      rawHeader: parts[0] || "",
      rawPayload: parts[1] || "",
      rawSignature: parts[2] || "",
      headerObj: {},
      payloadObj: {},
      formattedHeader: "",
      formattedPayload: "",
      claims: {},
    };
  }
}

/**
 * 验证 HMAC-SHA256 (HS256) 签名
 */
export async function verifyHs256Signature(
  token: string,
  secret: string
): Promise<{ isValid: boolean; error?: string }> {
  if (!secret) {
    return { isValid: false, error: "请输入密钥以验证签名" };
  }

  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return { isValid: false, error: "Token 格式无效" };
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${parts[0]}.${parts[1]}`);
    const keyData = encoder.encode(secret);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, data);
    const signatureBytes = new Uint8Array(signatureBuffer);
    let binary = "";
    for (let i = 0; i < signatureBytes.byteLength; i++) {
      binary += String.fromCharCode(signatureBytes[i]);
    }
    const expectedSig = btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    return {
      isValid: expectedSig === parts[2],
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: `签名验证失败: ${err?.message || "密钥或算法计算有误"}`,
    };
  }
}
