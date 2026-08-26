import React, { useState, useMemo } from "react";
import {
  GitCompare,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  RefreshCw,
  Code2,
  Search,
  ArrowRightLeft,
  Braces,
} from "lucide-react";
import {
  JsonDiffResult,
  JsonDiffEntry,
  SAMPLE_JSON_LEFT,
  SAMPLE_JSON_RIGHT,
  computeJsonDiff,
  formatValueForDisplay,
} from "./jsonDiffUtils";

export default function JsonDiff() {
  const [leftJson, setLeftJson] = useState<string>(SAMPLE_JSON_LEFT);
  const [rightJson, setRightJson] = useState<string>(SAMPLE_JSON_RIGHT);
  const [ignoreKeyOrder, setIgnoreKeyOrder] = useState<boolean>(true);
  const [searchPath, setSearchPath] = useState<string>("");
  const [diffFilter, setDiffFilter] = useState<"all" | "added" | "changed" | "removed">("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Compute diff
  const diffResult: JsonDiffResult = useMemo(() => {
    return computeJsonDiff(leftJson, rightJson, { ignoreKeyOrder });
  }, [leftJson, rightJson, ignoreKeyOrder]);

  const filteredDiffs = useMemo(() => {
    return diffResult.diffs.filter((entry) => {
      if (diffFilter !== "all" && entry.type !== diffFilter) {
        return false;
      }
      if (searchPath.trim()) {
        const q = searchPath.toLowerCase();
        return (
          entry.path.toLowerCase().includes(q) ||
          formatValueForDisplay(entry.oldValue).toLowerCase().includes(q) ||
          formatValueForDisplay(entry.newValue).toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [diffResult.diffs, diffFilter, searchPath]);

  const handleSwap = () => {
    const temp = leftJson;
    setLeftJson(rightJson);
    setRightJson(temp);
  };

  const handleCopyPath = async (key: string, path: string) => {
    await navigator.clipboard.writeText(path);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleFormatBoth = () => {
    if (diffResult.isValid) {
      setLeftJson(diffResult.formattedLeft);
      setRightJson(diffResult.formattedRight);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <GitCompare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              JSON 结构化语义对比
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              纯本地深度比较两个 JSON 结构差异，自动忽略 Key 键顺序，精确按字段路径高亮新增、修改与删除项
            </p>
          </div>
        </div>
      </div>

      {/* Options & Action Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium select-none">
            <input
              type="checkbox"
              checked={ignoreKeyOrder}
              onChange={(e) => setIgnoreKeyOrder(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span>忽略对象 Key 排序先后 (语义比对)</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSwap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
            <span>左右互换</span>
          </button>
          <button
            onClick={handleFormatBoth}
            disabled={!diffResult.isValid}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
          >
            <Braces className="w-3.5 h-3.5 text-indigo-500" />
            <span>美化两边格式</span>
          </button>
        </div>
      </div>

      {/* 2-Column JSON Input Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Original JSON */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                原始基准版本 (Original)
              </label>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setLeftJson(SAMPLE_JSON_LEFT)}
                  className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>示例</span>
                </button>
                <button
                  onClick={() => setLeftJson("")}
                  className="text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>清空</span>
                </button>
              </div>
            </div>

            <textarea
              value={leftJson}
              onChange={(e) => setLeftJson(e.target.value)}
              placeholder="在此输入或粘贴左侧基准 JSON..."
              spellCheck={false}
              className="flex-1 w-full min-h-[280px] p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed whitespace-pre"
              rows={14}
            />
          </div>
        </div>

        {/* Right: Modified JSON */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                修改比对版本 (Modified)
              </label>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setRightJson(SAMPLE_JSON_RIGHT)}
                  className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>示例</span>
                </button>
                <button
                  onClick={() => setRightJson("")}
                  className="text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>清空</span>
                </button>
              </div>
            </div>

            <textarea
              value={rightJson}
              onChange={(e) => setRightJson(e.target.value)}
              placeholder="在此输入或粘贴右侧修改后 JSON..."
              spellCheck={false}
              className="flex-1 w-full min-h-[280px] p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed whitespace-pre"
              rows={14}
            />
          </div>
        </div>
      </div>

      {/* Error Banner if JSON syntax invalid */}
      {!diffResult.isValid && diffResult.error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-mono font-medium">{diffResult.error}</span>
        </div>
      )}

      {/* Diff Results Panel */}
      {diffResult.isValid && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            {/* Metrics Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              {diffResult.summary.isIdentical ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200/60 dark:border-emerald-800/40">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>两端 JSON 结构与数据完全一致</span>
                </span>
              ) : (
                <>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                    + 新增 {diffResult.summary.addedCount} 项
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                    ~ 修改 {diffResult.summary.changedCount} 项
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
                    - 删除 {diffResult.summary.removedCount} 项
                  </span>
                </>
              )}
            </div>

            {/* Filter by Diff Type */}
            {!diffResult.summary.isIdentical && (
              <div className="flex items-center gap-1.5 text-xs">
                {(["all", "added", "changed", "removed"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setDiffFilter(t)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      diffFilter === t
                        ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-2xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {t === "all" ? "全部差异" : t === "added" ? "新增" : t === "changed" ? "修改" : "删除"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Path Filter */}
          {!diffResult.summary.isIdentical && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchPath}
                onChange={(e) => setSearchPath(e.target.value)}
                placeholder="按属性路径 (如 user.profile.age) 或值进行过滤..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
            </div>
          )}

          {/* Diffs Table View */}
          {!diffResult.summary.isIdentical && (
            <div className="overflow-x-auto overflow-y-auto max-h-[380px] rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
              <table className="w-full text-left text-xs font-mono">
                <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-sans font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 w-16 text-center">状态</th>
                    <th className="py-2.5 px-3 min-w-[180px]">属性路径 (JSON Path)</th>
                    <th className="py-2.5 px-3 w-1/3">原始值 (Old Value)</th>
                    <th className="py-2.5 px-3 w-1/3">修改值 (New Value)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDiffs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 font-sans">
                        未找到符合筛选条件的差异项
                      </td>
                    </tr>
                  ) : (
                    filteredDiffs.map((diff, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          diff.type === "added"
                            ? "bg-emerald-50/40 dark:bg-emerald-950/20"
                            : diff.type === "removed"
                            ? "bg-rose-50/40 dark:bg-rose-950/20"
                            : "bg-amber-50/40 dark:bg-amber-950/20"
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center">
                          {diff.type === "added" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                              + 新增
                            </span>
                          ) : diff.type === "removed" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                              - 删除
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                              ~ 修改
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 select-all">
                              {diff.path}
                            </span>
                            <button
                              onClick={() => handleCopyPath(`path_${idx}`, diff.path)}
                              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5"
                              title="复制属性路径"
                            >
                              {copiedKey === `path_${idx}` ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 break-all select-all">
                          {diff.type === "added" ? (
                            <span className="text-slate-400 italic">不存在</span>
                          ) : (
                            <span className={diff.type === "removed" ? "line-through text-rose-600 dark:text-rose-400" : ""}>
                              {formatValueForDisplay(diff.oldValue)}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 break-all select-all font-semibold">
                          {diff.type === "removed" ? (
                            <span className="text-slate-400 italic font-normal">已删除</span>
                          ) : (
                            <span className={diff.type === "added" ? "text-emerald-600 dark:text-emerald-400" : "text-indigo-600 dark:text-indigo-400"}>
                              {formatValueForDisplay(diff.newValue)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
