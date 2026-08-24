import React, { useState, useMemo } from "react";
import {
  computeDiff,
  computeSideBySideLines,
  DiffOptions,
} from "./textDiffUtils";
import {
  GitCompare,
  RotateCcw,
  ArrowRightLeft,
  Columns,
  AlignJustify,
  SlidersHorizontal,
  Plus,
  Minus,
  Check,
  Copy,
} from "lucide-react";

const SAMPLE_OLD = `function calculateTotal(price, count) {
  var discount = 0.9;
  var total = price * count * discount;
  console.log("Total is: " + total);
  return total;
}`;

const SAMPLE_NEW = `function calculateTotal(price, count, customDiscount) {
  const discount = customDiscount || 0.85;
  const total = price * count * discount;
  console.log(\`Final Total is: \${total}\`);
  // Added audit log
  saveAuditLog(total);
  return total;
}`;

type ViewMode = "split" | "unified";

export default function TextDiff() {
  const [oldText, setOldText] = useState<string>(SAMPLE_OLD);
  const [newText, setNewText] = useState<string>(SAMPLE_NEW);

  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [diffGranularity, setDiffGranularity] = useState<"lines" | "words" | "chars">("lines");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState<boolean>(false);
  const [ignoreCase, setIgnoreCase] = useState<boolean>(false);

  const [copied, setCopied] = useState<boolean>(false);

  const diffSummary = useMemo(() => {
    return computeDiff(oldText, newText, {
      diffMode: diffGranularity,
      ignoreWhitespace,
      ignoreCase,
    });
  }, [oldText, newText, diffGranularity, ignoreWhitespace, ignoreCase]);

  const sideBySideLines = useMemo(() => {
    if (viewMode !== "split") return [];
    return computeSideBySideLines(oldText, newText, {
      diffMode: diffGranularity,
      ignoreCase,
      ignoreWhitespace,
    });
  }, [oldText, newText, viewMode, diffGranularity, ignoreCase, ignoreWhitespace]);

  const handleSwap = () => {
    setOldText(newText);
    setNewText(oldText);
  };

  const handleClear = () => {
    setOldText("");
    setNewText("");
  };

  const handleCopyUnified = async () => {
    const text = diffSummary.changes
      .map((c) => (c.added ? `+ ${c.value}` : c.removed ? `- ${c.value}` : `  ${c.value}`))
      .join("");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <GitCompare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              文本比对
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              支持双栏分栏与单栏合并比对，支持行、词、字符级颗粒度及差异统计
            </p>
          </div>
        </div>
      </div>

      {/* Input Editors (Collapsible/Side by Side) */}
      <div className="space-y-3">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            比对文本输入区
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSwap}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
              交换两边文本
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              清空
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                原始文本 (Original / Old)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {oldText.length} 字符 · {oldText.split("\n").length} 行
              </span>
            </div>
            <textarea
              rows={8}
              value={oldText}
              onChange={(e) => setOldText(e.target.value)}
              placeholder="粘贴或输入原始文本..."
              className="flex-1 w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 outline-none resize-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                修改后文本 (Modified / New)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {newText.length} 字符 · {newText.split("\n").length} 行
              </span>
            </div>
            <textarea
              rows={8}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="粘贴或输入修改后的文本..."
              className="flex-1 w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 outline-none resize-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* Diff Result Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* View Modes & Granularity */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Split / Unified */}
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-800">
              <button
                onClick={() => setViewMode("split")}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-md font-medium transition-colors ${
                  viewMode === "split"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                分栏双视
              </button>
              <button
                onClick={() => setViewMode("unified")}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-md font-medium transition-colors ${
                  viewMode === "unified"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <AlignJustify className="w-3.5 h-3.5" />
                单栏合并
              </button>
            </div>

            {/* Granularity */}
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-800">
              {[
                { id: "lines", label: "按行对比" },
                { id: "words", label: "按词对比" },
                { id: "chars", label: "按字符" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setDiffGranularity(item.id as any)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    diffGranularity === item.id
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Ignorance toggles */}
            <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ignoreWhitespace}
                onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>忽略空格</span>
            </label>

            <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ignoreCase}
                onChange={(e) => setIgnoreCase(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>忽略大小写</span>
            </label>
          </div>

          {/* Diff Stats Badges */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200/50 dark:border-emerald-800/40">
                <Plus className="w-3 h-3" />
                {diffSummary.addedCount} 新增
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold border border-rose-200/50 dark:border-rose-800/40">
                <Minus className="w-3 h-3" />
                {diffSummary.removedCount} 删除
              </span>
            </div>

            <button
              onClick={handleCopyUnified}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
              title="复制对比差异"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[11px] text-emerald-600">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px]">复制差异</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Diff Content View */}
        <div className="overflow-x-auto min-h-[300px] max-h-[600px] overflow-y-auto font-mono text-xs">
          {viewMode === "split" ? (
            /* Split / Side-by-Side Table View */
            <table className="w-full border-collapse">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {sideBySideLines.map((line, idx) => (
                  <tr key={idx} className="leading-5">
                    {/* Old Side */}
                    <td className="w-10 py-1 px-2 text-right text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 select-none border-r border-slate-200/50 dark:border-slate-800 text-[11px] align-top">
                      {line.oldLineNumber || ""}
                    </td>
                    <td
                      className={`w-1/2 py-1 px-3 border-r border-slate-200/50 dark:border-slate-800 break-all select-all align-top ${
                        line.oldType === "removed"
                          ? "bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200"
                          : line.oldType === "modified"
                          ? "bg-rose-50/40 dark:bg-rose-950/20 text-slate-800 dark:text-slate-200"
                          : line.oldType === "empty"
                          ? "bg-slate-50/30 dark:bg-slate-900/20"
                          : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {line.oldChunks ? (
                        line.oldChunks.map((chunk, cIdx) => (
                          <span
                            key={cIdx}
                            className={
                              chunk.type === "removed"
                                ? "bg-rose-200 dark:bg-rose-900/70 text-rose-900 dark:text-rose-100 rounded-xs px-0.5 font-bold"
                                : ""
                            }
                          >
                            {chunk.text}
                          </span>
                        ))
                      ) : (
                        ""
                      )}
                    </td>

                    {/* New Side */}
                    <td className="w-10 py-1 px-2 text-right text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 select-none border-r border-slate-200/50 dark:border-slate-800 text-[11px] align-top">
                      {line.newLineNumber || ""}
                    </td>
                    <td
                      className={`w-1/2 py-1 px-3 break-all select-all align-top ${
                        line.newType === "added"
                          ? "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200"
                          : line.newType === "modified"
                          ? "bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-800 dark:text-slate-200"
                          : line.newType === "empty"
                          ? "bg-slate-50/30 dark:bg-slate-900/20"
                          : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {line.newChunks ? (
                        line.newChunks.map((chunk, cIdx) => (
                          <span
                            key={cIdx}
                            className={
                              chunk.type === "added"
                                ? "bg-emerald-200 dark:bg-emerald-800/80 text-emerald-900 dark:text-emerald-100 rounded-xs px-0.5 font-bold"
                                : ""
                            }
                          >
                            {chunk.text}
                          </span>
                        ))
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Unified Single Stream View */
            <div className="p-4 space-y-0.5">
              {diffSummary.changes.map((part, idx) => {
                const isAdded = part.added;
                const isRemoved = part.removed;

                return (
                  <span
                    key={idx}
                    className={`inline ${
                      isAdded
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 rounded-xs px-0.5 font-semibold"
                        : isRemoved
                        ? "bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 line-through rounded-xs px-0.5 opacity-80"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {part.value}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
