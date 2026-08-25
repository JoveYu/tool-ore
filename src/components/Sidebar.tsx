import React, { useState } from "react";
import { CATEGORIES, TOOLS, getToolsByCategory } from "../registry";
import { DynamicIcon } from "./DynamicIcon";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Compass,
  Moon,
  Sun,
  Laptop,
  Sparkles,
} from "lucide-react";
import { ThemeMode } from "../hooks/useTheme";

interface SidebarProps {
  currentToolId: string | null;
  onSelectTool: (toolId: string | null) => void;
  themeMode: ThemeMode;
  isDark: boolean;
  onCycleTheme: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentToolId,
  onSelectTool,
  themeMode,
  isDark,
  onCycleTheme,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  // 默认分类全部收起；若有当前选中的工具，则展开对应分类
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CATEGORIES.forEach((cat) => {
      initial[cat.id] = false;
    });
    if (currentToolId) {
      const currentTool = TOOLS.find((t) => t.id === currentToolId);
      if (currentTool) {
        initial[currentTool.category] = true;
      }
    }
    return initial;
  });

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleSelect = (id: string | null) => {
    onSelectTool(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  // Filter tools if searching
  const filteredTools = searchQuery.trim()
    ? TOOLS.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : null;

  const getThemeTitle = () => {
    if (themeMode === "system") {
      return `当前模式：跟随系统 (${isDark ? "深色" : "浅色"}) - 点击切换为浅色`;
    }
    if (themeMode === "light") {
      return "当前模式：亮色 - 点击切换为深色";
    }
    return "当前模式：深色 - 点击切换为跟随系统";
  };

  const renderThemeIcon = () => {
    if (themeMode === "system") {
      return <Laptop className="w-4 h-4 text-indigo-500" />;
    }
    if (themeMode === "dark") {
      return <Moon className="w-4 h-4 text-indigo-400" />;
    }
    return <Sun className="w-4 h-4 text-amber-500" />;
  };

  return (
    <aside className="w-72 h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800 flex flex-col flex-shrink-0 transition-colors duration-200 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <button
          onClick={() => handleSelect(null)}
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity text-left focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white tracking-tight text-base">
              在线工具
            </div>
          </div>
        </button>

        <button
          onClick={onCycleTheme}
          title={getThemeTitle()}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-center"
        >
          {renderThemeIcon()}
        </button>
      </div>

      {/* Quick Navigation & Search */}
      <div className="p-3 space-y-2 border-b border-slate-100 dark:border-slate-800/60">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="搜索工具"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border-0 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
          />
        </div>

        <button
          onClick={() => handleSelect(null)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            currentToolId === null
              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>全部工具导航</span>
          <span className="ml-auto text-[10px] text-slate-400 font-mono">
            {TOOLS.length}
          </span>
        </button>
      </div>

      {/* Categories & Tool List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {filteredTools ? (
          // Search results
          <div className="space-y-1">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              搜索结果 ({filteredTools.length})
            </div>
            {filteredTools.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                未找到匹配的工具
              </div>
            ) : (
              filteredTools.map((tool) => {
                const isActive = currentToolId === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleSelect(tool.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all text-left ${
                      isActive
                        ? "bg-indigo-600 text-white font-medium shadow-sm shadow-indigo-600/30"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                  >
                    <DynamicIcon
                      name={tool.iconName}
                      className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}`}
                    />
                    <span className="truncate flex-1">{tool.name}</span>
                  </button>
                );
              })
            )}
          </div>
        ) : (
          // Grouped Categories
          CATEGORIES.map((category) => {
            const categoryTools = getToolsByCategory(category.id);
            const isExpanded = !!expandedCategories[category.id];

            return (
              <div key={category.id} className="space-y-0.5">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <DynamicIcon
                      name={category.iconName}
                      className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors"
                    />
                    <span>{category.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800/80">
                      {categoryTools.length}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Category Tools List */}
                {isExpanded && (
                  <div className="pl-3.5 ml-2 border-l border-slate-100 dark:border-slate-800/80 space-y-0.5 py-0.5">
                    {categoryTools.map((tool) => {
                      const isActive = currentToolId === tool.id;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => handleSelect(tool.id)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all text-left ${
                            isActive
                              ? "bg-indigo-600 text-white font-medium shadow-sm shadow-indigo-600/30"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                          }`}
                        >
                          <DynamicIcon
                            name={tool.iconName}
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? "text-white" : "text-slate-400 dark:text-slate-500"
                            }`}
                          />
                          <span className="truncate flex-1">{tool.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
        <span className="font-mono text-[10px] text-slate-400">在线工具</span>
        <span className="font-mono text-[10px] text-slate-400">v0.1.0</span>
      </div>
    </aside>
  );
};
