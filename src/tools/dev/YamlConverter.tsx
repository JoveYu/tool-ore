import React, { useState, useEffect, useMemo } from "react";
import { yamlToJson, jsonToYaml, YamlConvertResult } from "./yamlUtils";
import { CodeViewer } from "../../components/CodeViewer";
import {
  FileCode2,
  Copy,
  Check,
  RotateCcw,
  ArrowRightLeft,
  Download,
  AlertCircle,
  Sparkles,
} from "lucide-react";

type Mode = "yaml_to_json" | "json_to_yaml";

export default function YamlConverter() {
  const [mode, setMode] = useState<Mode>("yaml_to_json");
  const [indent, setIndent] = useState<number>(2);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const sampleYaml = `name: tool-ore
version: 1.0.0
description: 轻量级纯前端在线工具集合
server:
  host: 0.0.0.0
  port: 8787
  ssl: true
features:
  - id: crypto
    enabled: true
  - id: dev
    enabled: true
  - id: text
    enabled: true
tags:
  - web
  - tools
  - cloudflare`;

  const [inputContent, setInputContent] = useState<string>(sampleYaml);

  const converted: YamlConvertResult = useMemo(() => {
    if (!inputContent.trim()) {
      return { isValid: true, result: "" };
    }
    if (mode === "yaml_to_json") {
      return yamlToJson(inputContent, indent);
    } else {
      return jsonToYaml(inputContent, indent);
    }
  }, [inputContent, mode, indent]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleSwap = () => {
    if (converted.isValid && converted.result) {
      setInputContent(converted.result);
      setMode(mode === "yaml_to_json" ? "json_to_yaml" : "yaml_to_json");
    } else {
      setMode(mode === "yaml_to_json" ? "json_to_yaml" : "yaml_to_json");
    }
  };

  const handleDownload = () => {
    if (!converted.result) return;
    const ext = mode === "yaml_to_json" ? "json" : "yaml";
    const mime = mode === "yaml_to_json" ? "application/json" : "text/yaml";
    const blob = new Blob([converted.result], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadSample = () => {
    if (mode === "yaml_to_json") {
      setInputContent(sampleYaml);
    } else {
      setInputContent(
        JSON.stringify(
          {
            name: "tool-ore",
            version: "1.0.0",
            server: { host: "0.0.0.0", port: 8787, ssl: true },
            features: ["crypto", "dev", "text", "image"],
          },
          null,
          indent
        )
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                YAML 与 JSON 互转
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                配置文件双向实时互转、语法校验排错与格式化一键导出
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium self-start sm:self-center">
            <button
              onClick={() => {
                setMode("yaml_to_json");
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "yaml_to_json"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              YAML 转 JSON
            </button>
            <button
              onClick={() => {
                setMode("json_to_yaml");
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "json_to_yaml"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              JSON 转 YAML
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSwap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
            <span>对调转换方向</span>
          </button>

          <button
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>载入示例</span>
          </button>

          <button
            onClick={() => setInputContent("")}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>清空</span>
          </button>
        </div>

        {/* Indent option */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">缩进空格:</span>
          {[2, 4].map((ind) => (
            <button
              key={ind}
              onClick={() => setIndent(ind)}
              className={`px-2.5 py-1 rounded-lg border font-medium cursor-pointer transition-all ${
                indent === ind
                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {ind} 空格
            </button>
          ))}
        </div>
      </div>

      {/* Two-Pane Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Pane */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {mode === "yaml_to_json" ? "输入 YAML 文本" : "输入 JSON 文本"}
            </label>

            <span className="text-[11px] text-slate-400 font-mono">
              {inputContent.length} 字符 · {inputContent.split("\n").length} 行
            </span>
          </div>

          <textarea
            rows={16}
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder={mode === "yaml_to_json" ? "请输入或粘贴 YAML 文本..." : "请输入或粘贴 JSON 文本..."}
            className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />

          {!converted.isValid && converted.error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">语法解析错误</div>
                <div className="mt-0.5 break-all font-mono text-[11px]">{converted.error.message}</div>
                {converted.error.line && (
                  <div className="mt-1 text-[11px] font-mono">
                    错误位置: 第 {converted.error.line} 行
                    {converted.error.column ? ` 第 ${converted.error.column} 列` : ""}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Converted Output Pane */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {mode === "yaml_to_json" ? "转换输出 JSON" : "转换输出 YAML"}
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={!converted.result}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                title="下载文件"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载</span>
              </button>

              <button
                onClick={() => handleCopy("output", converted.result)}
                disabled={!converted.result}
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

          <CodeViewer
            code={converted.result}
            language={mode === "yaml_to_json" ? "json" : "yaml"}
            maxHeight="420px"
            placeholder="转换结果将实时展示在此处..."
          />

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>字符数: {converted.result.length}</span>
            <span>大小: {new Blob([converted.result]).size} Bytes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
