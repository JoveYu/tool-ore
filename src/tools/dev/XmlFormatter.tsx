import React, { useState, useMemo } from "react";
import { formatXml, minifyXml, XmlFormatResult } from "./xmlUtils";
import {
  CodeXml,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileCode,
} from "lucide-react";

export default function XmlFormatter() {
  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<configuration xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <!-- 服务端基本属性设置 -->
  <server id="tool-ore" port="8080" active="true">
    <host>0.0.0.0</host>
    <ssl enabled="true">
      <certificate>/etc/ssl/cert.pem</certificate>
    </ssl>
  </server>
  <database>
    <driver>org.postgresql.Driver</driver>
    <url>jdbc:postgresql://localhost:5432/tool_ore_db</url>
    <pool maxActive="20" minIdle="5"/>
  </database>
</configuration>`;

  const [inputXml, setInputXml] = useState<string>(sampleXml);
  const [indent, setIndent] = useState<number>(2);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const formattedResult: XmlFormatResult = useMemo(
    () => formatXml(inputXml, indent),
    [inputXml, indent]
  );

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleMinify = () => {
    if (inputXml.trim()) {
      const min = minifyXml(inputXml);
      setInputXml(min);
    }
  };

  const handleDownload = () => {
    if (!formattedResult.result) return;
    const blob = new Blob([formattedResult.result], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formatted_${Date.now()}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <CodeXml className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              XML 格式化与语法校验
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              XML 树状节点换行缩进排版美化、DOMParser 语法错误精准定位与单行压缩
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar Options */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Indent Options */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700 dark:text-slate-300">缩进空格:</span>
            {[2, 4].map((ind) => (
              <button
                key={ind}
                onClick={() => setIndent(ind)}
                className={`px-3 py-1 rounded-lg border font-mono font-bold transition-all cursor-pointer ${
                  indent === ind
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {ind} 空格
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMinify}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer shadow-2xs"
            >
              <span>单行压缩 Minify</span>
            </button>

            <button
              onClick={() => setInputXml(sampleXml)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>载入示例</span>
            </button>

            <button
              onClick={() => setInputXml("")}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>清空</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              原始 XML 文本输入
            </label>

            <span className="text-[11px] text-slate-400 font-mono">
              {inputXml.length} 字符 · {inputXml ? inputXml.split("\n").length : 0} 行
            </span>
          </div>

          <textarea
            rows={16}
            value={inputXml}
            onChange={(e) => setInputXml(e.target.value)}
            placeholder="请在此输入或粘贴 XML 源码..."
            className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
          />

          {!formattedResult.isValid && formattedResult.error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>XML 语法校验错误</span>
              </div>
              <div className="break-all font-mono text-[11px]">
                {formattedResult.error.message}
              </div>
              {formattedResult.error.line && (
                <div className="text-[11px] font-mono mt-0.5">
                  错误大概位于第 {formattedResult.error.line} 行
                  {formattedResult.error.column ? ` 第 ${formattedResult.error.column} 列` : ""}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Output */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              格式化排版结果
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={!formattedResult.result}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                title="下载 XML 文件"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载</span>
              </button>

              <button
                onClick={() => handleCopy("result", formattedResult.result)}
                disabled={!formattedResult.result}
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
                    <span>复制 XML</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <textarea
            rows={16}
            readOnly
            value={formattedResult.result}
            placeholder="美化后的 XML 将实时呈现在此处..."
            className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-indigo-950 dark:text-indigo-200 outline-none select-all resize-none leading-relaxed"
          />

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 font-mono">
            {formattedResult.isValid ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-sans font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                XML 语法有效
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-500 font-sans font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                语法有误
              </span>
            )}

            {formattedResult.stats && (
              <div className="flex items-center gap-3 text-[11px]">
                <span>标签数: {formattedResult.stats.nodesCount}</span>
                <span>行数: {formattedResult.stats.lines}</span>
                <span>大小: {formatFileSize(formattedResult.stats.sizeBytes)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
