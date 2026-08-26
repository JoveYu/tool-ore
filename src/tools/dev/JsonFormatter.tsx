import React, { useState, useMemo } from "react";
import { formatJson, minifyJson, JsonFormatOptions } from "./jsonUtils";
import { formatFileSize } from "../image/imageUtils";
import { CodeViewer } from "../../components/CodeViewer";
import {
  Braces,
  Copy,
  Check,
  RotateCcw,
  Minimize2,
  Maximize2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Download,
} from "lucide-react";

const SAMPLE_JSON = `{
  "name": "在线工具",
  "version": "1.0.0",
  "features": [
    "大写金额转换",
    "图片压缩与格式转换",
    "颜色拾取器",
    "Base64 编解码",
    "哈希散列计算",
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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownload = () => {
    if (!processedResult.formattedText) return;
    const blob = new Blob([processedResult.formattedText], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `formatted_${Date.now()}.json`;
    a.click();
  };

  const handleClear = () => {
    setInputJson("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
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
      </div>

      {/* Options & Config Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">缩进空格:</span>
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-800">
              {[2, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => setIndent(num)}
                  className={`px-2.5 py-0.5 rounded-md font-mono transition-colors cursor-pointer ${
                    indent === num
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                  }`}
                >
                  {num} 格
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(e) => setSortKeys(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span>字典序排序 Key</span>
          </label>

          <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={unescapeUnicode}
              onChange={(e) => setUnescapeUnicode(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span>解析 Unicode 中文 (\\uXXXX)</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFormat}
            disabled={!processedResult.isValid || !inputJson.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>格式化美化</span>
          </button>
          <button
            onClick={handleMinify}
            disabled={!processedResult.isValid || !inputJson.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 disabled:opacity-40 rounded-xl transition-colors cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>压缩单行</span>
          </button>
        </div>
      </div>

      {/* 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Textarea */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              原始 JSON 输入区
            </label>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setInputJson(SAMPLE_JSON)}
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <Sparkles className="w-3 h-3" />
                <span>载入示例</span>
              </button>
              <button
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>清空</span>
              </button>
            </div>
          </div>

          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder="请在此粘贴或输入需要格式化的 JSON 内容..."
            spellCheck={false}
            className="flex-1 w-full min-h-[380px] p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
            rows={18}
          />

          {/* Error Banner */}
          {!processedResult.isValid && inputJson.trim() && processedResult.error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 shadow-xs">
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

          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1">
            <span>字符数: {inputJson.length}</span>
            <span>大小: {formatFileSize(new Blob([inputJson]).size)}</span>
          </div>
        </div>

        {/* Right: Formatted Highlighted Output */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              格式化排版结果
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={!processedResult.formattedText}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                title="下载 JSON 文件"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载</span>
              </button>

              <button
                onClick={() => handleCopy("result", processedResult.formattedText || "")}
                disabled={!processedResult.formattedText}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-xs transition-colors cursor-pointer"
              >
                {copiedKey === "result" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>复制 JSON</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <CodeViewer
              code={processedResult.formattedText || inputJson}
              language="json"
              maxHeight="380px"
              placeholder="格式化后的 JSON 将实时呈现在此处..."
            />
          </div>

          {/* Footer Statistics */}
          <div className="text-[11px] text-slate-400 flex flex-wrap items-center justify-between pt-1 font-mono">
            {processedResult.isValid ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-sans font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                语法有效
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-500 font-sans font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                语法无效
              </span>
            )}

            {processedResult.stats && (
              <div className="flex items-center gap-3">
                <span>{processedResult.stats.lines} 行</span>
                <span>深度: {processedResult.stats.depth} 层</span>
                <span>{processedResult.stats.keysCount} 个键值</span>
                <span>{formatFileSize(processedResult.stats.sizeBytes)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
