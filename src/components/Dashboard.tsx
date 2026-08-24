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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Category Groups */}
      <div className="space-y-8">
        {CATEGORIES.map((category) => {
          const tools = getToolsByCategory(category.id);
          if (tools.length === 0) return null;

          return (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                  <DynamicIcon name={category.iconName} className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {category.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {category.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool: ToolDefinition) => (
                  <button
                    key={tool.id}
                    onClick={() => onSelectTool(tool.id)}
                    className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-md hover:shadow-indigo-500/5 transition-all text-left flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950/50 dark:group-hover:text-indigo-400 transition-colors">
                          <DynamicIcon name={tool.iconName} className="w-5 h-5" />
                        </div>
                        <span className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>

                      <div>
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    </div>

                    {tool.tags && (
                      <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                        {tool.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
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
