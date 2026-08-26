import React, { useState, useMemo } from "react";
import {
  analyzeTextStats,
  formatPanguText,
  fullWidthToHalfWidth,
  halfWidthToFullWidthPunctuation,
  TextStats,
} from "./textAnalyzerUtils";
import {
  AlignLeft,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Clock,
  Mic,
  FileText,
  CaseSensitive,
  WrapText,
  Space,
} from "lucide-react";

const SAMPLE_TEXT = `在2026年，在线工具箱提供了超多Pure Frontend纯前端工具！
无论是处理JSON数据、计算Hash（例如MD5或SHA256）、压缩JPG/WebP图片，还是转换Base64文件，都无需任何Backend后端支持。
所有计算100%在浏览器本地完成，响应速度达到0.1s以内，保护数据隐私安全。`;

export default function TextAnalyzer() {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [copied, setCopied] = useState<boolean>(false);

  const stats: TextStats = useMemo(() => {
    return analyzeTextStats(text);
  }, [text]);

  const handlePanguFormat = () => {
    setText(formatPanguText(text));
  };

  const handleFullToHalf = () => {
    setText(fullWidthToHalfWidth(text));
  };

  const handleToFullPunctuation = () => {
    setText(halfWidthToFullWidthPunctuation(text));
  };

  const handleUpperCase = () => {
    setText(text.toUpperCase());
  };

  const handleLowerCase = () => {
    setText(text.toLowerCase());
  };

  const handleClear = () => {
    setText("");
  };

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <AlignLeft className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              字数统计与文本排版
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              实时中英文字数统计、段落阅读时间预估、中英文空格美化（盘古排版）与字符全半角转换
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400">总字符 (含空格)</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {stats.charactersWithSpaces}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400">不含空格字符</div>
          <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            {stats.charactersNoSpaces}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400">中文字数 (汉字)</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {stats.chineseCharacters}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400">英文单词数</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {stats.englishWords}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400">行数 / 段落数</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {stats.linesCount} <span className="text-xs font-normal text-slate-400">/ {stats.paragraphsCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500" />
            预估阅读时长
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {stats.readingTimeMinutes} <span className="text-xs font-normal text-slate-400">分钟</span>
          </div>
        </div>
      </div>

      {/* Editor & Formatting Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        {/* Quick Format Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePanguFormat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer"
              title="在中英文、数字之间自动添加标准排版空格"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              中英文混排加空格 (盘古排版)
            </button>

            <button
              onClick={handleFullToHalf}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
              title="将全角英文字母、数字和符号转为半角"
            >
              全角转半角
            </button>

            <button
              onClick={handleToFullPunctuation}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
              title="将半角标点符号转为中文全角标点"
            >
              中文标点规范化
            </button>

            <button
              onClick={handleUpperCase}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
            >
              转为大写
            </button>

            <button
              onClick={handleLowerCase}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
            >
              转为小写
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleClear}
              className="px-2.5 py-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              清空
            </button>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>复制文本</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          rows={16}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="请在此输入或粘贴需要统计与排版的文本..."
          className="w-full p-5 font-mono text-sm leading-relaxed bg-white dark:bg-slate-900 outline-none resize-y min-h-[300px] text-slate-900 dark:text-slate-100 cursor-text"
        />

        {/* Footer info bar */}
        <div className="p-3 px-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            <span>标点符号: {stats.punctuationCount}</span>
            <span>包含数字: {stats.numbersCount} 组</span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Mic className="w-3.5 h-3.5" />
            <span>朗读演讲时长约 {stats.speakingTimeMinutes} 分钟</span>
          </div>
        </div>
      </div>
    </div>
  );
}
