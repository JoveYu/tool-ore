import React, { useState } from "react";
import {
  HttpMethod,
  KeyValueItem,
  HttpRequestOptions,
  HttpResponseData,
  HTTP_PRESETS,
  sendHttpRequest,
} from "./httpTesterUtils";
import { CodeViewer } from "../../components/CodeViewer";
import {
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Code2,
  Layers,
} from "lucide-react";

type RequestSubTab = "params" | "headers" | "body";

export default function HttpRequestTester() {
  const [url, setUrl] = useState<string>("https://jsonplaceholder.typicode.com/posts/1");
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [queryParams, setQueryParams] = useState<KeyValueItem[]>([]);
  const [headers, setHeaders] = useState<KeyValueItem[]>([
    { id: "1", key: "Accept", value: "application/json", enabled: true },
  ]);
  const [bodyType, setBodyType] = useState<"none" | "json" | "text">("none");
  const [bodyContent, setBodyContent] = useState<string>('{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}');
  const [timeoutMs, setTimeoutMs] = useState<number>(10000);

  const [activeSubTab, setActiveSubTab] = useState<RequestSubTab>("params");
  const [responseTab, setResponseTab] = useState<"body" | "headers">("body");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<HttpResponseData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleSend = async () => {
    setIsLoading(true);
    setResponse(null);

    const options: HttpRequestOptions = {
      url,
      method,
      headers,
      queryParams,
      bodyType,
      bodyContent,
      timeoutMs,
    };

    try {
      const res = await sendHttpRequest(options);
      setResponse(res);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleApplyPreset = (preset: (typeof HTTP_PRESETS)[0]) => {
    setUrl(preset.url);
    setMethod(preset.method);
    if (preset.method === "POST") {
      setBodyType("json");
    } else {
      setBodyType("none");
    }
  };

  const methods: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              HTTP 接口在线测试与调试
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              支持 GET、POST、PUT 等方法在线发包测试、请求头与 JSON 体编辑、响应耗时测速与状态查看
            </p>
          </div>
        </div>
      </div>

      {/* Main Request URL Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">快速预设:</span>
          {HTTP_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleApplyPreset(p)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer shadow-2xs"
            >
              {p.name.split(" ")[0]}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Method Selector */}
          <select
            value={method}
            onChange={(e) => {
              const m = e.target.value as HttpMethod;
              setMethod(m);
              if (m === "POST" || m === "PUT" || m === "PATCH") {
                setBodyType("json");
              }
            }}
            className="px-3.5 py-3 font-bold font-mono text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 outline-none cursor-pointer"
          >
            {methods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* URL Input */}
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/v1/resource..."
            className="flex-1 px-4 py-3 font-mono text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={isLoading || !url.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
          >
            {isLoading ? (
              <span>请求发送中...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>发送请求</span>
              </>
            )}
          </button>
        </div>

        {/* Request Sub-Tabs */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs">
            {[
              { id: "params", label: `Query 参数 (${queryParams.filter((p) => p.enabled).length})` },
              { id: "headers", label: `请求头 (${headers.filter((h) => h.enabled).length})` },
              { id: "body", label: `请求体 (${bodyType !== "none" ? bodyType.toUpperCase() : "无"})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeSubTab === tab.id
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub Tab: Query Params */}
          {activeSubTab === "params" && (
            <div className="space-y-2">
              {queryParams.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-xs font-mono">
                  <input
                    type="checkbox"
                    checked={p.enabled}
                    onChange={(e) =>
                      setQueryParams(
                        queryParams.map((item) =>
                          item.id === p.id ? { ...item, enabled: e.target.checked } : item
                        )
                      )
                    }
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={p.key}
                    onChange={(e) =>
                      setQueryParams(
                        queryParams.map((item) =>
                          item.id === p.id ? { ...item, key: e.target.value } : item
                        )
                      )
                    }
                    placeholder="参数名 Key"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                  <input
                    type="text"
                    value={p.value}
                    onChange={(e) =>
                      setQueryParams(
                        queryParams.map((item) =>
                          item.id === p.id ? { ...item, value: e.target.value } : item
                        )
                      )
                    }
                    placeholder="参数值 Value"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                  <button
                    onClick={() => setQueryParams(queryParams.filter((item) => item.id !== p.id))}
                    className="p-1.5 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setQueryParams([
                    ...queryParams,
                    { id: Math.random().toString(36).slice(2, 9), key: "", value: "", enabled: true },
                  ])
                }
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加 Query 参数</span>
              </button>
            </div>
          )}

          {/* Sub Tab: Headers */}
          {activeSubTab === "headers" && (
            <div className="space-y-2">
              {headers.map((h) => (
                <div key={h.id} className="flex items-center gap-2 text-xs font-mono">
                  <input
                    type="checkbox"
                    checked={h.enabled}
                    onChange={(e) =>
                      setHeaders(
                        headers.map((item) =>
                          item.id === h.id ? { ...item, enabled: e.target.checked } : item
                        )
                      )
                    }
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={h.key}
                    onChange={(e) =>
                      setHeaders(
                        headers.map((item) =>
                          item.id === h.id ? { ...item, key: e.target.value } : item
                        )
                      )
                    }
                    placeholder="请求头 Header"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                  <input
                    type="text"
                    value={h.value}
                    onChange={(e) =>
                      setHeaders(
                        headers.map((item) =>
                          item.id === h.id ? { ...item, value: e.target.value } : item
                        )
                      )
                    }
                    placeholder="请求头值 Value"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                  <button
                    onClick={() => setHeaders(headers.filter((item) => item.id !== h.id))}
                    className="p-1.5 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setHeaders([
                    ...headers,
                    { id: Math.random().toString(36).slice(2, 9), key: "", value: "", enabled: true },
                  ])
                }
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加请求头</span>
              </button>
            </div>
          )}

          {/* Sub Tab: Body */}
          {activeSubTab === "body" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs">
                {(["none", "json", "text"] as const).map((t) => (
                  <label key={t} className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="bodyType"
                      checked={bodyType === t}
                      onChange={() => setBodyType(t)}
                      className="text-indigo-600"
                    />
                    <span className="text-slate-700 dark:text-slate-300 uppercase">
                      {t === "none" ? "无请求体" : t}
                    </span>
                  </label>
                ))}
              </div>

              {bodyType !== "none" && (
                <textarea
                  rows={6}
                  value={bodyContent}
                  onChange={(e) => setBodyContent(e.target.value)}
                  placeholder="请输入请求体内容..."
                  className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Response Panel */}
      {response && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span
                className={`font-mono font-bold text-xs px-3 py-1 rounded-xl border ${
                  response.success
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                }`}
              >
                {response.status > 0 ? `${response.status} ${response.statusText}` : "请求失败"}
              </span>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  {response.timeMs} ms
                </span>
                <span>大小: {response.sizeBytes} Bytes</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                <button
                  onClick={() => setResponseTab("body")}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    responseTab === "body"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  响应主体
                </button>
                <button
                  onClick={() => setResponseTab("headers")}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    responseTab === "headers"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  响应头 ({Object.keys(response.headers).length})
                </button>
              </div>

              <button
                onClick={() => handleCopy("resp", response.data)}
                disabled={!response.data}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {copiedKey === "resp" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>复制响应</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {response.error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">请求失败提示</div>
                <div className="mt-0.5 leading-relaxed">{response.error}</div>
              </div>
            </div>
          )}

          {responseTab === "body" ? (
            <CodeViewer
              code={response.data}
              language={response.isJson ? "json" : "plaintext"}
              maxHeight="380px"
              placeholder="无响应内容"
            />
          ) : (
            <div className="overflow-x-auto max-h-80 border border-slate-100 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Object.entries(response.headers).map(([k, v]) => (
                    <tr key={k} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-4 font-bold text-indigo-600 dark:text-indigo-400 w-1/3">
                        {k}
                      </td>
                      <td className="py-2 px-4 text-slate-800 dark:text-slate-200 break-all select-all">
                        {v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
