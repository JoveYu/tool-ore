import React, { useState, useMemo } from "react";
import {
  encodeHtmlEntities,
  decodeHtmlEntities,
  EntityEncodeType,
  COMMON_HTML_ENTITIES,
} from "./htmlEntityUtils";
import {
  CodeXml,
  Copy,
  Check,
  RotateCcw,
  ArrowRightLeft,
  Sparkles,
  Table,
} from "lucide-react";

type Mode = "encode" | "decode";

export default function HtmlEntityConverter() {
  const sampleRaw = `<div class="card" id="main">
  <h1>Hello "World" & 'Universe' © 2026</h1>
  <p>价格：¥99.00 / $15.00</p>
</div>`;

  const [mode, setMode] = useState<Mode>("encode");
  const [inputText, setInputText] = useState<string>(sampleRaw);
  const [encodeType, setEncodeType] = useState<EntityEncodeType>("named");
  const [encodeNonAscii, setEncodeNonAscii] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const convertedResult = useMemo(() => {
    if (!inputText.trim()) return "";
    if (mode === "encode") {
      return encodeHtmlEntities(inputText, encodeType, encodeNonAscii);
    } else {
      return decodeHtmlEntities(inputText);
    }
  }, [inputText, mode, encodeType, encodeNonAscii]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleSwap = () => {
    if (convertedResult) {
      setInputText(convertedResult);
      setMode(mode === "encode" ? "decode" : "encode");
    } else {
      setMode(mode === "encode" ? "decode" : "encode");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <CodeXml className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                HTML 与 XML 实体编解码
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                特殊字符实体转义、Unicode 十进制/十六进制实体互转与 XSS 安全过滤辅助
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium self-start sm:self-center">
            <button
              onClick={() => setMode("encode")}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                mode === "encode"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              实体编码 (Encode)
            </button>
            <button
              onClick={() => setMode("decode")}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                mode === "decode"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              实体解码 (Decode)
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar Options */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <button
            onClick={handleSwap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
            <span>对调转换方向</span>
          </button>

          {mode === "encode" && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">编码格式:</span>
                {[
                  { id: "named", label: "命名实体 (&lt;)" },
                  { id: "decimal", label: "十进制 (&#60;)" },
                  { id: "hex", label: "十六进制 (&#x3C;)" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setEncodeType(t.id as any)}
                    className={`px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                      encodeType === t.id
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={encodeNonAscii}
                  onChange={(e) => setEncodeNonAscii(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  同时编码非 ASCII / 中文字符
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Editor & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Pane */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {mode === "encode" ? "原始 HTML 文本输入" : "实体编码文本输入"}
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setInputText(sampleRaw)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                重置示例
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
            placeholder="请在此输入文本..."
            className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
          />

          <div className="text-[11px] text-slate-400 font-mono">字符数: {inputText.length}</div>
        </div>

        {/* Output Pane */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {mode === "encode" ? "实体编码转换结果" : "实体还原解码结果"}
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

          <textarea
            rows={14}
            readOnly
            value={convertedResult}
            placeholder="转换后的文本将实时展现在此处..."
            className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-indigo-950 dark:text-indigo-200 outline-none select-all resize-none leading-relaxed break-all"
          />

          <div className="text-[11px] text-slate-400 font-mono">
            字符数: {convertedResult.length}
          </div>
        </div>
      </div>

      {/* Common HTML Entities Cheat Sheet */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-indigo-500" />
            <span>常用 HTML 关键实体对照速查</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 uppercase bg-slate-50/30 dark:bg-slate-800/10">
                <th className="py-2.5 px-6 font-semibold">字符</th>
                <th className="py-2.5 px-6 font-semibold">命名实体</th>
                <th className="py-2.5 px-6 font-semibold">十进制实体</th>
                <th className="py-2.5 px-6 font-semibold">十六进制实体</th>
                <th className="py-2.5 px-6 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {COMMON_HTML_ENTITIES.map((item) => (
                <tr
                  key={item.name}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2 px-6 font-bold text-indigo-600 dark:text-indigo-400">
                    {item.char}
                  </td>
                  <td className="py-2 px-6">{item.name}</td>
                  <td className="py-2 px-6 text-slate-500">{item.dec}</td>
                  <td className="py-2 px-6 text-slate-500">{item.hex}</td>
                  <td className="py-2 px-6 font-sans text-slate-500">{item.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
