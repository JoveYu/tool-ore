import React, { useState, useMemo } from "react";
import { testRegex, REGEX_PRESETS, RegexPreset } from "./regexUtils";
import {
  Regex,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  Layers,
  Replace,
  Split,
  Eye,
} from "lucide-react";

export default function RegexTester() {
  const [pattern, setPattern] = useState<string>("\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\b");
  const [flags, setFlags] = useState<{ [key: string]: boolean }>({
    g: true,
    i: true,
    m: false,
    s: false,
    u: false,
  });

  const [testText, setTestText] = useState<string>(
    "欢迎使用在线工具！如有建议可联系 support@example.com 或 dev_team@gmail.com。"
  );
  const [replacePattern, setReplacePattern] = useState<string>("[$&]");
  const [showReplace, setShowReplace] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Flags string
  const flagsString = useMemo(() => {
    return Object.keys(flags)
      .filter((k) => flags[k])
      .join("");
  }, [flags]);

  // Test Results
  const result = useMemo(() => {
    return testRegex(pattern, flagsString, testText, showReplace ? replacePattern : undefined);
  }, [pattern, flagsString, testText, showReplace, replacePattern]);

  const handleFlagToggle = (f: string) => {
    setFlags((prev) => ({ ...prev, [f]: !prev[f] }));
  };

  const handleApplyPreset = (preset: RegexPreset) => {
    setPattern(preset.pattern);
    setTestText(preset.sample);

    const newFlags: { [key: string]: boolean } = {
      g: preset.flags.includes("g"),
      i: preset.flags.includes("i"),
      m: preset.flags.includes("m"),
      s: preset.flags.includes("s"),
      u: preset.flags.includes("u"),
    };
    setFlags(newFlags);
  };

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleClear = () => {
    setTestText("");
  };

  // Render Highlighted Text
  const renderedHighlight = useMemo(() => {
    if (!result.isValid || result.matches.length === 0 || !testText) {
      return <span>{testText || "请输入测试文本..."}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    result.matches.forEach((m, idx) => {
      // Normal text before match
      if (m.start > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>{testText.slice(lastIndex, m.start)}</span>
        );
      }

      // Highlighted match
      elements.push(
        <mark
          key={`match-${idx}`}
          className="bg-amber-200 dark:bg-amber-900/80 text-amber-950 dark:text-amber-100 rounded-xs px-0.5 font-bold shadow-2xs"
          title={`Match #${idx + 1}: ${m.match}`}
        >
          {m.match}
        </mark>
      );

      lastIndex = m.end;
    });

    // Remainder text
    if (lastIndex < testText.length) {
      elements.push(
        <span key="text-end">{testText.slice(lastIndex)}</span>
      );
    }

    return elements;
  }, [result, testText]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Regex className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                正则表达式测试器
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                实时匹配高亮、捕获组分析、正则替换与常用常用正则表达式库
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Library Drawer/Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <Bookmark className="w-4 h-4 text-indigo-500" />
          <span>常用正则表达式库</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {REGEX_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleApplyPreset(preset)}
              className="p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/70 hover:border-indigo-400 dark:hover:bg-indigo-950/40 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {preset.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  /{preset.flags}/
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Pattern Input & Flags */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            正则表达式
          </label>
          <button
            onClick={() => handleCopy("regex", `/${pattern}/${flagsString}`)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            {copiedKey === "regex" ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            复制完整正则
          </button>
        </div>

        {/* Pattern input bar */}
        <div className="flex items-center rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 overflow-hidden">
          <span className="px-3.5 text-base font-mono font-bold text-slate-400 dark:text-slate-500 select-none">
            /
          </span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="输入正则表达式 (无需输入两侧斜杠)..."
            className="flex-1 py-3 text-sm font-mono text-slate-900 dark:text-white bg-transparent outline-none"
          />
          <span className="px-2 text-base font-mono font-bold text-slate-400 dark:text-slate-500 select-none">
            /
          </span>
          <span className="pr-3 text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 select-none min-w-8">
            {flagsString}
          </span>
        </div>

        {/* Flags Selector */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <span className="text-slate-400 text-xs">修饰符 Flags:</span>
          {[
            { id: "g", label: "g (全局匹配 global)" },
            { id: "i", label: "i (忽略大小写 ignoreCase)" },
            { id: "m", label: "m (多行模式 multiline)" },
            { id: "s", label: "s (点号匹配全字符 dotAll)" },
            { id: "u", label: "u (Unicode 完整编码)" },
          ].map((f) => (
            <label
              key={f.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                flags[f.id]
                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <input
                type="checkbox"
                checked={!!flags[f.id]}
                onChange={() => handleFlagToggle(f.id)}
                className="hidden"
              />
              <span>{f.label}</span>
            </label>
          ))}
        </div>

        {/* Syntax Error */}
        {!result.isValid && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{result.error}</span>
          </div>
        )}
      </div>

      {/* Test Area (Input & Live Highlight) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Text Input */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              测试文本
            </label>
            <button
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              清空文本
            </button>
          </div>

          <textarea
            rows={10}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="请在此输入待匹配测试的文本..."
            className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>字符数: {testText.length}</span>
            <span>行数: {testText.split("\n").length}</span>
          </div>
        </div>

        {/* Live Highlight & Matches */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-500" />
              <span>实时匹配高亮</span>
            </label>

            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              {result.matchCount} 处匹配
            </span>
          </div>

          <div className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 overflow-y-auto max-h-[220px] whitespace-pre-wrap select-all leading-relaxed">
            {renderedHighlight}
          </div>

          {/* Matches Breakdown */}
          {result.matches.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase">
                捕获明细列表 ({result.matches.length})
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {result.matches.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs font-mono flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold mr-2">
                        #{idx + 1}
                      </span>
                      <span className="text-slate-900 dark:text-white font-semibold">
                        {m.match}
                      </span>
                      {m.groups.length > 0 && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          捕获组: [{m.groups.map((g, gi) => `$${gi + 1}: "${g}"`).join(", ")}]
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-sans">
                      位置: {m.start}-{m.end}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replace Testing Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Replace className="w-4 h-4 text-indigo-500" />
            <span>正则替换测试</span>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showReplace}
              onChange={(e) => setShowReplace(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>启用替换预览</span>
          </label>
        </div>

        {showReplace && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={replacePattern}
                  onChange={(e) => setReplacePattern(e.target.value)}
                  placeholder="输入替换字符，支持 $& (完整匹配)、$1、$2 (捕获组)..."
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {result.replacedText !== undefined && (
                <button
                  onClick={() => handleCopy("replace", result.replacedText || "")}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  {copiedKey === "replace" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>已复制替换结果</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制替换结果</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 font-mono text-xs text-slate-900 dark:text-slate-100 select-all whitespace-pre-wrap max-h-40 overflow-y-auto">
              {result.replacedText || testText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
