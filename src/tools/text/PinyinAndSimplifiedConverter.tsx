import React, { useState, useMemo } from "react";
import {
  convertToPinyin,
  convertToTraditional,
  convertToSimplified,
  PinyinToneType,
  PinyinOptions,
} from "./pinyinUtils";
import {
  Languages,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  Sliders,
  Eye,
} from "lucide-react";

type MainMode = "pinyin" | "traditional_to_simplified" | "simplified_to_traditional";

export default function PinyinAndSimplifiedConverter() {
  const sampleChinese = `床前明月光，疑是地上霜。
举头望明月，低头思故乡。
这是一套现代化纯前端在线工具集合。`;

  const [mode, setMode] = useState<MainMode>("pinyin");
  const [inputText, setInputText] = useState<string>(sampleChinese);
  const [toneType, setToneType] = useState<PinyinToneType>("symbol");
  const [separator, setSeparator] = useState<string>(" ");
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const options: PinyinOptions = useMemo(
    () => ({
      toneType,
      separator,
      uppercase,
    }),
    [toneType, separator, uppercase]
  );

  const convertedResult = useMemo(() => {
    if (!inputText.trim()) return "";
    if (mode === "pinyin") {
      return convertToPinyin(inputText, options);
    } else if (mode === "simplified_to_traditional") {
      return convertToTraditional(inputText);
    } else {
      return convertToSimplified(inputText);
    }
  }, [inputText, mode, options]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleSwap = () => {
    if (mode === "simplified_to_traditional") {
      setInputText(convertedResult);
      setMode("traditional_to_simplified");
    } else if (mode === "traditional_to_simplified") {
      setInputText(convertedResult);
      setMode("simplified_to_traditional");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Languages className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                简繁中文与拼音转换
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                简体与繁体中文实时双向互转、带声调汉语拼音生成、首字母缩写与注音排版
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex flex-wrap items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium self-start sm:self-center">
            <button
              onClick={() => setMode("pinyin")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "pinyin"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              汉字转拼音
            </button>
            <button
              onClick={() => setMode("simplified_to_traditional")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "simplified_to_traditional"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              简体转繁体
            </button>
            <button
              onClick={() => setMode("traditional_to_simplified")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "traditional_to_simplified"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              繁体转简体
            </button>
          </div>
        </div>
      </div>

      {/* Pinyin Options Toolbar */}
      {mode === "pinyin" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Tone formats */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">拼音格式:</span>
              {[
                { id: "symbol", label: "声调符号 (zhōng)" },
                { id: "none", label: "无声调 (zhong)" },
                { id: "num", label: "数字声调 (zhong1)" },
                { id: "first_letter", label: "首字母 (z)" },
                { id: "ruby_html", label: "汉字注音 (Ruby)" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setToneType(t.id as any)}
                  className={`px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                    toneType === t.id
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Separators & Uppercase */}
            {toneType !== "ruby_html" && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">分词间隔:</span>
                  {[
                    { val: " ", label: "空格" },
                    { val: "", label: "无间隔" },
                    { val: "-", label: "连字符 (-)" },
                  ].map((sep) => (
                    <button
                      key={sep.label}
                      onClick={() => setSeparator(sep.val)}
                      className={`px-2 py-0.5 rounded-md border text-xs font-medium cursor-pointer ${
                        separator === sep.val
                          ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {sep.label}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={uppercase}
                    onChange={(e) => setUppercase(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">大写拼音</span>
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simplified / Traditional Toolbar */}
      {mode !== "pinyin" && (
        <div className="flex items-center justify-between">
          <button
            onClick={handleSwap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
            <span>对调简繁转换方向</span>
          </button>
        </div>
      )}

      {/* Editor & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {mode === "pinyin"
                ? "原始中文文本"
                : mode === "simplified_to_traditional"
                ? "输入简体中文"
                : "输入繁体中文"}
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setInputText(sampleChinese)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                示例
              </button>
              <button
                onClick={() => setInputText("")}
                className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
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
            placeholder="请在此输入中文汉字..."
            className="flex-1 w-full p-3.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
          />

          <div className="text-[11px] text-slate-400 font-mono">字数: {inputText.length}</div>
        </div>

        {/* Output */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {mode === "pinyin"
                ? "拼音注音结果"
                : mode === "simplified_to_traditional"
                ? "繁体中文结果"
                : "简体中文结果"}
            </label>

            <button
              onClick={() => handleCopy("result", convertedResult)}
              disabled={!convertedResult}
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
                  <span>复制结果</span>
                </>
              )}
            </button>
          </div>

          {toneType === "ruby_html" && mode === "pinyin" ? (
            <div
              className="flex-1 w-full p-6 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white overflow-y-auto leading-loose [&>ruby]:mr-2 [&>ruby>rt]:text-indigo-600 dark:[&>ruby>rt]:text-indigo-400 [&>ruby>rt]:text-xs [&>ruby]:text-lg"
              dangerouslySetInnerHTML={{ __html: convertedResult }}
            />
          ) : (
            <textarea
              rows={14}
              readOnly
              value={convertedResult}
              placeholder="转换结果将实时展现在此处..."
              className="flex-1 w-full p-3.5 font-mono text-sm rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-indigo-950 dark:text-indigo-200 outline-none select-all resize-none leading-relaxed"
            />
          )}

          <div className="text-[11px] text-slate-400 font-mono">
            字数: {convertedResult.length}
          </div>
        </div>
      </div>
    </div>
  );
}
