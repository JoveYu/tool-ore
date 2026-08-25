import React, { useState, useEffect, useMemo } from "react";
import {
  MockFieldConfig,
  MockFieldType,
  generateMockRecords,
  formatMockDataOutput,
} from "./mockDataUtils";
import { CodeViewer } from "../../components/CodeViewer";
import {
  TableProperties,
  Copy,
  Check,
  RefreshCw,
  Download,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  Database,
  FileSpreadsheet,
  Code2,
} from "lucide-react";

export default function MockDataGenerator() {
  const defaultFields: MockFieldConfig[] = [
    { id: "1", name: "用户姓名", key: "username", type: "name" },
    { id: "2", name: "手机号码", key: "phone", type: "phone" },
    { id: "3", name: "电子邮箱", key: "email", type: "email" },
    { id: "4", name: "身份证号", key: "idcard", type: "idcard" },
    { id: "5", name: "居住地址", key: "address", type: "address" },
    { id: "6", name: "职业职位", key: "job", type: "job" },
  ];

  const [fields, setFields] = useState<MockFieldConfig[]>(defaultFields);
  const [quantity, setQuantity] = useState<number>(10);
  const [formatType, setFormatType] = useState<"json" | "csv" | "sql">("json");
  const [tableName, setTableName] = useState<string>("users");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [records, setRecords] = useState<Record<string, any>[]>([]);

  const handleRegenerate = () => {
    const data = generateMockRecords(fields, quantity);
    setRecords(data);
  };

  useEffect(() => {
    handleRegenerate();
  }, [fields, quantity]);

  const outputString = useMemo(
    () => formatMockDataOutput(records, formatType, tableName),
    [records, formatType, tableName]
  );

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownload = () => {
    if (!outputString) return;
    const ext = formatType === "json" ? "json" : formatType === "csv" ? "csv" : "sql";
    const mime =
      formatType === "json"
        ? "application/json"
        : formatType === "csv"
        ? "text/csv"
        : "text/sql";
    const blob = new Blob([outputString], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mock_data_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddField = () => {
    const newField: MockFieldConfig = {
      id: Math.random().toString(36).slice(2, 9),
      name: "新字段",
      key: `field_${fields.length + 1}`,
      type: "name",
    };
    setFields([...fields, newField]);
  };

  const handleRemoveField = (id: string) => {
    if (fields.length <= 1) return;
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleUpdateField = (id: string, prop: keyof MockFieldConfig, val: any) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, [prop]: val } : f)));
  };

  const availableFieldTypes: { type: MockFieldType; label: string }[] = [
    { type: "name", label: "中文姓名" },
    { type: "phone", label: "手机号码" },
    { type: "email", label: "电子邮箱" },
    { type: "idcard", label: "二代身份证号" },
    { type: "address", label: "详细地址" },
    { type: "job", label: "职业头衔" },
    { type: "bank_card", label: "银行卡号" },
    { type: "ip", label: "IPv4 地址" },
    { type: "datetime", label: "日期时间" },
    { type: "uuid", label: "UUID 唯一标识" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <TableProperties className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              占位测试假数据生成器
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              自定义表结构批量生成姓名、手机号、合规身份证、邮箱等 Mock 数据，支持 JSON、CSV 与 SQL 导出
            </p>
          </div>
        </div>
      </div>

      {/* Field Configuration Schema */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <span>数据表字段配置 ({fields.length} 个字段)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>重新生成</span>
            </button>

            <button
              onClick={handleAddField}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加字段</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {fields.map((field) => (
            <div
              key={field.id}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => handleUpdateField(field.id, "name", e.target.value)}
                  placeholder="字段名称"
                  className="font-bold text-xs bg-transparent border-0 text-slate-800 dark:text-slate-200 outline-none w-28"
                />
                <button
                  onClick={() => handleRemoveField(field.id)}
                  disabled={fields.length <= 1}
                  className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => handleUpdateField(field.id, "key", e.target.value)}
                  placeholder="JSON Key"
                  className="px-2 py-1 font-mono rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                />

                <select
                  value={field.type}
                  onChange={(e) => handleUpdateField(field.id, "type", e.target.value as any)}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none font-medium"
                >
                  {availableFieldTypes.map((t) => (
                    <option key={t.type} value={t.type}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Quantity & Format Controls */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-700 dark:text-slate-300">生成行数:</span>
            {[5, 10, 20, 50, 100].map((n) => (
              <button
                key={n}
                onClick={() => setQuantity(n)}
                className={`px-3 py-1 rounded-lg border font-mono font-bold transition-all cursor-pointer ${
                  quantity === n
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {n} 条
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">导出格式:</span>
            {[
              { id: "json", label: "JSON 格式" },
              { id: "csv", label: "CSV 表格" },
              { id: "sql", label: "SQL INSERT" },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setFormatType(fmt.id as any)}
                className={`px-3 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                  formatType === fmt.id
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Output & Table Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <span>生成结果预览 ({records.length} 条数据)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载文件</span>
            </button>

            <button
              onClick={() => handleCopy("output", outputString)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {copiedKey === "output" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制数据</span>
                </>
              )}
            </button>
          </div>
        </div>

        <CodeViewer
          code={outputString}
          language={formatType === "json" ? "json" : formatType === "sql" ? "sql" : "plaintext"}
          maxHeight="380px"
        />
      </div>
    </div>
  );
}
