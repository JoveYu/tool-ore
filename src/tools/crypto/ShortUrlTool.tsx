import React, { useState, useMemo } from "react";
import {
  ShortUrlAlgorithm,
  buildShortUrl,
} from "./shortUrlUtils";
import {
  Link2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Sliders,
  QrCode,
  Globe,
} from "lucide-react";

export default function ShortUrlTool() {
  const [longUrl, setLongUrl] = useState<string>("https://github.com/JoveYu/tool-ore?tab=readme-ov-file#tool-ore");
  const [domainPrefix, setDomainPrefix] = useState<string>("https://ore.link");
  const [algorithm, setAlgorithm] = useState<ShortUrlAlgorithm>("base62");
  const [customSlug, setCustomSlug] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const result = useMemo(
    () =>
      buildShortUrl({
        url: longUrl,
        algorithm,
        domainPrefix,
        customSlug,
      }),
    [longUrl, algorithm, domainPrefix, customSlug]
  );

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const domainOptions = [
    { label: "ore.link (官方推荐)", value: "https://ore.link" },
    { label: "t.cn (微博短链形式)", value: "https://t.cn" },
    { label: "bit.ly", value: "https://bit.ly" },
    { label: "s.tool.dev", value: "https://s.tool.dev" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Link2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              短链接编码生成与解析
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              基于 Base62 / Base58 算法生成高压缩短网址 Slug、支持自定义域名与短链还原验证
            </p>
          </div>
        </div>
      </div>

      {/* Input Long URL Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <span>输入待缩短的长链接 URL</span>
          <button
            onClick={() => setLongUrl("")}
            className="text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer font-sans"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            清空
          </button>
        </div>

        <input
          type="text"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          placeholder="https://example.com/very/long/url/path..."
          className="w-full px-4 py-3 font-mono text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />

        {/* Configurations */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Domain Prefix */}
          <div className="space-y-1.5">
            <label className="font-medium text-slate-700 dark:text-slate-300">短链域名前缀</label>
            <select
              value={domainPrefix}
              onChange={(e) => setDomainPrefix(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none font-medium"
            >
              {domainOptions.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Algorithm */}
          <div className="space-y-1.5">
            <label className="font-medium text-slate-700 dark:text-slate-300">编码算法模式</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as ShortUrlAlgorithm)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none font-medium"
            >
              <option value="base62">Base62 算法 (标准 6 字符)</option>
              <option value="base58">Base58 算法 (去混淆字符)</option>
              <option value="hash_slice">哈希散列切片 (Hash Slice)</option>
              <option value="custom_slug">自定义后缀标识 (Custom Slug)</option>
            </select>
          </div>

          {/* Custom Slug Input */}
          {algorithm === "custom_slug" ? (
            <div className="space-y-1.5">
              <label className="font-medium text-slate-700 dark:text-slate-300">自定义 Slug</label>
              <input
                type="text"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="例如: my-tool"
                className="w-full px-3 py-2 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
            </div>
          ) : (
            <div className="space-y-1.5 flex flex-col justify-end">
              <span className="text-[11px] text-slate-400">
                当前生成 Slug: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{result.slug || "-"}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Generated Short URL Output Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>生成的短链接结果</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy("short", result.shortUrl)}
              disabled={!result.shortUrl}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-xs transition-colors cursor-pointer"
            >
              {copiedKey === "short" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>已复制短链接</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制短链接</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3">
          <span className="font-mono text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400 break-all select-all flex-1">
            {result.shortUrl || "请输入长链接生成短网址"}
          </span>
        </div>
      </div>
    </div>
  );
}
