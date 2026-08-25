import React, { useState, useMemo } from "react";
import {
  parseRegexToRailroadAst,
  RailroadNode,
} from "./regexRailroadUtils";
import {
  GitBranch,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Search,
  Eye,
  Sliders,
  HelpCircle,
} from "lucide-react";

export default function RegexRailroad() {
  const [pattern, setPattern] = useState<string>("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const ast = useMemo(() => parseRegexToRailroadAst(pattern), [pattern]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const sampleRegexes = [
    { label: "电子邮箱", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
    { label: "手机号码", pattern: "^1[3-9]\\d{9}$" },
    { label: "HTTP 网址", pattern: "^https?:\\/\\/[\\w\\.-]+\\.[a-zA-Z]{2,}(\\/\\S*)?$" },
    { label: "IPv4 地址", pattern: "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)$" },
    { label: "分支选择 (Cat|Dog)", pattern: "^(cat|dog|fish)$" },
  ];

  // 递归渲染铁路图节点
  const renderNode = (node: RailroadNode, index: number): React.ReactNode => {
    if (node.type === "choice") {
      return (
        <div key={index} className="flex flex-col gap-3 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-dashed border-indigo-300 dark:border-indigo-800">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
            分支选择 (Choice / OR)
          </span>
          <div className="flex flex-col gap-2 pl-2 border-l-2 border-indigo-400">
            {node.subNodes?.map((sub, sIdx) => (
              <div key={sIdx} className="flex items-center gap-2">
                <span className="text-xs text-indigo-400 font-mono">分支 {sIdx + 1} ➔</span>
                {renderNode(sub, sIdx)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (node.type === "group") {
      return (
        <div key={index} className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          {node.subNodes?.map((sub, sIdx) => renderNode(sub, sIdx))}
          {node.quantifier && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200">
              {node.quantifier}
            </span>
          )}
        </div>
      );
    }

    let badgeColor = "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200";
    if (node.type === "literal") {
      badgeColor = "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-mono font-bold";
    } else if (node.type === "charset") {
      badgeColor = "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 font-mono";
    } else if (node.type === "anchor") {
      badgeColor = "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 font-bold";
    } else if (node.type === "any") {
      badgeColor = "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
    }

    return (
      <div key={index} className="flex items-center gap-1.5 shrink-0">
        <div className={`px-3 py-1.5 rounded-xl border text-xs shadow-2xs ${badgeColor}`}>
          {node.label}
        </div>
        {node.quantifier && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            {node.quantifier}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              正则表达式可视化铁路流程图
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              将复杂正则表达式分解为直观清晰的语法节点流程图，轻松看懂匹配逻辑与分支走向
            </p>
          </div>
        </div>
      </div>

      {/* Regex Input Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <span>输入待可视化的正则表达式</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy("regex", pattern)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-sans"
            >
              {copiedKey === "regex" ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              复制正则
            </button>
            <button
              onClick={() => setPattern("")}
              className="text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer font-sans"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              清空
            </button>
          </div>
        </div>

        <div className="flex items-center rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 overflow-hidden px-3.5 py-1">
          <span className="text-base font-mono font-bold text-slate-400 select-none mr-2">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="输入正则表达式 (无需输入两侧斜杠)..."
            className="flex-1 py-2 font-mono text-sm font-bold text-slate-900 dark:text-white bg-transparent outline-none"
          />
          <span className="text-base font-mono font-bold text-slate-400 select-none ml-2">/g</span>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">常用预设表达式:</span>
          {sampleRegexes.map((s) => (
            <button
              key={s.label}
              onClick={() => setPattern(s.pattern)}
              className="px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer shadow-2xs"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Visual Railroad Diagram Display */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-indigo-500" />
            <span>语法匹配流程可视化</span>
          </span>
        </div>

        {/* Railroad Track Visual Flow Canvas */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 overflow-x-auto min-h-[160px] flex items-center shadow-inner">
          <div className="flex items-center gap-3 py-4">
            {/* Start Node */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 shadow-sm inline-block" />
              <span className="font-bold font-mono text-xs text-indigo-600 dark:text-indigo-400">开始</span>
              <span className="w-4 h-0.5 bg-indigo-400 inline-block" />
            </div>

            {/* AST Nodes */}
            <div className="flex items-center gap-3">
              {renderNode(ast, 0)}
            </div>

            {/* End Node */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-4 h-0.5 bg-emerald-400 inline-block" />
              <span className="font-bold font-mono text-xs text-emerald-600 dark:text-emerald-400">结束</span>
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm inline-block" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
