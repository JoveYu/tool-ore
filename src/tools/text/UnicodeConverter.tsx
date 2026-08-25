import React, { useState, useMemo } from "react";
import { textToUnicodeFormats, decodeToText } from "./unicodeUtils";
import {
  Binary,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  FileCode2,
} from "lucide-react";

type Mode = "encode" | "decode";

export default function UnicodeConverter() {
  const [mode, setMode] = useState<Mode>("encode");
  const [inputText, setInputText] = useState<string>("你好，世界！Hello 2026.");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const encodedResults = useMemo(() => textToUnicodeFormats(inputText), [inputText]);
  const decodedResult = useMemo(() => decodeToText(inputText), [inputText]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleSwap = () => {
    if (mode === "encode") {
      setInputText(encodedResults.escapeU);
      setMode("decode");
    } else {
      setInputText(decodedResult);
      setMode("encode");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Binary className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Unicode 字符与编码互转
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                汉字与 \u4e2d\u6587、HTML 实体、U+码位及 UTF-8 字节十六进制全量多格式双向转换
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium self-start sm:self-center">
            <button
              onClick={() => setMode("encode")}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                mode === "encode"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              文本编码为 Unicode
            </button>
            <button
              onClick={() => setMode("decode")}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                mode === "decode"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Unicode 解码为文本
            </button>
          </div>
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {mode === "encode" ? "输入原始中文或英文字符串" : "输入待解码的 Unicode 字符串 (如 \\u4e2d\\u6587 或 &#x4E2D;)"}
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSwap}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              对调模式
            </button>
            <button
              onClick={() => setInputText("")}
              className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              清空
            </button>
          </div>
        </div>

        <textarea
          rows={4}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="在此输入文本..."
          className="w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none leading-relaxed"
        />
      </div>

      {mode === "encode" ? (
        /* Multi-format Results Grid */
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            各类 Unicode 编码格式输出
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* \uXXXX */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Unicode 转义字符 (\uXXXX)
                </span>
                <button
                  onClick={() => handleCopy("u", encodedResults.escapeU)}
                  className="text-slate-400 hover:text-indigo-600 cursor-pointer flex items-center gap-1"
                >
                  {copiedKey === "u" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[11px]">复制</span>
                </button>
              </div>
              <textarea
                rows={3}
                readOnly
                value={encodedResults.escapeU}
                className="w-full p-2.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-indigo-950 dark:text-indigo-200 outline-none select-all resize-none leading-relaxed break-all"
              />
            </div>

            {/* HTML Hex &#xXXXX; */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  HTML 十六进制实体 (&#xXXXX;)
                </span>
                <button
                  onClick={() => handleCopy("htmlHex", encodedResults.htmlHex)}
                  className="text-slate-400 hover:text-indigo-600 cursor-pointer flex items-center gap-1"
                >
                  {copiedKey === "htmlHex" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[11px]">复制</span>
                </button>
              </div>
              <textarea
                rows={3}
                readOnly
                value={encodedResults.htmlHex}
                className="w-full p-2.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-indigo-950 dark:text-indigo-200 outline-none select-all resize-none leading-relaxed break-all"
              />
            </div>

            {/* HTML Dec &#XXXX; */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  HTML 十进制实体 (&#XXXX;)
                </span>
                <button
                  onClick={() => handleCopy("htmlDec", encodedResults.htmlDec)}
                  className="text-slate-400 hover:text-indigo-600 cursor-pointer flex items-center gap-1"
                >
                  {copiedKey === "htmlDec" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[11px]">复制</span>
                </button>
              </div>
              <textarea
                rows={3}
                readOnly
                value={encodedResults.htmlDec}
                className="w-full p-2.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-indigo-950 dark:text-indigo-200 outline-none select-all resize-none leading-relaxed break-all"
              />
            </div>

            {/* UTF-8 Hex */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  UTF-8 字节十六进制 (Hex Bytes)
                </span>
                <button
                  onClick={() => handleCopy("utf8", encodedResults.utf8Hex)}
                  className="text-slate-400 hover:text-indigo-600 cursor-pointer flex items-center gap-1"
                >
                  {copiedKey === "utf8" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[11px]">复制</span>
                </button>
              </div>
              <textarea
                rows={3}
                readOnly
                value={encodedResults.utf8Hex}
                className="w-full p-2.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-indigo-950 dark:text-indigo-200 outline-none select-all resize-none leading-relaxed break-all"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Decode Result Panel */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <span>解码还原的纯文本结果</span>
            <button
              onClick={() => handleCopy("decode", decodedResult)}
              disabled={!decodedResult}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-xs transition-colors cursor-pointer"
            >
              {copiedKey === "decode" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制结果</span>
                </>
              )}
            </button>
          </div>

          <textarea
            rows={8}
            readOnly
            value={decodedResult}
            placeholder="解码结果将实时展示在此处..."
            className="w-full p-4 font-mono text-sm rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-indigo-950 dark:text-indigo-200 outline-none select-all resize-none leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}
