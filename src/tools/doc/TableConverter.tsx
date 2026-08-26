import React, { useState, useMemo, useRef } from "react";
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  Table as TableIcon,
  Code2,
  Database,
  FileText,
  FileCode,
  FileType,
} from "lucide-react";
import { CodeViewer } from "../../components/CodeViewer";
import {
  TableData,
  ExportFormatType,
  ConvertOptions,
  SAMPLE_TABLE_TEXT,
  parseDelimitedText,
  tableToJson,
  tableToSql,
  tableToMarkdown,
  tableToHtml,
  tableToCsv,
} from "./tableConverterUtils";

export default function TableConverter() {
  const [rawText, setRawText] = useState<string>(SAMPLE_TABLE_TEXT);
  const [targetFormat, setTargetFormat] = useState<ExportFormatType>("json");

  // Options
  const [hasHeader, setHasHeader] = useState<boolean>(true);
  const [inferTypes, setInferTypes] = useState<boolean>(true);
  const [trimWhitespace, setTrimWhitespace] = useState<boolean>(true);
  const [skipEmptyRows, setSkipEmptyRows] = useState<boolean>(true);
  const [sqlTableName, setSqlTableName] = useState<string>("employee_records");
  const [jsonMode, setJsonMode] = useState<"object_array" | "2d_array">("object_array");

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse raw text into structured table data
  const tableData: TableData = useMemo(() => {
    return parseDelimitedText(rawText, {
      trimWhitespace,
      skipEmptyRows,
    });
  }, [rawText, trimWhitespace, skipEmptyRows]);

  const convertOptions: ConvertOptions = useMemo(
    () => ({
      hasHeader,
      trimWhitespace,
      skipEmptyRows,
      inferTypes,
      sqlTableName,
      jsonMode,
      csvDelimiter: ",",
    }),
    [hasHeader, trimWhitespace, skipEmptyRows, inferTypes, sqlTableName, jsonMode]
  );

  // Generate output string based on selected format
  const outputCode = useMemo(() => {
    switch (targetFormat) {
      case "json":
        return tableToJson(tableData, convertOptions);
      case "sql":
        return tableToSql(tableData, convertOptions);
      case "markdown":
        return tableToMarkdown(tableData, convertOptions);
      case "html":
        return tableToHtml(tableData, convertOptions);
      case "csv":
        return tableToCsv(tableData, convertOptions);
      default:
        return "";
    }
  }, [tableData, targetFormat, convertOptions]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownload = () => {
    if (!outputCode) return;
    const extensions: Record<ExportFormatType, string> = {
      json: "json",
      sql: "sql",
      markdown: "md",
      html: "html",
      csv: "csv",
    };
    const mimeTypes: Record<ExportFormatType, string> = {
      json: "application/json",
      sql: "text/plain",
      markdown: "text/markdown",
      html: "text/html",
      csv: "text/csv",
    };

    const ext = extensions[targetFormat];
    const mime = mimeTypes[targetFormat];
    const blob = new Blob([outputCode], { type: `${mime};charset=utf-8` });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `table_export_${Date.now()}.${ext}`;
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
      }
    };
    reader.readAsText(file);
  };

  const getFormatLanguage = (fmt: ExportFormatType): string => {
    switch (fmt) {
      case "json":
        return "json";
      case "sql":
        return "sql";
      case "markdown":
        return "markdown";
      case "html":
        return "html";
      case "csv":
        return "text";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.tsv,.txt,.tab"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Excel / CSV 表格数据互转
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              纯本地解析 Excel 粘贴数据与 CSV 文件，支持一键多向转换为 JSON、SQL、Markdown、HTML 与标准 CSV
            </p>
          </div>
        </div>
      </div>

      {/* Format Selector Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mr-1">
            目标转换格式:
          </span>

          {[
            { id: "json", label: "JSON 数组", icon: Code2 },
            { id: "sql", label: "SQL 插入语句", icon: Database },
            { id: "markdown", label: "Markdown 表格", icon: FileText },
            { id: "html", label: "HTML 表格源码", icon: FileCode },
            { id: "csv", label: "标准 CSV", icon: FileType },
          ].map((fmt) => {
            const Icon = fmt.icon;
            return (
              <button
                key={fmt.id}
                onClick={() => setTargetFormat(fmt.id as ExportFormatType)}
                className={`px-3.5 py-2 rounded-xl border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  targetFormat === fmt.id
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs ring-2 ring-indigo-500/20"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{fmt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Options Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium select-none">
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(e) => setHasHeader(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span>首行为表头</span>
          </label>

          {targetFormat === "json" && (
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium select-none">
              <input
                type="checkbox"
                checked={inferTypes}
                onChange={(e) => setInferTypes(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>推导数字/布尔值</span>
            </label>
          )}

          {targetFormat === "sql" && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">表名:</span>
              <input
                type="text"
                value={sqlTableName}
                onChange={(e) => setSqlTableName(e.target.value)}
                placeholder="my_table"
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs w-28"
              />
            </div>
          )}
        </div>
      </div>

      {/* 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Textarea */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                原始表格内容 (直接粘贴 Excel 单元格 / CSV)
              </label>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <UploadCloud className="w-3 h-3" />
                  <span>上传 CSV/TXT</span>
                </button>
                <button
                  onClick={() => setRawText(SAMPLE_TABLE_TEXT)}
                  className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>示例</span>
                </button>
                <button
                  onClick={() => setRawText("")}
                  className="text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>清空</span>
                </button>
              </div>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="请直接在此粘贴从 Excel / WPS 复制的表格单元格，或输入逗号分隔的 CSV 内容..."
              spellCheck={false}
              className="flex-1 w-full min-h-[380px] p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed whitespace-pre"
              rows={18}
            />
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>
              识别行数: {tableData.rows.length + (hasHeader ? 1 : 0)} 行 · 列数: {tableData.headers.length} 列
            </span>
            <span>字符数: {rawText.length}</span>
          </div>
        </div>

        {/* Right: Converted Output View */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                转换排版结果 ({targetFormat.toUpperCase()})
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  disabled={!outputCode}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                  title="下载文件"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载</span>
                </button>

                <button
                  onClick={() => handleCopy("output", outputCode)}
                  disabled={!outputCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-xs transition-colors cursor-pointer"
                >
                  {copiedKey === "output" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制结果</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <CodeViewer
                code={outputCode}
                language={getFormatLanguage(targetFormat)}
                maxHeight="380px"
                placeholder="转换后的代码将在此处实时呈现..."
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>输出大小: {new Blob([outputCode]).size} 字节</span>
            <span>格式: {targetFormat.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Interactive Data Table Preview Panel */}
      {tableData.headers.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
            <TableIcon className="w-4 h-4 text-indigo-500" />
            <span>结构化表格实时预览 ({tableData.rows.length} 条记录)</span>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[300px] rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
            <table className="w-full text-left text-xs font-mono">
              <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center text-slate-400">#</th>
                  {tableData.headers.map((head, idx) => (
                    <th key={idx} className="py-2.5 px-3 whitespace-nowrap">
                      {head || `列 ${idx + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tableData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2 px-3 text-center text-slate-400 font-sans">{rIdx + 1}</td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2 px-3 whitespace-nowrap text-slate-800 dark:text-slate-200">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
