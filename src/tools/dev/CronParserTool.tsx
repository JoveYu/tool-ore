import React, { useState, useMemo } from "react";
import {
  parseCronExpression,
  COMMON_CRON_PRESETS,
  CronPreset,
} from "./cronUtils";
import {
  Timer,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Calendar,
  Clock,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

export default function CronParserTool() {
  const [expression, setExpression] = useState<string>("0 9-18 * * 1-5");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const parsed = useMemo(() => parseCronExpression(expression), [expression]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleApplyPreset = (preset: CronPreset) => {
    setExpression(preset.expression);
  };

  const parts = expression.trim().split(/\s+/);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Cron 表达式解析与生成
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Cron 定时任务表达式中文语义翻译、未来多次执行时间点推演与常用规则速查
            </p>
          </div>
        </div>
      </div>

      {/* Main Expression Input Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            输入 Cron 定时任务表达式 (5 位或 6 位)
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy("expr", expression)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === "expr" ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              复制表达式
            </button>

            <button
              onClick={() => setExpression("")}
              className="text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              清空
            </button>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="例如: */5 * * * * 或 0 0 1 * *"
            className="w-full px-4 py-3.5 font-mono text-lg font-bold rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 tracking-wider"
          />
        </div>

        {/* Semantic Natural Language Card */}
        {parsed.isValid ? (
          <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <span className="text-[11px] text-indigo-500 font-medium block">
                  自然语言执行逻辑翻译
                </span>
                <span className="text-sm sm:text-base font-bold text-indigo-950 dark:text-indigo-200">
                  {parsed.chineseExplanation}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleCopy("expl", parsed.chineseExplanation)}
              className="self-start sm:self-center inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              {copiedKey === "expl" ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              复制释义
            </button>
          </div>
        ) : (
          expression.trim() && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parsed.error}</span>
            </div>
          )
        )}

        {/* Parts breakdown boxes */}
        {parsed.isValid && (
          <div className="pt-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase pb-2">
              字段结构分解 ({parts.length} 个字段)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-6 gap-2 text-center text-xs font-mono">
              {parsed.hasSeconds && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 font-sans block">秒 (0-59)</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    {parts[0]}
                  </span>
                </div>
              )}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-sans block">分 (0-59)</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  {parsed.hasSeconds ? parts[1] : parts[0]}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-sans block">时 (0-23)</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  {parsed.hasSeconds ? parts[2] : parts[1]}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-sans block">日 (1-31)</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  {parsed.hasSeconds ? parts[3] : parts[2]}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-sans block">月 (1-12)</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  {parsed.hasSeconds ? parts[4] : parts[3]}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-sans block">周 (0-6 / 1-7)</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  {parsed.hasSeconds ? parts[5] : parts[4]}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next Executions & Presets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Executions List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>未来 5 次执行时间点预估</span>
          </div>

          {parsed.isValid && parsed.nextExecutions.length > 0 ? (
            <div className="space-y-2 font-mono text-xs">
              {parsed.nextExecutions.map((timeStr, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{timeStr}</span>
                  </div>

                  <button
                    onClick={() => handleCopy(`time_${idx}`, timeStr)}
                    className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                    title="复制时间"
                  >
                    {copiedKey === `time_${idx}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              请输入合法的 Cron 表达式以推演未来执行时间
            </div>
          )}
        </div>

        {/* Common Presets Library */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>常用规则预设库</span>
          </div>

          <div className="space-y-2">
            {COMMON_CRON_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleApplyPreset(preset)}
                className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 hover:bg-slate-100/70 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {preset.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{preset.description}</div>
                </div>

                <span className="font-mono text-xs font-bold px-2 py-1 rounded-lg bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 shrink-0">
                  {preset.expression}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
