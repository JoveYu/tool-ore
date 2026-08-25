import React, { useState, useEffect, useMemo } from "react";
import { parseUserAgent, UA_PRESETS, UaParsedResult } from "./uaUtils";
import {
  Monitor,
  Copy,
  Check,
  RotateCcw,
  Smartphone,
  Tablet,
  Laptop,
  Cpu,
  Globe,
  Bot,
  Sparkles,
  Layers,
} from "lucide-react";

export default function UaParserTool() {
  const [uaInput, setUaInput] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 初始化使用当前浏览器的真实 UA
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setUaInput(navigator.userAgent);
    }
  }, []);

  const parsed: UaParsedResult = useMemo(() => parseUserAgent(uaInput), [uaInput]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="w-6 h-6 text-indigo-500" />;
      case "tablet":
        return <Tablet className="w-6 h-6 text-indigo-500" />;
      case "bot":
        return <Bot className="w-6 h-6 text-purple-500" />;
      case "desktop":
      default:
        return <Laptop className="w-6 h-6 text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              User-Agent 设备与浏览器解析
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              精准解析操作系统、浏览器内核版本、设备型号、CPU 架构与搜索引擎爬虫标识
            </p>
          </div>
        </div>
      </div>

      {/* Preset UA Quick Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>预设常用设备 User-Agent</span>
          </span>
          <button
            onClick={() => setUaInput(typeof navigator !== "undefined" ? navigator.userAgent : "")}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            读取当前浏览器 UA
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {UA_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setUaInput(preset.ua)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-all cursor-pointer shadow-2xs"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            输入待解析的 User-Agent 字符串
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy("raw_ua", uaInput)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === "raw_ua" ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              复制 UA
            </button>
            <button
              onClick={() => setUaInput("")}
              className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              清空
            </button>
          </div>
        </div>

        <textarea
          rows={3}
          value={uaInput}
          onChange={(e) => setUaInput(e.target.value)}
          placeholder="粘贴待解析的 User-Agent 字符串..."
          className="w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none leading-relaxed break-all"
        />
      </div>

      {/* Main Analysis Results Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Browser */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">浏览器名称</span>
            <Globe className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="font-bold text-base text-slate-900 dark:text-white truncate">
            {parsed.browser.name}
          </div>
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            版本: {parsed.browser.version || "未知"}
          </div>
        </div>

        {/* Operating System */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">操作系统</span>
            <Laptop className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="font-bold text-base text-slate-900 dark:text-white truncate">
            {parsed.os.name}
          </div>
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            版本: {parsed.os.version || "未知"}
          </div>
        </div>

        {/* Device & Vendor */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">设备形态与厂商</span>
            {getDeviceIcon(parsed.device.type)}
          </div>
          <div className="font-bold text-base text-slate-900 dark:text-white truncate">
            {parsed.device.vendor || (parsed.device.type === "desktop" ? "桌面电脑" : "移动设备")}
          </div>
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            型号: {parsed.device.model || parsed.device.type}
          </div>
        </div>

        {/* Engine & CPU */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">渲染内核与架构</span>
            <Cpu className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="font-bold text-base text-slate-900 dark:text-white truncate">
            {parsed.engine.name}
          </div>
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            架构: {parsed.cpu.architecture || "自动适配"}
          </div>
        </div>
      </div>

      {/* JSON Output & Quick Copy */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <span>结构化解析数据 (JSON)</span>
          <button
            onClick={() => handleCopy("json", JSON.stringify(parsed, null, 2))}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
          >
            {copiedKey === "json" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>已复制 JSON</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>复制 JSON</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 font-mono text-xs text-indigo-950 dark:text-indigo-200 overflow-x-auto select-all leading-relaxed">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      </div>
    </div>
  );
}
