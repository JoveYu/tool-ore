import React, { useState, useMemo } from "react";
import {
  formatSql,
  SQL_DIALECTS,
  SqlDialect,
  SqlFormatOptions,
} from "./sqlUtils";
import { CodeViewer } from "../../components/CodeViewer";
import {
  Database,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  Sliders,
  AlignLeft,
  Minimize2,
  AlertCircle,
} from "lucide-react";

export default function SqlFormatter() {
  const sampleSql = `select u.id, u.username, u.email, count(o.id) as total_orders, sum(o.amount) as total_spent from users u left join orders o on u.id = o.user_id where u.status = 'active' and u.created_at >= '2026-01-01' group by u.id, u.username, u.email having count(o.id) > 5 order by total_spent desc limit 50;`;

  const [inputSql, setInputSql] = useState<string>(sampleSql);
  const [dialect, setDialect] = useState<SqlDialect>("mysql");
  const [keywordCase, setKeywordCase] = useState<"upper" | "lower" | "preserve">("upper");
  const [indent, setIndent] = useState<number>(2);
  const [minify, setMinify] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const options: SqlFormatOptions = useMemo(
    () => ({
      dialect,
      keywordCase,
      indent,
      minify,
    }),
    [dialect, keywordCase, indent, minify]
  );

  const formattedResult = useMemo(
    () => formatSql(inputSql, options),
    [inputSql, options]
  );

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownload = () => {
    if (!formattedResult.result) return;
    const blob = new Blob([formattedResult.result], { type: "text/sql;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query_${Date.now()}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              SQL 格式化与美化
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              支持 MySQL、PostgreSQL、Oracle、SQLite 等多数据库方言排版、关键字大写与单行压缩
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar Options */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Dialect Selector */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700 dark:text-slate-300">数据库方言:</span>
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value as SqlDialect)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none font-medium"
            >
              {SQL_DIALECTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Keyword Case */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">关键字大小写:</span>
            {[
              { id: "upper", label: "大写 UPPER" },
              { id: "lower", label: "小写 lower" },
              { id: "preserve", label: "保持原样" },
            ].map((k) => (
              <button
                key={k.id}
                onClick={() => setKeywordCase(k.id as any)}
                className={`px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                  keywordCase === k.id
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>

          {/* Indent and Minify mode */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={minify}
                onChange={(e) => setMinify(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">单行压缩</span>
            </label>

            {!minify && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">缩进:</span>
                {[2, 4].map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setIndent(ind)}
                    className={`px-2 py-0.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                      indent === ind
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {ind} 空格
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              原始 SQL 语句
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setInputSql(sampleSql)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                重置示例
              </button>
              <button
                onClick={() => setInputSql("")}
                className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                清空
              </button>
            </div>
          </div>

          <textarea
            rows={15}
            value={inputSql}
            onChange={(e) => setInputSql(e.target.value)}
            placeholder="请在此输入或粘贴 SQL 语句..."
            className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
          />

          {!formattedResult.isValid && formattedResult.error && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formattedResult.error}</span>
            </div>
          )}
        </div>

        {/* Formatted Output */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              格式化排版结果
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={!formattedResult.result}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                title="下载 SQL 文件"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载</span>
              </button>

              <button
                onClick={() => handleCopy("result", formattedResult.result)}
                disabled={!formattedResult.result}
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
                    <span>复制 SQL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <CodeViewer
            code={formattedResult.result}
            language="sql"
            maxHeight="380px"
            placeholder="美化后的 SQL 将实时呈现在此处..."
          />

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 font-mono">
            <span>字符数: {formattedResult.result.length}</span>
            <span>行数: {formattedResult.result ? formattedResult.result.split("\n").length : 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
