import React, { useState } from "react";
import { convertToChineseCurrency } from "./currencyConverter";
import { Copy, Check, RotateCcw, AlertCircle, Coins } from "lucide-react";

const PRESET_AMOUNTS = [
  "100",
  "1024.50",
  "8888.88",
  "100050.20",
  "1000000",
  "123456789.98",
];

export default function CurrencyToChinese() {
  const [inputAmount, setInputAmount] = useState<string>("123456.78");
  const [copied, setCopied] = useState<boolean>(false);

  const { result, error, formattedAmount } = convertToChineseCurrency(inputAmount);

  const handleCopy = async (text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputAmount("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                人民币大写金额转换
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                将数字金额快速转换为标准财务规范的人民币大写汉字（壹、贰、叁、肆、万、仟、佰、拾等）
              </p>
            </div>
          </div>
          <span className="self-start sm:self-center inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
            财务规范
          </span>
        </div>
      </div>

      {/* Main Converter Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Input section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="amount-input"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              输入阿拉伯数字金额 (¥)
            </label>
            {inputAmount && (
              <button
                onClick={handleClear}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                清空输入
              </button>
            )}
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400 dark:text-slate-500">
              ¥
            </span>
            <input
              id="amount-input"
              type="text"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="例如: 123456.78"
              className={`w-full pl-9 pr-4 py-3.5 text-lg font-mono rounded-xl bg-slate-50 dark:bg-slate-800/50 border transition-all outline-none ${
                error
                  ? "border-rose-300 dark:border-rose-800 focus:ring-2 focus:ring-rose-500/30"
                  : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
              }`}
            />
          </div>

          {error ? (
            <div className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400 mt-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : formattedAmount ? (
            <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              千分位格式: {formattedAmount}
            </div>
          ) : null}
        </div>

        {/* Quick Amount Presets */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            快捷示例金额：
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_AMOUNTS.map((val) => (
              <button
                key={val}
                onClick={() => setInputAmount(val)}
                className="px-2.5 py-1 text-xs rounded-lg font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
              >
                ¥{val}
              </button>
            ))}
          </div>
        </div>

        {/* Result Output Card */}
        <div className="pt-2">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50/50 via-slate-50 to-slate-100/50 dark:from-indigo-950/20 dark:via-slate-900/40 dark:to-slate-800/40 border border-indigo-100/80 dark:border-indigo-900/30 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                大写汉字结果
              </span>
              {result && (
                <button
                  onClick={() => handleCopy(result)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-xs transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>复制大写</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="min-h-16 flex items-center">
              {result ? (
                <div className="text-xl sm:text-2xl font-bold tracking-wide text-slate-900 dark:text-white select-all break-all leading-relaxed">
                  {result}
                </div>
              ) : (
                <div className="text-sm text-slate-400 dark:text-slate-500 italic">
                  请输入金额以查看大写转换结果...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reference Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          数字大写汉字对照参考表
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {[
            { n: "0", zh: "零" },
            { n: "1", zh: "壹" },
            { n: "2", zh: "贰" },
            { n: "3", zh: "叁" },
            { n: "4", zh: "肆" },
            { n: "5", zh: "伍" },
            { n: "6", zh: "陆" },
            { n: "7", zh: "柒" },
            { n: "8", zh: "捌" },
            { n: "9", zh: "玖" },
          ].map((item) => (
            <div
              key={item.n}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 font-mono"
            >
              <span className="text-slate-400 dark:text-slate-500">{item.n}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {item.zh}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
