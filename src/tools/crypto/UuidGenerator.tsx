import React, { useState, useEffect, useMemo } from "react";
import {
  IdType,
  GenerateIdOptions,
  generateBatchIds,
  formatIdListOutput,
} from "./uuidUtils";
import {
  Fingerprint,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Download,
  Trash2,
  Sparkles,
  Settings,
} from "lucide-react";

export default function UuidGenerator() {
  const [type, setType] = useState<IdType>("uuid_v4");
  const [quantity, setQuantity] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [nanoidLength, setNanoidLength] = useState<number>(21);
  const [nanoidAlphabet, setNanoidAlphabet] = useState<string>("");
  const [prefix, setPrefix] = useState<string>("");
  const [suffix, setSuffix] = useState<string>("");
  const [quoteType, setQuoteType] = useState<"none" | "single" | "double">("none");
  const [separator, setSeparator] = useState<"newline" | "comma" | "json_array" | "sql_in">("newline");

  const [idList, setIdList] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const options: GenerateIdOptions = useMemo(
    () => ({
      type,
      quantity,
      uppercase,
      hyphens,
      nanoidLength,
      nanoidAlphabet,
      prefix,
      suffix,
      quoteType,
      separator,
    }),
    [
      type,
      quantity,
      uppercase,
      hyphens,
      nanoidLength,
      nanoidAlphabet,
      prefix,
      suffix,
      quoteType,
      separator,
    ]
  );

  const handleGenerate = () => {
    const list = generateBatchIds(options);
    setIdList(list);
  };

  useEffect(() => {
    handleGenerate();
  }, [type, quantity, uppercase, hyphens, nanoidLength, nanoidAlphabet, prefix, suffix]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const formattedOutput = useMemo(
    () => formatIdListOutput(idList, separator, quoteType),
    [idList, separator, quoteType]
  );

  const handleDownload = () => {
    if (!formattedOutput) return;
    const blob = new Blob([formattedOutput], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_generated_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const firstId = idList[0] || "";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              UUID 与 NanoID 生成器
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              批量生成 UUID v4/v1、NanoID、ULID 等唯一标识符，支持大小写、前后缀与 SQL/JSON 导出
            </p>
          </div>
        </div>
      </div>

      {/* Hero Featured First ID Card */}
      {firstId && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              当前主生成结果
            </span>
            <span className="text-xs font-mono text-slate-400">长度: {firstId.length} 字符</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 gap-3">
            <div className="font-mono text-base sm:text-lg font-bold tracking-wider text-indigo-600 dark:text-indigo-400 break-all select-all flex-1">
              {firstId}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleGenerate}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                title="重新生成"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleCopy("first_id", firstId)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer text-xs"
              >
                {copiedKey === "first_id" ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>复制主 ID</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Settings & Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <span>生成参数配置</span>
          </div>

          {/* Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              标识符类型
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: "uuid_v4", label: "UUID v4 (随机)" },
                { id: "uuid_v1", label: "UUID v1 (时间戳)" },
                { id: "nanoid", label: "NanoID (轻量)" },
                { id: "ulid", label: "ULID (字典序)" },
                { id: "short_id", label: "短 ID (10位)" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id as IdType)}
                  className={`py-2 px-1 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                    type === t.id
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">批量生成数量</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {quantity} 条
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* NanoID custom settings */}
          {type === "nanoid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  NanoID 长度 ({nanoidLength})
                </label>
                <input
                  type="number"
                  min="6"
                  max="128"
                  value={nanoidLength}
                  onChange={(e) => setNanoidLength(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  自定义字符集 (可选)
                </label>
                <input
                  type="text"
                  value={nanoidAlphabet}
                  onChange={(e) => setNanoidAlphabet(e.target.value)}
                  placeholder="默认 A-Za-z0-9_-"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>
          )}

          {/* Prefix & Suffix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                添加前缀 Prefix (可选)
              </label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="例如: usr_, order_..."
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                添加后缀 Suffix (可选)
              </label>
              <input
                type="text"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                placeholder="例如: _prod, _v1..."
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-4 pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">转换为大写字母</span>
            </label>

            {(type === "uuid_v4" || type === "uuid_v1") && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hyphens}
                  onChange={(e) => setHyphens(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">包含连字符（-）</span>
              </label>
            )}
          </div>
        </div>

        {/* Output Export Formats Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <Settings className="w-4 h-4 text-indigo-500" />
              <span>导出与格式包装</span>
            </div>

            {/* Separator */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                分隔与排列格式
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: "newline", label: "换行分行" },
                  { id: "comma", label: "逗号分隔" },
                  { id: "json_array", label: "JSON 数组" },
                  { id: "sql_in", label: "SQL IN 语句" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSeparator(s.id as any)}
                    className={`py-2 px-1 text-xs rounded-xl border text-center transition-all cursor-pointer ${
                      separator === s.id
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quote type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                引号包裹
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: "none", label: "无引号" },
                  { id: "single", label: "单引号 ' '" },
                  { id: "double", label: '双引号 " "' },
                ].map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setQuoteType(q.id as any)}
                    className={`py-2 px-1 text-xs rounded-xl border text-center transition-all cursor-pointer ${
                      quoteType === q.id
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              onClick={() => handleCopy("all_output", formattedOutput)}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedKey === "all_output" ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>已复制全部结果</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>复制全部 ({idList.length} 条)</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="w-full py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>下载为 .txt 文件</span>
            </button>
          </div>
        </div>
      </div>

      {/* Batch Results Output Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            批量生成预览清单 ({idList.length} 条)
          </span>

          <span className="text-slate-400 font-mono">
            {new Blob([formattedOutput]).size} Bytes
          </span>
        </div>

        <textarea
          rows={12}
          readOnly
          value={formattedOutput}
          className="w-full p-4 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none select-all resize-none leading-relaxed"
        />
      </div>
    </div>
  );
}
