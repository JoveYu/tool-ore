import React, { useState, useRef, useMemo } from "react";
import {
  Network,
  UploadCloud,
  Search,
  RotateCcw,
  Sliders,
  FileCode,
  Globe,
  Clock,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Code2,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  HarAnalysisResult,
  HarEntryItem,
  HarResourceType,
  parseHarJson,
  formatHarBytes,
  formatHarTime,
  filterHarEntries,
} from "./harUtils";

const SAMPLE_DEMO_HAR = JSON.stringify({
  log: {
    version: "1.2",
    creator: { name: "Chrome DevTools", version: "128.0" },
    pages: [{ title: "Tool-Ore 云端工具箱" }],
    entries: [
      {
        startedDateTime: "2026-08-25T10:00:00.000Z",
        time: 120,
        request: {
          method: "GET",
          url: "https://api.tool-ore.com/v1/user/profile",
          headers: [
            { name: "Accept", value: "application/json" },
            { name: "Authorization", value: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          ],
          queryString: [{ name: "lang", value: "zh-CN" }],
        },
        response: {
          status: 200,
          statusText: "OK",
          headers: [
            { name: "Content-Type", value: "application/json; charset=utf-8" },
            { name: "Server", value: "cloudflare" },
            { name: "Cache-Control", value: "no-cache" },
          ],
          content: {
            size: 1420,
            mimeType: "application/json",
            text: JSON.stringify(
              { code: 200, message: "success", data: { id: "u_8848", name: "Jove", role: "admin", vip: true } },
              null,
              2
            ),
          },
          bodySize: 1120,
        },
        timings: { blocked: 2, dns: 18, connect: 30, ssl: 25, send: 5, wait: 32, receive: 8 },
      },
      {
        startedDateTime: "2026-08-25T10:00:00.100Z",
        time: 85,
        request: {
          method: "GET",
          url: "https://cdn.tool-ore.com/assets/index.css",
          headers: [{ name: "Accept", value: "text/css" }],
        },
        response: {
          status: 200,
          statusText: "OK",
          headers: [{ name: "Content-Type", value: "text/css" }],
          content: { size: 92400, mimeType: "text/css", text: "/* Tailwind CSS compiled stylesheet */\n:root { --primary: #6366f1; }" },
          bodySize: 13400,
        },
        timings: { blocked: 1, dns: 0, connect: 0, ssl: 0, send: 2, wait: 20, receive: 62 },
      },
      {
        startedDateTime: "2026-08-25T10:00:00.120Z",
        time: 210,
        request: {
          method: "POST",
          url: "https://api.tool-ore.com/v1/tools/stats",
          headers: [{ name: "Content-Type", value: "application/json" }],
          postData: { mimeType: "application/json", text: '{"toolId":"json-formatter","action":"execute"}' },
        },
        response: {
          status: 200,
          statusText: "OK",
          headers: [{ name: "Content-Type", value: "application/json" }],
          content: { size: 180, mimeType: "application/json", text: '{"success":true,"latencyMs":14}' },
          bodySize: 180,
        },
        timings: { blocked: 1, dns: 0, connect: 0, ssl: 0, send: 4, wait: 198, receive: 7 },
      },
      {
        startedDateTime: "2026-08-25T10:00:00.250Z",
        time: 45,
        request: {
          method: "GET",
          url: "https://img.tool-ore.com/logo-404.png",
          headers: [],
        },
        response: {
          status: 404,
          statusText: "Not Found",
          headers: [{ name: "Content-Type", value: "text/plain" }],
          content: { size: 64, mimeType: "text/plain", text: "File Not Found" },
          bodySize: 64,
        },
        timings: { blocked: 0, dns: 0, connect: 0, ssl: 0, send: 1, wait: 40, receive: 4 },
      },
    ],
  },
});

export default function HarViewer() {
  const [analysisResult, setAnalysisResult] = useState<HarAnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Selected Detail Entry
  const [selectedEntry, setSelectedEntry] = useState<HarEntryItem | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<"headers" | "query" | "response" | "timing">("headers");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const handleSelectEntry = (entry: HarEntryItem) => {
    setSelectedEntry(entry);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setFileName(file.name);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const result = parseHarJson(text);
        setAnalysisResult(result);
        setSelectedEntry(null);
      } catch (err: any) {
        setErrorMessage(err?.message || "无法解析此 HAR 文件，请确保文件格式完整有效");
        setAnalysisResult(null);
      }
    };
    reader.onerror = () => {
      setErrorMessage("读取文件失败");
    };
    reader.readAsText(file);
  };

  const handleLoadDemo = () => {
    setFileName("sample_network_trace.har");
    setErrorMessage(null);
    try {
      const result = parseHarJson(SAMPLE_DEMO_HAR);
      setAnalysisResult(result);
      setSelectedEntry(null);
    } catch (err: any) {
      setErrorMessage(err?.message);
    }
  };

  const filteredEntries = useMemo(() => {
    if (!analysisResult) return [];
    return filterHarEntries(
      analysisResult.entries,
      searchQuery,
      selectedType,
      selectedStatus
    );
  }, [analysisResult, searchQuery, selectedType, selectedStatus]);

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50";
    if (status >= 300 && status < 400) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50";
    if (status >= 400 && status < 500) return "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50";
    if (status >= 500) return "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/80 font-bold";
    return "text-slate-500 bg-slate-100 dark:bg-slate-800";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              HAR 抓包日志离线分析
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              纯本地离线解析浏览器 F12 网络请求抓包文件，支持请求耗时瀑布流分析、接口排错与敏感数据脱敏保护
            </p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".har,application/json"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Upload or Drop Area */}
      {!analysisResult ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileUpload(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900/60 rounded-3xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-4 shadow-xs"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="text-base font-semibold text-slate-800 dark:text-slate-200">
              点击选择或拖拽 .har 抓包文件到此处
            </div>
            <p className="text-xs text-slate-400">
              支持 Chrome、Edge、Firefox 导出的 HTTP Archive 文件，100% 本地内存解析，保障 Token 与 Cookie 隐私
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLoadDemo();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>载入示例 Demo 数据预览</span>
          </button>
        </div>
      ) : (
        /* Analysis Results Dashboard */
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 block font-medium">请求总数</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
                {analysisResult.summary.totalRequests}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 block font-medium">网络传输总流量</span>
              <span className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1 block">
                {formatHarBytes(analysisResult.summary.totalBytes)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 block font-medium">会话总跨度耗时</span>
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                {formatHarTime(analysisResult.summary.totalTime)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-400 block font-medium">异常与错误请求</span>
              <span className="text-xl font-bold font-mono text-rose-600 mt-1 block">
                {analysisResult.summary.statusCounts["4xx"] + analysisResult.summary.statusCounts["5xx"]}
              </span>
            </div>
          </div>

          {/* Request Table & Filters Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            {/* File Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  当前文件:
                </span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-xs sm:max-w-md">
                  {fileName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-indigo-500" />
                  <span>更换 HAR 文件</span>
                </button>
                <button
                  onClick={() => {
                    setAnalysisResult(null);
                    setSelectedEntry(null);
                    setFileName("");
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>关闭</span>
                </button>
              </div>
            </div>
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="按 URL 路径、请求方法或状态码模糊搜索..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              </div>

              {/* Resource Type Filter */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: "全部" },
                  { id: "xhr", label: "Fetch/XHR" },
                  { id: "js", label: "JS" },
                  { id: "css", label: "CSS" },
                  { id: "img", label: "图片" },
                  { id: "doc", label: "文档" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      selectedType === t.id
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 border font-bold shadow-2xs"
                        : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Request Table (Scrollable with sticky header) */}
            <div className="overflow-x-auto overflow-y-auto max-h-[360px] rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
              <table className="w-full text-left text-xs font-mono">
                <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-sans shadow-xs">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                    <th className="py-2.5 px-3 w-16">方法</th>
                    <th className="py-2.5 px-3 w-16">状态</th>
                    <th className="py-2.5 px-3 min-w-[240px]">请求地址 (URL)</th>
                    <th className="py-2.5 px-3 w-20">类型</th>
                    <th className="py-2.5 px-3 w-24 text-right">大小</th>
                    <th className="py-2.5 px-3 w-24 text-right">耗时</th>
                    <th className="py-2.5 px-3 w-40">时间瀑布流</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        未找到匹配的网络请求
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry) => {
                      // Calculate waterfall bar relative to total session duration
                      const sessionTotal = analysisResult.summary.totalTime;
                      const sessionStart = analysisResult.summary.sessionStartTime;
                      const offsetMs = Math.max(0, entry.startTime - sessionStart);
                      const leftPercent = Math.min(95, (offsetMs / sessionTotal) * 100);
                      const widthPercent = Math.max(2, Math.min(100 - leftPercent, (entry.time / sessionTotal) * 100));

                      return (
                        <tr
                          key={entry.id}
                          onClick={() => handleSelectEntry(entry)}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                            selectedEntry?.id === entry.id ? "bg-indigo-50/60 dark:bg-indigo-950/30" : ""
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center text-slate-400">{entry.index}</td>
                          <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                            {entry.method}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-1.5 py-0.5 rounded-md font-bold text-[11px] ${getStatusColor(entry.status)}`}>
                              {entry.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 truncate max-w-xs font-sans text-slate-800 dark:text-slate-200">
                            <span className="text-slate-400 mr-1">{entry.domain}</span>
                            <span>{entry.pathname}</span>
                          </td>
                          <td className="py-2.5 px-3 uppercase text-[11px] text-slate-500">{entry.resourceType}</td>
                          <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                            {formatHarBytes(entry.bodySize)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                            {formatHarTime(entry.time)}
                          </td>
                          <td className="py-2.5 px-3">
                            {/* Waterfall Bar */}
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full relative overflow-hidden">
                              <div
                                className="absolute top-0 bottom-0 bg-indigo-500 rounded-full"
                                style={{
                                  left: `${leftPercent}%`,
                                  width: `${widthPercent}%`,
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Request Detail Drawer / Inspector */}
          {selectedEntry && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <span className={`px-2 py-0.5 rounded-md ${getStatusColor(selectedEntry.status)}`}>
                    {selectedEntry.status}
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 uppercase">{selectedEntry.method}</span>
                  <span className="font-mono text-slate-500 truncate max-w-xl">{selectedEntry.url}</span>
                </div>

                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Detail Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                {[
                  { id: "headers", label: "请求与响应头" },
                  { id: "query", label: `查询参数 (${selectedEntry.queryString.length})` },
                  { id: "response", label: "响应体内容" },
                  { id: "timing", label: "耗时明细瀑布" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id as any)}
                    className={`px-3 py-2 border-b-2 font-semibold transition-all cursor-pointer ${
                      detailTab === tab.id
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Detail Tab Content */}
              <div className="text-xs space-y-3 pt-2">
                {/* 1. Headers Tab */}
                {detailTab === "headers" && (
                  <div className="space-y-4 font-mono">
                    <div className="space-y-1.5">
                      <div className="font-bold text-slate-700 dark:text-slate-300 font-sans">
                        响应头 (Response Headers)
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1 max-h-48 overflow-y-auto">
                        {selectedEntry.responseHeaders.map((h, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">{h.name}:</span>
                            <span className="text-slate-700 dark:text-slate-300 break-all select-all">{h.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="font-bold text-slate-700 dark:text-slate-300 font-sans">
                        请求头 (Request Headers)
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1 max-h-48 overflow-y-auto">
                        {selectedEntry.requestHeaders.map((h, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-slate-500 font-bold shrink-0">{h.name}:</span>
                            <span className="text-slate-700 dark:text-slate-300 break-all select-all">{h.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Query Params Tab */}
                {detailTab === "query" && (
                  <div className="space-y-2">
                    {selectedEntry.queryString.length === 0 ? (
                      <div className="p-4 text-center text-slate-400">此请求无 URL 查询参数</div>
                    ) : (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden font-mono">
                        <table className="w-full">
                          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
                            <tr>
                              <th className="p-2.5 text-left w-1/3">参数名 (Key)</th>
                              <th className="p-2.5 text-left">参数值 (Value)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {selectedEntry.queryString.map((q, i) => (
                              <tr key={i}>
                                <td className="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">{q.name}</td>
                                <td className="p-2.5 text-slate-700 dark:text-slate-300 break-all select-all">{q.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Response Body Tab */}
                {detailTab === "response" && (
                  <div className="space-y-2">
                    {selectedEntry.responseBody?.text ? (
                      <div className="relative">
                        <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs max-h-72 overflow-y-auto whitespace-pre-wrap break-all leading-relaxed">
                          {selectedEntry.responseBody.text}
                        </pre>
                        <button
                          onClick={() => handleCopy("resp_body", selectedEntry.responseBody?.text || "")}
                          className="absolute right-3 top-3 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === "resp_body" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>复制响应</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-400">该请求未抓取或无响应体文本内容</div>
                    )}
                  </div>
                )}

                {/* 4. Timing Breakdown Tab */}
                {detailTab === "timing" && (
                  <div className="space-y-3 font-mono">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] text-slate-400 font-sans block">DNS 解析</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {formatHarTime(selectedEntry.timings.dns)}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] text-slate-400 font-sans block">TCP 连接</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {formatHarTime(selectedEntry.timings.connect)}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] text-slate-400 font-sans block">SSL 握手</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {formatHarTime(selectedEntry.timings.ssl)}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] text-slate-400 font-sans block">等待首包 (TTFB)</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {formatHarTime(selectedEntry.timings.wait)}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] text-slate-400 font-sans block">内容下载</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatHarTime(selectedEntry.timings.receive)}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] text-slate-400 font-sans block">总耗时</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatHarTime(selectedEntry.time)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
