import React, { useState, useMemo } from "react";
import {
  filterHttpStatusList,
  HttpStatusCategory,
  HttpStatusCodeItem,
} from "./httpStatusUtils";
import {
  Activity,
  Search,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default function HttpStatusLookup() {
  const [query, setQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<HttpStatusCategory>("all");
  const [selectedItem, setSelectedItem] = useState<HttpStatusCodeItem | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredList = useMemo(
    () => filterHttpStatusList(query, selectedCategory),
    [query, selectedCategory]
  );

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const getBadgeStyle = (category: string) => {
    switch (category) {
      case "1xx":
        return "bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800";
      case "2xx":
        return "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "3xx":
        return "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "4xx":
        return "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800";
      case "5xx":
        return "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              HTTP 状态码速查参考
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              RFC 标准 HTTP 响应状态码速查字典、含义详解与前后端开发联调排错指南
            </p>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Search Bar */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索状态码、英文名称、中文含义或排错关键词 (如: 404, Unauthorized, 网关, 跨域)..."
            className="w-full pl-10 pr-10 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[
            { id: "all", label: "全部状态码" },
            { id: "1xx", label: "1xx 信息响应" },
            { id: "2xx", label: "2xx 成功响应" },
            { id: "3xx", label: "3xx 重定向" },
            { id: "4xx", label: "4xx 客户端错误" },
            { id: "5xx", label: "5xx 服务端错误" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as HttpStatusCategory)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Status Codes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((item) => (
          <div
            key={item.code}
            onClick={() => setSelectedItem(item)}
            className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/80 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-lg border ${getBadgeStyle(
                      item.category
                    )}`}
                  >
                    {item.code}
                  </span>
                  <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                    {item.message}
                  </span>
                </div>

                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-sans">
                  {item.name}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono">{item.rfc}</span>
              <span className="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-medium">
                查看排错详情
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredList.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <HelpCircle className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
          <div className="text-xs">未找到符合条件的状态码，尝试搜索其他关键词</div>
        </div>
      )}

      {/* Detail Modal Dialog */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`font-mono font-bold text-lg px-3 py-1 rounded-xl border ${getBadgeStyle(
                    selectedItem.category
                  )}`}
                >
                  {selectedItem.code}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                    {selectedItem.message}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                    {selectedItem.name} · {selectedItem.rfc}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content info */}
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">标准含义</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedItem.summary}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">技术规范详解</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedItem.details}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
                <span className="font-bold text-indigo-700 dark:text-indigo-300 block">
                  排错与联调建议
                </span>
                <p className="text-indigo-950 dark:text-indigo-200 leading-relaxed">
                  {selectedItem.debugging}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                onClick={() =>
                  handleCopy("detail", `${selectedItem.code} ${selectedItem.message} (${selectedItem.name}): ${selectedItem.summary}`)
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                {copiedKey === "detail" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>已复制状态码信息</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>复制信息</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-1.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
