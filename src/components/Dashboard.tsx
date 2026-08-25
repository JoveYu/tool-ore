import React from "react";
import { CATEGORIES, getToolsByCategory } from "../registry";
import { ToolDefinition } from "../types/tool";
import { DynamicIcon } from "./DynamicIcon";
import { ArrowRight } from "lucide-react";

interface DashboardProps {
  onSelectTool: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTool }) => {
  return (
    <div className="w-full space-y-7">
      {/* Category Groups */}
      <div className="space-y-7">
        {CATEGORIES.map((category) => {
          const tools = getToolsByCategory(category.id);
          if (tools.length === 0) return null;

          return (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                  <DynamicIcon name={category.iconName} className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {category.name}
                  </h2>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    {category.description}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {tools.map((tool: ToolDefinition) => (
                  <button
                    key={tool.id}
                    onClick={() => onSelectTool(tool.id)}
                    className="group relative p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 hover:border-indigo-400/80 dark:hover:border-indigo-500/80 hover:shadow-md hover:shadow-indigo-500/5 transition-all text-left flex flex-col justify-between cursor-pointer"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950/50 dark:group-hover:text-indigo-400 transition-colors shrink-0">
                            <DynamicIcon name={tool.iconName} className="w-3.5 h-3.5" />
                          </div>
                          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {tool.name}
                          </h3>
                        </div>
                        <span className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0">
                          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
