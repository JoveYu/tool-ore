import React, { useState, useMemo } from "react";
import {
  GIT_SCENARIOS,
  GIT_SCENARIO_CATEGORIES,
  GitScenarioCategory,
  GitScenario,
  filterGitScenarios,
} from "./gitCommandUtils";
import {
  Terminal,
  Copy,
  Check,
  Search,
  RotateCcw,
  Sliders,
  Sparkles,
  AlertTriangle,
  GitBranch,
  Undo2,
  Bookmark,
  Send,
  History,
} from "lucide-react";

export default function GitCommandGenerator() {
  const [selectedCategory, setSelectedCategory] = useState<GitScenarioCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedScenario, setSelectedScenario] = useState<GitScenario>(GIT_SCENARIOS[0]);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredScenarios = useMemo(
    () => filterGitScenarios(selectedCategory, searchQuery),
    [selectedCategory, searchQuery]
  );

  // 切换场景时重置默认参数
  const handleSelectScenario = (scenario: GitScenario) => {
    setSelectedScenario(scenario);
    const defaults: Record<string, string> = {};
    scenario.params.forEach((p) => {
      defaults[p.key] = p.defaultValue;
    });
    setParamValues(defaults);
  };

  // 生成当前最终命令
  const generatedCommand = useMemo(() => {
    return selectedScenario.buildCommand(paramValues);
  }, [selectedScenario, paramValues]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const getCategoryIcon = (cat: GitScenarioCategory) => {
    switch (cat) {
      case "commit":
        return <Terminal className="w-4 h-4 text-indigo-500" />;
      case "undo":
        return <Undo2 className="w-4 h-4 text-rose-500" />;
      case "branch":
        return <GitBranch className="w-4 h-4 text-emerald-500" />;
      case "stash":
        return <Bookmark className="w-4 h-4 text-amber-500" />;
      case "remote":
        return <Send className="w-4 h-4 text-sky-500" />;
      case "log":
        return <History className="w-4 h-4 text-purple-500" />;
    }
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
              Git 常用场景命令生成器
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              解决常见 Git 业务场景（撤销提交、历史修改、分支压制合并、临时储藏与冲突还原）
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs & Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索 Git 场景、关键词或命令 (如: 撤销、stash、revert、squash)..."
            className="w-full pl-10 pr-10 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl border font-medium transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            全部场景
          </button>
          {GIT_SCENARIO_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl border font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Two-Pane Workspace: Scenarios List on Left, Active Parameters & Generated Command on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Scenarios List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2 max-h-[580px] overflow-y-auto">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 py-1">
            常见业务场景 ({filteredScenarios.length})
          </div>

          {filteredScenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectScenario(s)}
              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                selectedScenario.id === s.id
                  ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 shadow-2xs"
                  : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {getCategoryIcon(s.category)}
                  {s.title}
                </span>
                {s.isDangerous && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                    高危操作
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                {s.description}
              </p>
            </button>
          ))}
        </div>

        {/* Right: Active Parameters & Command Terminal Output */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Scenario Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedScenario.title}
                </span>
                {selectedScenario.isDangerous && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    破坏性操作提示
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {selectedScenario.description}
              </p>
            </div>

            {selectedScenario.dangerWarning && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2 leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{selectedScenario.dangerWarning}</span>
              </div>
            )}

            {/* Parameters Input */}
            {selectedScenario.params.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  自定义命令参数
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {selectedScenario.params.map((param) => (
                    <div key={param.key} className="space-y-1">
                      <label className="font-medium text-slate-700 dark:text-slate-300">
                        {param.label}
                      </label>
                      <input
                        type="text"
                        value={paramValues[param.key] ?? param.defaultValue}
                        onChange={(e) =>
                          setParamValues({ ...paramValues, [param.key]: e.target.value })
                        }
                        placeholder={param.placeholder}
                        className="w-full px-3.5 py-2 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Generated Command Terminal Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-500" />
                <span>生成执行命令</span>
              </span>

              <button
                onClick={() => handleCopy("cmd", generatedCommand)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {copiedKey === "cmd" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>已复制命令</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>复制命令</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 text-indigo-300 font-mono text-sm leading-relaxed overflow-x-auto select-all shadow-inner font-bold break-all">
              $ {generatedCommand}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
