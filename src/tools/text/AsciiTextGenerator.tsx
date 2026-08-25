import React, { useState, useMemo } from "react";
import {
  generateAsciiBanner,
  ASCII_FONTS,
  AsciiFont,
  CommentWrapperType,
} from "./asciiUtils";
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Type,
  Code2,
} from "lucide-react";

export default function AsciiTextGenerator() {
  const [inputText, setInputText] = useState<string>("Tool-Ore");
  const [font, setFont] = useState<AsciiFont>("Standard");
  const [wrapper, setWrapper] = useState<CommentWrapperType>("none");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const bannerResult = useMemo(
    () => generateAsciiBanner(inputText, font, wrapper),
    [inputText, font, wrapper]
  );

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const sampleTexts = ["TOOL-ORE", "API SERVER", "SUCCESS", "WELCOME", "HELLO 2026"];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Type className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              ASCII 艺术字 Banner 生成器
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              将英文字符转换为大型 ASCII 字符画横幅，支持代码头注释封装（JS/Python/SQL）
            </p>
          </div>
        </div>
      </div>

      {/* Input & Quick Presets */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            输入英文单词或短语
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInputText("")}
              className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              清空
            </button>
          </div>
        </div>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="例如: TOOL-ORE, SERVER..."
          className="w-full px-4 py-3 font-mono text-lg font-bold rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 tracking-wider"
        />

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400">快速示例:</span>
          {sampleTexts.map((s) => (
            <button
              key={s}
              onClick={() => setInputText(s)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Font & Wrapper Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Font Picker */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            艺术字体风格
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {ASCII_FONTS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFont(f.id)}
                className={`px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                  font === f.id
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        {/* Comment Wrapper */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            代码注释包装模式
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { id: "none", label: "无包装 (纯 ASCII)" },
              { id: "js_block", label: "JS / TS / C++ 块注释 (/** */)" },
              { id: "hash", label: "Python / Shell 注释 (#)" },
              { id: "sql", label: "SQL 脚本注释 (--)" },
              { id: "html", label: "HTML 注释 (<!-- -->)" },
            ].map((w) => (
              <button
                key={w.id}
                onClick={() => setWrapper(w.id as any)}
                className={`px-3 py-1.5 rounded-xl border font-medium transition-all cursor-pointer ${
                  wrapper === w.id
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Output Display Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            生成结果预览
          </span>

          <button
            onClick={() => handleCopy("banner", bannerResult)}
            disabled={!bannerResult}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-xs transition-colors cursor-pointer"
          >
            {copiedKey === "banner" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>已复制字符画</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>复制字符画</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-6 rounded-2xl bg-slate-950 text-indigo-300 font-mono text-xs leading-none overflow-x-auto select-all shadow-inner whitespace-pre font-bold">
          {bannerResult || "请输入英文字符生成 ASCII 字符画"}
        </pre>
      </div>
    </div>
  );
}
