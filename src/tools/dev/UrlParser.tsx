import React, { useState, useEffect, useMemo } from "react";
import {
  parseUrl,
  buildUrlFromParts,
  paramsToJson,
  jsonToParams,
  QueryParamItem,
} from "./urlUtils";
import {
  Link as LinkIcon,
  Copy,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Code2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function UrlParser() {
  const [rawUrl, setRawUrl] = useState<string>(
    "https://api.example.com:8080/v1/search?query=前端工具&page=1&sort=desc&filter=open#results"
  );
  const [baseUrl, setBaseUrl] = useState<string>("https://api.example.com:8080/v1/search");
  const [hash, setHash] = useState<string>("#results");
  const [params, setParams] = useState<QueryParamItem[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // JSON 转换模式开关
  const [showJsonMode, setShowJsonMode] = useState<boolean>(false);
  const [jsonContent, setJsonContent] = useState<string>("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // 初始化解析
  useEffect(() => {
    handleParseFromRaw(rawUrl);
  }, []);

  const handleParseFromRaw = (text: string) => {
    const res = parseUrl(text);
    if (res.isValid) {
      const pathPart = res.origin ? `${res.origin}${res.pathname}` : res.pathname;
      setBaseUrl(pathPart || text.split("?")[0].split("#")[0]);
      setHash(res.hash);
      setParams(res.params);
      setJsonContent(paramsToJson(res.params));
    }
  };

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // 动态重新拼装完整 URL
  const reconstructedUrl = useMemo(() => {
    return buildUrlFromParts(baseUrl, params, hash);
  }, [baseUrl, params, hash]);

  // 修改单个参数
  const handleUpdateParam = (id: string, field: "key" | "value" | "enabled", val: any) => {
    const updated = params.map((p) => (p.id === id ? { ...p, [field]: val } : p));
    setParams(updated);
    setJsonContent(paramsToJson(updated));
  };

  // 删除单个参数
  const handleDeleteParam = (id: string) => {
    const updated = params.filter((p) => p.id !== id);
    setParams(updated);
    setJsonContent(paramsToJson(updated));
  };

  // 添加新参数行
  const handleAddParam = () => {
    const newParam: QueryParamItem = {
      id: Math.random().toString(36).slice(2, 9),
      key: "",
      value: "",
      enabled: true,
    };
    const updated = [...params, newParam];
    setParams(updated);
  };

  // URL 编解码快捷操作
  const handleEncodeComponent = () => {
    try {
      setRawUrl(encodeURIComponent(rawUrl));
    } catch {}
  };

  const handleDecodeComponent = () => {
    try {
      const decoded = decodeURIComponent(rawUrl);
      setRawUrl(decoded);
      handleParseFromRaw(decoded);
    } catch {}
  };

  // 从 JSON 同步参数
  const handleApplyJson = () => {
    const res = jsonToParams(jsonContent);
    if (!res.isValid) {
      setJsonError(res.error || "JSON 格式有误");
      return;
    }
    setJsonError(null);
    setParams(res.params);
    setShowJsonMode(false);
  };

  const parsedDetails = useMemo(() => parseUrl(reconstructedUrl), [reconstructedUrl]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <LinkIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              URL 参数解析与编解码
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              URL 路由路径分解、Query 查询参数可视化表格编辑、URI 编解码与 JSON 键值转换
            </p>
          </div>
        </div>
      </div>

      {/* Raw Input Box & Quick Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            输入或粘贴原始 URL / 查询字符串
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDecodeComponent}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              URL 解码
            </button>
            <button
              onClick={handleEncodeComponent}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              URL 编码
            </button>
            <button
              onClick={() => {
                setRawUrl("");
                setBaseUrl("");
                setHash("");
                setParams([]);
              }}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              清空
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            rows={3}
            value={rawUrl}
            onChange={(e) => {
              setRawUrl(e.target.value);
              handleParseFromRaw(e.target.value);
            }}
            placeholder="请输入完整 URL 或查询参数 (例如: https://example.com/search?q=test&page=1)..."
            className="w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
          />
        </div>
      </div>

      {/* URL Structural Components Inspector */}
      {parsedDetails.isValid && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            URL 组成结构分解
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 block font-sans">协议 (Protocol)</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 select-all break-all">
                {parsedDetails.protocol || "-"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 lg:col-span-2">
              <span className="text-[11px] text-slate-400 block font-sans">域名主机 (Host)</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 select-all break-all">
                {parsedDetails.host || "-"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 block font-sans">端口 (Port)</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 select-all">
                {parsedDetails.port || "默认"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 lg:col-span-2">
              <span className="text-[11px] text-slate-400 block font-sans">请求路径 (Path)</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 select-all break-all">
                {parsedDetails.pathname || "/"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Query Parameters Visual Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs space-y-0">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              查询参数列表
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              {params.length} 项
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowJsonMode(!showJsonMode);
                setJsonContent(paramsToJson(params));
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>{showJsonMode ? "返回表格编辑" : "JSON 模式"}</span>
            </button>

            <button
              onClick={handleAddParam}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加参数</span>
            </button>
          </div>
        </div>

        {showJsonMode ? (
          /* JSON Mode Editor */
          <div className="p-6 space-y-4">
            <div className="text-xs text-slate-500">
              可直接在下方编辑 JSON 键值对对象，编辑完成后点击“应用并同步到表格”：
            </div>

            <textarea
              rows={8}
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              className="w-full p-4 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />

            {jsonError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-500">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{jsonError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowJsonMode(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleApplyJson}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
              >
                应用并同步到表格
              </button>
            </div>
          </div>
        ) : (
          /* Visual Table Editor */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 uppercase bg-slate-50/30 dark:bg-slate-800/10">
                  <th className="py-3 px-4 font-semibold w-12 text-center">启用</th>
                  <th className="py-3 px-4 font-semibold w-1/3">参数名 (Key)</th>
                  <th className="py-3 px-4 font-semibold">参数值 (Value)</th>
                  <th className="py-3 px-4 font-semibold w-16 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {params.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      !p.enabled ? "opacity-40" : ""
                    }`}
                  >
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={p.enabled}
                        onChange={(e) => handleUpdateParam(p.id, "enabled", e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        value={p.key}
                        onChange={(e) => handleUpdateParam(p.id, "key", e.target.value)}
                        placeholder="键名..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white outline-none font-bold"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        value={p.value}
                        onChange={(e) => handleUpdateParam(p.id, "value", e.target.value)}
                        placeholder="键值..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteParam(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="删除此项"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {params.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-sans text-xs">
                      当前无参数，点击右上角“添加参数”新增键值对
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reconstructed URL Output Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>实时拼装生成 URL</span>
          </div>

          <div className="flex items-center gap-2">
            {reconstructedUrl.startsWith("http") && (
              <a
                href={reconstructedUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>浏览器打开</span>
              </a>
            )}

            <button
              onClick={() => handleCopy("recon", reconstructedUrl)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
            >
              {copiedKey === "recon" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制完整 URL</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 font-mono text-xs text-indigo-950 dark:text-indigo-200 break-all select-all leading-relaxed">
          {reconstructedUrl || "（请输入有效的基础 URL 与参数）"}
        </div>
      </div>
    </div>
  );
}
