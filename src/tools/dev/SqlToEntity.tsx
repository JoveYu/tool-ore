import React, { useState, useMemo } from "react";
import {
  Database,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  Code2,
  Sliders,
  CheckCircle2,
  FileCode2,
} from "lucide-react";
import { CodeViewer } from "../../components/CodeViewer";
import {
  TargetLanguage,
  SqlToEntityOptions,
  SAMPLE_CREATE_SQL,
  parseCreateTableSql,
  convertSqlToLanguage,
} from "./sqlToEntityUtils";

export default function SqlToEntity() {
  const [sqlText, setSqlText] = useState<string>(SAMPLE_CREATE_SQL);
  const [targetLang, setTargetLang] = useState<TargetLanguage>("typescript");

  // Options
  const [namingStyle, setNamingStyle] = useState<"camelCase" | "snake_case" | "PascalCase">("camelCase");
  const [includeComments, setIncludeComments] = useState<boolean>(true);
  const [includeAnnotations, setIncludeAnnotations] = useState<boolean>(true);
  const [optionalNullable, setOptionalNullable] = useState<boolean>(true);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const parsedTable = useMemo(() => {
    return parseCreateTableSql(sqlText);
  }, [sqlText]);

  const options: SqlToEntityOptions = useMemo(
    () => ({
      namingStyle,
      includeComments,
      includeAnnotations,
      optionalNullable,
    }),
    [namingStyle, includeComments, includeAnnotations, optionalNullable]
  );

  const generatedCode = useMemo(() => {
    return convertSqlToLanguage(sqlText, targetLang, options);
  }, [sqlText, targetLang, options]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownload = () => {
    if (!generatedCode) return;
    const extensions: Record<TargetLanguage, string> = {
      typescript: "ts",
      go: "go",
      java: "java",
      python: "py",
      rust: "rs",
      csharp: "cs",
    };

    const ext = extensions[targetLang];
    const blob = new Blob([generatedCode], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${parsedTable.tableName || "entity"}.${ext}`;
    a.click();
  };

  const getLanguageCodeViewerMode = (lang: TargetLanguage): string => {
    switch (lang) {
      case "typescript":
        return "typescript";
      case "go":
        return "go";
      case "java":
        return "java";
      case "python":
        return "python";
      case "rust":
        return "rust";
      case "csharp":
        return "csharp";
    }
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
              SQL 建表语句转实体类模型
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              自动解析 CREATE TABLE DDL 语句，智能推导数据类型与注释，一键生成 TypeScript、Go、Java、Python 与 Rust 模型
            </p>
          </div>
        </div>
      </div>

      {/* Target Language & Options Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mr-1">
              目标编程语言:
            </span>

            {[
              { id: "typescript", label: "TypeScript" },
              { id: "go", label: "Go (GORM/JSON)" },
              { id: "java", label: "Java (Lombok/JPA)" },
              { id: "python", label: "Python (Pydantic)" },
              { id: "rust", label: "Rust (Serde)" },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setTargetLang(lang.id as TargetLanguage)}
                className={`px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                  targetLang === lang.id
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs ring-2 ring-indigo-500/20"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span>{lang.label}</span>
              </button>
            ))}
          </div>

          {/* Options Toggles */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium select-none">
              <input
                type="checkbox"
                checked={includeComments}
                onChange={(e) => setIncludeComments(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>生成字段注释</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium select-none">
              <input
                type="checkbox"
                checked={includeAnnotations}
                onChange={(e) => setIncludeAnnotations(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>包含标签注解 (GORM/Lombok)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium select-none">
              <input
                type="checkbox"
                checked={optionalNullable}
                onChange={(e) => setOptionalNullable(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>可空字段标记可选</span>
            </label>
          </div>
        </div>
      </div>

      {/* 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input SQL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                SQL 建表 DDL 语句 (CREATE TABLE)
              </label>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setSqlText(SAMPLE_CREATE_SQL)}
                  className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>载入示例</span>
                </button>
                <button
                  onClick={() => setSqlText("")}
                  className="text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>清空</span>
                </button>
              </div>
            </div>

            <textarea
              value={sqlText}
              onChange={(e) => setSqlText(e.target.value)}
              placeholder="在此粘贴 SQL CREATE TABLE 建表语句..."
              spellCheck={false}
              className="flex-1 w-full min-h-[380px] p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed whitespace-pre"
              rows={18}
            />
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>
              已识别表名: {parsedTable.tableName} · 字段数: {parsedTable.columns.length} 个
            </span>
            <span>字符数: {sqlText.length}</span>
          </div>
        </div>

        {/* Right: Output Generated Model */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                生成的实体类模型 ({targetLang.toUpperCase()})
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  disabled={!generatedCode}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                  title="下载代码文件"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载</span>
                </button>

                <button
                  onClick={() => handleCopy("code", generatedCode)}
                  disabled={!generatedCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-xs transition-colors cursor-pointer"
                >
                  {copiedKey === "code" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>已复制代码</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制代码</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <CodeViewer
                code={generatedCode}
                language={getLanguageCodeViewerMode(targetLang)}
                maxHeight="380px"
                placeholder="生成的实体类代码将在此处实时呈现..."
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>语言: {targetLang.toUpperCase()}</span>
            <span>大小: {new Blob([generatedCode]).size} 字节</span>
          </div>
        </div>
      </div>
    </div>
  );
}
