import React, { useState, useMemo } from "react";
import {
  jsonToTypeScript,
  JsonToTsOptions,
  DEFAULT_JSON_TO_TS_OPTIONS,
} from "./jsonToTsUtils";
import {
  FileCode2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  Download,
  AlertCircle,
  Code,
} from "lucide-react";

export default function JsonToTsConverter() {
  const sampleJson = `{
  "status": "success",
  "code": 200,
  "data": {
    "userId": "usr_9988",
    "profile": {
      "nickname": "极速开发者",
      "avatarUrl": "https://example.com/avatar.png",
      "roles": ["admin", "developer"],
      "level": 5
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 7200
    },
    "isVerified": true
  },
  "meta": {
    "timestamp": 1700000000,
    "requestId": "req_abc123"
  }
}`;

  const [inputJson, setInputJson] = useState<string>(sampleJson);
  const [rootName, setRootName] = useState<string>("ApiResponse");
  const [useType, setUseType] = useState<boolean>(false);
  const [readonlyProps, setReadonlyProps] = useState<boolean>(false);
  const [exportKeyword, setExportKeyword] = useState<boolean>(true);
  const [optionalNulls, setOptionalNulls] = useState<boolean>(false);
  const [indent, setIndent] = useState<number>(2);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const options: JsonToTsOptions = useMemo(
    () => ({
      rootName,
      useType,
      readonlyProps,
      exportKeyword,
      optionalNulls,
      indent,
    }),
    [rootName, useType, readonlyProps, exportKeyword, optionalNulls, indent]
  );

  const convertedResult = useMemo(
    () => jsonToTypeScript(inputJson, options),
    [inputJson, options]
  );

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownload = () => {
    if (!convertedResult.result) return;
    const blob = new Blob([convertedResult.result], { type: "text/typescript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rootName || "types"}.d.ts`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <FileCode2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              JSON 转 TypeScript 接口声明
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              自动递归推导 JSON 嵌套对象与数组类型，生成标准 Interface / Type 声明文件
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <span>类型生成规则设置</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Root Interface Name */}
          <div className="space-y-1.5">
            <label className="font-medium text-slate-700 dark:text-slate-300">根接口名称</label>
            <input
              type="text"
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              placeholder="例如: UserResponse"
              className="w-full px-3 py-1.5 font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
            />
          </div>

          {/* Declaration Style */}
          <div className="space-y-1.5">
            <label className="font-medium text-slate-700 dark:text-slate-300">声明方式</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setUseType(false)}
                className={`py-1.5 rounded-lg border font-semibold text-center transition-all cursor-pointer ${
                  !useType
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                interface
              </button>
              <button
                onClick={() => setUseType(true)}
                className={`py-1.5 rounded-lg border font-semibold text-center transition-all cursor-pointer ${
                  useType
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                type
              </button>
            </div>
          </div>

          {/* Indent Spaces */}
          <div className="space-y-1.5">
            <label className="font-medium text-slate-700 dark:text-slate-300">缩进格式</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[2, 4].map((ind) => (
                <button
                  key={ind}
                  onClick={() => setIndent(ind)}
                  className={`py-1.5 rounded-lg border font-mono font-bold transition-all cursor-pointer ${
                    indent === ind
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {ind} 空格
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col justify-center space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={exportKeyword}
                onChange={(e) => setExportKeyword(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">添加 export 关键字</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={readonlyProps}
                onChange={(e) => setReadonlyProps(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">添加 readonly 只读修饰</span>
            </label>
          </div>
        </div>
      </div>

      {/* Editor & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              输入原始 JSON 数据
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setInputJson(sampleJson)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                示例
              </button>
              <button
                onClick={() => setInputJson("")}
                className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                清空
              </button>
            </div>
          </div>

          <textarea
            rows={16}
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder="在此粘贴 JSON 文本..."
            className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
          />

          {!convertedResult.isValid && convertedResult.error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{convertedResult.error}</span>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              生成的 TypeScript 类型代码
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={!convertedResult.result}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                title="下载 .d.ts 文件"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载 .d.ts</span>
              </button>

              <button
                onClick={() => handleCopy("result", convertedResult.result)}
                disabled={!convertedResult.result}
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
                    <span>复制 TS 代码</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <textarea
            rows={16}
            readOnly
            value={convertedResult.result}
            placeholder="生成的 TypeScript 类型定义将呈现在此处..."
            className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-indigo-950 dark:text-indigo-200 outline-none select-all resize-none leading-relaxed"
          />

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 font-mono">
            <span>字符数: {convertedResult.result.length}</span>
            <span>行数: {convertedResult.result ? convertedResult.result.split("\n").length : 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
