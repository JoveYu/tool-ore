import React, { useState, useEffect, useMemo } from "react";
import { parseJwt, verifyHs256Signature, base64UrlEncode } from "./jwtUtils";
import {
  FileCode2,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Key,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function JwtDebugger() {
  // 预设样例 Token
  const defaultHeader = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const defaultPayload = base64UrlEncode(
    JSON.stringify({
      sub: "1234567890",
      name: "张三",
      role: "admin",
      iat: Math.floor(Date.now() / 1000) - 3600,
      exp: Math.floor(Date.now() / 1000) + 7200,
      iss: "tool-ore-auth",
    })
  );
  const defaultToken = `${defaultHeader}.${defaultPayload}.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;

  const [jwtToken, setJwtToken] = useState<string>(defaultToken);
  const [secretKey, setSecretKey] = useState<string>("your-256-bit-secret");
  const [sigStatus, setSigStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const parsed = useMemo(() => parseJwt(jwtToken), [jwtToken]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleVerifySignature = async () => {
    if (!parsed.isValid) return;
    const res = await verifyHs256Signature(jwtToken, secretKey);
    setSigStatus(res.isValid ? "valid" : "invalid");
  };

  // 生成指定有效期的示例 Token
  const handleLoadSample = (type: "valid" | "expired") => {
    const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const now = Math.floor(Date.now() / 1000);
    const payload = base64UrlEncode(
      JSON.stringify({
        sub: "usr_998877",
        name: "李四",
        role: type === "valid" ? "developer" : "guest",
        iat: type === "valid" ? now - 600 : now - 86400,
        exp: type === "valid" ? now + 86400 : now - 3600,
        iss: "https://auth.example.com",
      })
    );
    const token = `${header}.${payload}.sample_mock_signature_hash_xyz`;
    setJwtToken(token);
    setSigStatus("idle");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                JWT Token 解析与验证
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                JSON Web Token 头部与载荷极速解析、过期时间智能提示与 HS256 签名校验
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => handleLoadSample("valid")}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              载入有效示例
            </button>
            <button
              onClick={() => handleLoadSample("expired")}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              载入过期示例
            </button>
          </div>
        </div>
      </div>

      {/* Main Encoded Token Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            输入待解析的 JWT Token (Encoded)
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy("raw_jwt", jwtToken)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === "raw_jwt" ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              复制 Token
            </button>
            <button
              onClick={() => setJwtToken("")}
              className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              清空
            </button>
          </div>
        </div>

        <textarea
          rows={4}
          value={jwtToken}
          onChange={(e) => {
            setJwtToken(e.target.value);
            setSigStatus("idle");
          }}
          placeholder="粘贴你的 JWT Token (格式如: xxxxx.yyyyy.zzzzz)..."
          className="w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none leading-relaxed break-all"
        />

        {/* Color-coded parts breakdown */}
        {parsed.isValid && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono pt-1">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Header 头部 ({parsed.headerObj.alg || "未知算法"})
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Payload 载荷数据 ({Object.keys(parsed.payloadObj).length} 个字段)
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/50">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              Signature 签名散列
            </span>
          </div>
        )}

        {!parsed.isValid && jwtToken.trim() && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{parsed.error}</span>
          </div>
        )}
      </div>

      {/* Claims Summary Status Card */}
      {parsed.isValid && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Token 声明与有效期状态</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Expiry Status */}
            <div
              className={`p-4 rounded-xl border ${
                parsed.claims.exp === undefined
                  ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700"
                  : parsed.claims.isExpired
                  ? "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60"
                  : "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60"
              }`}
            >
              <div className="text-xs text-slate-500 dark:text-slate-400">过期状态</div>
              <div className="mt-1 font-bold text-sm flex items-center gap-1.5">
                {parsed.claims.exp === undefined ? (
                  <span className="text-slate-600 dark:text-slate-300">未设置过期时间</span>
                ) : parsed.claims.isExpired ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span className="text-rose-600 dark:text-rose-400">
                      {parsed.claims.remainingTime}
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      有效（{parsed.claims.remainingTime}）
                    </span>
                  </>
                )}
              </div>
              {parsed.claims.expFormatted && (
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  截止: {parsed.claims.expFormatted}
                </div>
              )}
            </div>

            {/* Issued At */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
              <div className="text-xs text-slate-500 dark:text-slate-400">签发时间 (iat)</div>
              <div className="mt-1 font-bold text-sm text-slate-800 dark:text-slate-100 font-mono">
                {parsed.claims.iatFormatted || "未提供"}
              </div>
              {parsed.claims.iat && (
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  秒戳: {parsed.claims.iat}
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
              <div className="text-xs text-slate-500 dark:text-slate-400">主体标识 (sub)</div>
              <div className="mt-1 font-bold text-sm text-slate-800 dark:text-slate-100 font-mono truncate">
                {parsed.claims.sub || "未设置"}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-sans">
                {parsed.claims.iss ? `签发者: ${parsed.claims.iss}` : "标准用户/凭据主体"}
              </div>
            </div>

            {/* Algorithm */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
              <div className="text-xs text-slate-500 dark:text-slate-400">加密算法 (alg)</div>
              <div className="mt-1 font-bold text-sm text-indigo-600 dark:text-indigo-400 font-mono">
                {parsed.headerObj.alg || "none"}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                类型: {parsed.headerObj.typ || "JWT"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decoded Header & Payload Inspection */}
      {parsed.isValid && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>HEADER: 算法与类型</span>
              </div>

              <button
                onClick={() => handleCopy("header_json", parsed.formattedHeader)}
                className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === "header_json" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                复制 Header
              </button>
            </div>

            <pre className="flex-1 w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-rose-950 dark:text-rose-200 font-mono text-xs leading-relaxed overflow-x-auto select-all">
              {parsed.formattedHeader}
            </pre>
          </div>

          {/* Payload */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                <span>PAYLOAD: 数据载荷 (Claims)</span>
              </div>

              <button
                onClick={() => handleCopy("payload_json", parsed.formattedPayload)}
                className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === "payload_json" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                复制 Payload
              </button>
            </div>

            <pre className="flex-1 w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-indigo-950 dark:text-indigo-200 font-mono text-xs leading-relaxed overflow-x-auto select-all">
              {parsed.formattedPayload}
            </pre>
          </div>
        </div>
      )}

      {/* Signature Verification Section */}
      {parsed.isValid && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
              <Key className="w-4 h-4" />
              <span>VERIFY SIGNATURE: 签名校验 (HS256)</span>
            </div>

            {sigStatus === "valid" && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                签名验证通过
              </span>
            )}

            {sigStatus === "invalid" && (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800">
                <ShieldAlert className="w-3.5 h-3.5" />
                签名不匹配 (Invalid Signature)
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={secretKey}
                onChange={(e) => {
                  setSecretKey(e.target.value);
                  setSigStatus("idle");
                }}
                placeholder="请输入 HMAC 签名密钥 (your-256-bit-secret)..."
                className="w-full px-4 py-2.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleVerifySignature}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer shrink-0"
            >
              验证签名
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
