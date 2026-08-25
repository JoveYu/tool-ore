import React, { useState, useMemo } from "react";
import {
  convertRadix,
  validateRadixInput,
  getRadixName,
  getRadixPrefix,
  RadixItem,
} from "./radixUtils";
import {
  Binary,
  ArrowLeftRight,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Hash,
  Layers,
  Cpu,
} from "lucide-react";

const COMMON_RADIXES = [2, 8, 10, 16, 32, 36, 64];

export default function RadixConverter() {
  const [currentRadix, setCurrentRadix] = useState<number>(10);
  const [inputValue, setInputValue] = useState<string>("1024");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const conversion = useMemo(() => {
    return convertRadix(inputValue, currentRadix, COMMON_RADIXES);
  }, [inputValue, currentRadix]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleClear = () => {
    setInputValue("");
  };

  const handleSetRowAsInput = (radix: number, value: string) => {
    setCurrentRadix(radix);
    setInputValue(value);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              进制转换
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              支持 2、8、10、16、32、36、64 进制任意数值高精度大数互转，支持负数与位长分析
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Input Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        {/* Radix Switcher Tabs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              当前输入进制
            </label>
            {inputValue && (
              <button
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                清空输入
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { r: 2, label: "二进制 (2)" },
              { r: 8, label: "八进制 (8)" },
              { r: 10, label: "十进制 (10)" },
              { r: 16, label: "十六进制 (16)" },
              { r: 32, label: "三十二进制 (32)" },
              { r: 36, label: "三十六进制 (36)" },
              { r: 64, label: "六十四进制 (64)" },
            ].map((item) => (
              <button
                key={item.r}
                onClick={() => setCurrentRadix(item.r)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  currentRadix === item.r
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Text Box */}
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`请输入 ${getRadixName(currentRadix)} 数值...`}
              className={`w-full px-4 py-3.5 text-base sm:text-lg font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800/60 border transition-all outline-none ${
                !conversion.isValid
                  ? "border-rose-300 dark:border-rose-800 focus:ring-2 focus:ring-rose-500/20 text-rose-600 dark:text-rose-400"
                  : "border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              }`}
            />
          </div>

          {/* Error Prompt */}
          {!conversion.isValid && (
            <div className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{conversion.error}</span>
            </div>
          )}
        </div>

        {/* Bit Length Summary */}
        {conversion.isValid && inputValue.trim() && conversion.bitLength !== undefined && (
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              二进制位宽: <strong className="text-slate-800 dark:text-slate-200">{conversion.bitLength} Bits</strong>
            </span>
            <span>
              占用字节: <strong className="text-slate-800 dark:text-slate-200">{conversion.byteCount} Bytes</strong>
            </span>
          </div>
        )}
      </div>

      {/* Conversion Output Results Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <span>各进制实时转换结果</span>
          <span className="text-[11px] text-slate-400 font-normal font-sans">
            点击结果行可直接设为输入
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs">
          {conversion.results.map((item: RadixItem) => {
            const isCurrent = item.radix === currentRadix;

            return (
              <div
                key={item.radix}
                className={`p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isCurrent
                    ? "bg-indigo-50/40 dark:bg-indigo-950/20"
                    : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                }`}
              >
                {/* Radix Badge & Name */}
                <div className="flex items-center gap-2.5 w-48 shrink-0">
                  <span
                    className={`w-8 h-6 rounded-lg text-center flex items-center justify-center text-[11px] font-bold ${
                      isCurrent
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {item.radix}
                  </span>
                  <span className="font-sans font-semibold text-slate-800 dark:text-slate-200">
                    {item.name}
                  </span>
                </div>

                {/* Converted Value Output */}
                <div className="flex-1 font-bold text-sm text-indigo-950 dark:text-indigo-200 select-all break-all leading-relaxed">
                  {item.prefix && item.value ? (
                    <span className="text-slate-400 dark:text-slate-500 font-normal mr-0.5">
                      {item.prefix}
                    </span>
                  ) : null}
                  {item.value || (
                    <span className="text-slate-300 dark:text-slate-600 font-normal text-xs italic">
                      等待输入...
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 font-sans self-end sm:self-center">
                  {!isCurrent && item.value && (
                    <button
                      onClick={() => handleSetRowAsInput(item.radix, item.value)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="以此进制继续运算"
                    >
                      设为输入
                    </button>
                  )}

                  {item.value && (
                    <button
                      onClick={() => handleCopy(`radix-${item.radix}`, item.value)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer shadow-2xs"
                    >
                      {copiedKey === `radix-${item.radix}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">
                            已复制
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span className="text-[11px]">复制</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
