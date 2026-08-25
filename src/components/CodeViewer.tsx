import React, { useMemo } from "react";
import { highlightCode } from "../utils/highlight";

interface CodeViewerProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
  maxHeight?: string;
  placeholder?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = "plaintext",
  showLineNumbers = true,
  className = "",
  maxHeight = "480px",
  placeholder = "暂无内容...",
}) => {
  const clean = code || "";
  const lines = useMemo(() => clean.split("\n"), [clean]);
  const lineCount = lines.length;

  const highlightedHtml = useMemo(() => {
    if (!clean.trim()) return "";
    return highlightCode(clean, language);
  }, [clean, language]);

  if (!clean.trim()) {
    return (
      <div
        className={`w-full p-4 rounded-xl font-mono text-xs text-slate-400 bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center ${className}`}
        style={{ minHeight: "180px", maxHeight }}
      >
        {placeholder}
      </div>
    );
  }

  return (
    <div
      className={`w-full rounded-xl bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs overflow-auto flex shadow-2xs ${className}`}
      style={{ maxHeight }}
    >
      {/* Line Numbers Bar */}
      {showLineNumbers && (
        <div
          className="select-none py-3.5 pl-3 pr-3 text-right border-r border-slate-200/80 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600 font-mono text-[11px] shrink-0"
          style={{ minWidth: "3rem" }}
        >
          {lines.map((_, idx) => (
            <div key={idx} className="leading-relaxed">
              {idx + 1}
            </div>
          ))}
        </div>
      )}

      {/* Highlighted Code Area */}
      <pre
        className="flex-1 p-3.5 m-0 bg-transparent overflow-x-auto leading-relaxed select-all hljs outline-none"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  );
};
