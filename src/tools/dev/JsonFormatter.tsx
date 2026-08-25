import React, { useState, useMemo } from "react";
import { formatJson, minifyJson, JsonFormatOptions } from "./jsonUtils";
import { formatFileSize } from "../image/imageUtils";
import {
  Braces,
  Copy,
  Check,
  RotateCcw,
  Minimize2,
  Maximize2,
  ArrowDownUp,
  AlertCircle,
  CheckCircle2,
  FileCode,
  Sparkles,
} from "lucide-react";

const SAMPLE_JSON = `{
  "name": "在线工具",
  "version": "1.0.0",
  "features": [
    "大写金额转换",
    "图片压缩与格式转换",
    "颜色拾取器",
    "Base64 编解码",
    "哈希散列计算 (MD5, SHA-256, SM3)",
    "JSON 格式化",
    "文本比对与排版",
    "二维码生成与识别"
  ],
  "author": {
    "organization": "Open Source Team",
    "license": "MIT",
    "isPureFrontend": true
  },
  "settings": {
    "theme": "auto",
    "offlineSupport": true,
    "maxPayloadMb": 100
  }
}`;

export default function JsonFormatter() {
  const [inputJson, setInputJson] = useState<string>(SAMPLE_JSON);
  const [indent, setIndent] = useState<number>(2);
  const [sortKeys, setSortKeys] = useState<boolean>(false);
  const [unescapeUnicode, setUnescapeUnicode] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const options: JsonFormatOptions = useMemo(
    () => ({
      indent,
      sortKeys,
      unescapeUnicode,
    }),
    [indent, sortKeys, unescapeUnicode]
  );

  const processedResult = useMemo(() => {
    return formatJson(inputJson, options);
  }, [inputJson, options]);

  const handleMinify = () => {
    const minified = minifyJson(inputJson);
    if (minified.isValid) {
      setInputJson(minified.formattedText);
    }
  };

  const handleFormat = () => {
    if (processedResult.isValid && processedResult.formattedText) {
      setInputJson(processedResult.formattedText);
    }
  };

  const handleCopy = async () => {
    if (!processedResult.formattedText) return;
    await navigator.clipboard.writeText(processedResult.formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputJson("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Braces className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                JSON 格式化
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                提供 JSON 语法校验、精准错误定位、树形美化、Key 键排序与极速单行压缩
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleFormat}
              disabled={!processedResult.isValid || !inputJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl shadow-xs shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              格式化美化
            </button>

            <button
              onClick={handleMinify}
              disabled={!processedResult.isValid || !inputJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 disabled:opacity-40 rounded-xl transition-colors cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              压缩单行
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Viewer Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Options */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">缩进空格:</span>
              <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-800">
                {[2, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setIndent(num)}
                    className={`px-2.5 py-0.5 rounded-md font-mono transition-colors ${
                      indent === num
                        ? "bg-indigo-500 text-white font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {num} 格
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sortKeys}
                onChange={(e) => setSortKeys(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>字典序排序 Key</span>
            </label>

            <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={unescapeUnicode}
                onChange={(e) => setUnescapeUnicode(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>解析 Unicode 中文 (\\uXXXX)</span>
            </label>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setInputJson(SAMPLE_JSON)}
              className="px-2.5 py-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              载入示例
            </button>
            <button
              onClick={handleClear}
              className="px-2.5 py-1 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              清空
            </button>
            <button
              onClick={handleCopy}
              disabled={!processedResult.formattedText}
              className="inline-flex items-center gap-1.5 px-3 py-1 font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>复制结果</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="relative min-h-[460px] flex flex-col">
          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder="请在此粘贴或输入需要格式化的 JSON 内容..."
            spellCheck={false}
            className={`flex-1 w-full p-4 font-mono text-xs sm:text-sm bg-transparent outline-none resize-none leading-relaxed select-all ${
              !processedResult.isValid
                ? "text-slate-900 dark:text-slate-100"
                : "text-slate-900 dark:text-slate-100"
            }`}
            rows={18}
          />

          {/* Error Banner */}
          {!processedResult.isValid && processedResult.error && (
            <div className="m-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">JSON 语法格式错误</div>
                <div className="font-mono mt-0.5 break-all">{processedResult.error.message}</div>
                {processedResult.error.line && (
                  <div className="mt-1 text-[11px] text-rose-500/90 font-mono">
                    错误位置大概位于第 {processedResult.error.line} 行
                    {processedResult.error.column ? ` 第 ${processedResult.error.column} 列` : ""}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Statistics */}
        <div className="p-3 px-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            {processedResult.isValid ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-sans font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                语法校验有效
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-500 font-sans font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                格式无效
              </span>
            )}
          </div>

          {processedResult.stats && (
            <div className="flex items-center gap-4 text-[11px]">
              <span>总行数: {processedResult.stats.lines}</span>
              <span>嵌套深度: {processedResult.stats.depth} 层</span>
              <span>总键值对: {processedResult.stats.keysCount}</span>
              <span>大小: {formatFileSize(processedResult.stats.sizeBytes)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
