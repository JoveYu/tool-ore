import React, { useState, useMemo } from "react";
import {
  detectSensitiveWords,
  WordCategory,
  SensitiveWordResult,
} from "./sensitiveWordUtils";
import {
  ShieldAlert,
  ShieldCheck,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  Eye,
  AlertTriangle,
  FileText,
  Plus,
} from "lucide-react";

export default function SensitiveWordFilter() {
  const sampleText = `欢迎选购我们的商品！这是全国第一名的全能顶级产品，效果绝无仅有，100%包治百病，纯天然无任何副作用。
如需批发或代理，请加微信了解，支持代开发票与高额返利，日赚千元不是梦！
如果对服务不满意，千万别骂人说脏话。`;

  const [inputText, setInputText] = useState<string>(sampleText);
  const [enableAdLaw, setEnableAdLaw] = useState<boolean>(true);
  const [enableSpam, setEnableSpam] = useState<boolean>(true);
  const [enableProfanity, setEnableProfanity] = useState<boolean>(true);
  const [customWordsInput, setCustomWordsInput] = useState<string>("");
  const [replaceChar, setReplaceChar] = useState<string>("*");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const customWords = useMemo(() => {
    return customWordsInput
      .split(/[,，\n\s]+/)
      .map((w) => w.trim())
      .filter(Boolean);
  }, [customWordsInput]);

  const categories: Record<WordCategory, boolean> = useMemo(
    () => ({
      ad_law: enableAdLaw,
      spam_marketing: enableSpam,
      profanity: enableProfanity,
    }),
    [enableAdLaw, enableSpam, enableProfanity]
  );

  const result: SensitiveWordResult = useMemo(
    () => detectSensitiveWords(inputText, categories, customWords, replaceChar),
    [inputText, categories, customWords, replaceChar]
  );

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              文本违禁词与敏感词检测
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              纯本地离线检测广告法极限词、违规营销引流词与低俗词汇，支持高亮标注与一键脱敏替换
            </p>
          </div>
        </div>
      </div>

      {/* Detection Result Summary Banner */}
      <div
        className={`p-5 rounded-2xl border flex items-center justify-between gap-4 shadow-xs transition-all ${
          result.hasSensitiveWord
            ? "bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200"
            : "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200"
        }`}
      >
        <div className="flex items-center gap-3.5">
          {result.hasSensitiveWord ? (
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
          )}

          <div>
            <div className="font-bold text-sm">
              {result.hasSensitiveWord
                ? `检测发现 ${result.matchedWords.length} 类敏感词（累计出现 ${result.totalMatches} 处）`
                : "文本内容健康安全，未检出违规与敏感词汇"}
            </div>
            <p className="text-xs opacity-85 mt-0.5">
              {result.hasSensitiveWord
                ? "建议根据下方高亮提示修改文案或直接复制脱敏过滤后的文本"
                : "当前文案符合常规广告法规范与内容发布标准"}
            </p>
          </div>
        </div>

        {result.hasSensitiveWord && (
          <button
            onClick={() => handleCopy("filtered", result.filteredText)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            {copiedKey === "filtered" ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>已复制脱敏文本</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>复制脱敏文本</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Dictionary Settings & Options */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <span>检测词库分类与自定义规则</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enableAdLaw}
              onChange={(e) => setEnableAdLaw(e.target.checked)}
              className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                广告法极限词库
              </span>
              <span className="text-[11px] text-slate-400">第一名、顶级、纯天然、百分之百等</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enableSpam}
              onChange={(e) => setEnableSpam(e.target.checked)}
              className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                引流与违规营销词
              </span>
              <span className="text-[11px] text-slate-400">加微信、代开发票、刷单、高额返利等</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enableProfanity}
              onChange={(e) => setEnableProfanity(e.target.checked)}
              className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                低俗与辱骂词库
              </span>
              <span className="text-[11px] text-slate-400">网络粗俗用语、人身攻击词汇</span>
            </div>
          </label>
        </div>

        {/* Custom keywords input */}
        <div className="space-y-1.5 pt-1 text-xs">
          <label className="font-medium text-slate-700 dark:text-slate-300">
            自定义敏感词库 (以逗号、空格或换行分隔)
          </label>
          <input
            type="text"
            value={customWordsInput}
            onChange={(e) => setCustomWordsInput(e.target.value)}
            placeholder="例如: 内部渠道, 私信, 赠送课程..."
            className="w-full px-3.5 py-2 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
          />
        </div>
      </div>

      {/* Editor & Live Highlight Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              待检测文案内容
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setInputText(sampleText)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-sans"
              >
                <Sparkles className="w-3.5 h-3.5" />
                重置示例
              </button>
              <button
                onClick={() => setInputText("")}
                className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer font-sans"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                清空
              </button>
            </div>
          </div>

          <textarea
            rows={14}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="请在此输入或粘贴需要检测的文案..."
            className="flex-1 w-full p-3.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 leading-relaxed"
          />

          <div className="text-[11px] text-slate-400 font-mono">
            总字数: {inputText.length} 字符
          </div>
        </div>

        {/* Right: Visual Highlight & Hit List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-rose-500" />
                <span>违规词实时高亮标注</span>
              </label>

              {result.hasSensitiveWord && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                  {result.matchedWords.length} 个违禁词
                </span>
              )}
            </div>

            {/* Rendered Visual Highlight Box */}
            <div
              className="w-full p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs leading-relaxed overflow-y-auto max-h-[300px] whitespace-pre-wrap select-all"
              dangerouslySetInnerHTML={{
                __html: result.highlightedHtml || "（请输入文案查看检测高亮结果）",
              }}
            />

            {/* Matched Words Badges Breakdown */}
            {result.matchedWords.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">
                  命中敏感词清单:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedWords.map((word) => (
                    <span
                      key={word}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1"
                    >
                      <span>{word}</span>
                      <span className="text-[10px] font-normal opacity-80">
                        ×{result.wordCounts[word] || 1}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleCopy("filtered_btn", result.filteredText)}
              disabled={!result.filteredText}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedKey === "filtered_btn" ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>已复制脱敏过滤后的文本</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>一键复制脱敏文本 (隐藏违禁词)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
