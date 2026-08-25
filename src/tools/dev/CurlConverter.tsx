import React, { useState, useMemo } from "react";
import {
  parseCurl,
  generateCodeFromCurl,
  TargetLanguage,
} from "./curlUtils";
import {
  Terminal,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Code2,
  Send,
  Globe,
  Sliders,
} from "lucide-react";

export default function CurlConverter() {
  const sampleCurl = `curl -X POST "https://api.example.com/v1/auth/login" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer my_api_key_8899" \\
  -d '{"username": "admin", "password": "securepassword123"}'`;

  const [curlInput, setCurlInput] = useState<string>(sampleCurl);
  const [targetLang, setTargetLang] = useState<TargetLanguage>("js_fetch");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const parsed = useMemo(() => parseCurl(curlInput), [curlInput]);
  const generatedCode = useMemo(
    () => generateCodeFromCurl(parsed, targetLang),
    [parsed, targetLang]
  );

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const languages: { id: TargetLanguage; label: string; group: string }[] = [
    { id: "js_fetch", label: "JavaScript (Fetch)", group: "Web 前端" },
    { id: "js_axios", label: "JavaScript (Axios)", group: "Web 前端" },
    { id: "python_requests", label: "Python (Requests)", group: "后端开发" },
    { id: "python_httpx", label: "Python (httpx / 异步)", group: "后端开发" },
    { id: "go_http", label: "Go (net/http)", group: "后端开发" },
    { id: "java_httpclient", label: "Java (HttpClient)", group: "后端开发" },
    { id: "php_curl", label: "PHP (cURL)", group: "后端开发" },
    { id: "rust_reqwest", label: "Rust (reqwest)", group: "系统级" },
    { id: "dart_http", label: "Dart / Flutter (http)", group: "移动端" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              cURL 转多语言代码
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              一键解析 cURL 命令行请求，自动生成 Fetch、Axios、Python Requests、Go、Java 等代码
            </p>
          </div>
        </div>
      </div>

      {/* Target Language Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-indigo-500" />
            <span>选择目标生成语言</span>
          </span>
          <span className="text-slate-400 font-normal font-sans">
            支持 9 种主流语言与 HTTP 库
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setTargetLang(lang.id)}
              className={`px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
                targetLang === lang.id
                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Pane Workspace: Left (cURL Input) - Right (Code Output) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: cURL Input */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              输入 cURL 命令行
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurlInput(sampleCurl)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                示例
              </button>
              <button
                onClick={() => setCurlInput("")}
                className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                清空
              </button>
            </div>
          </div>

          <textarea
            rows={14}
            value={curlInput}
            onChange={(e) => setCurlInput(e.target.value)}
            placeholder="请在此粘贴从 Chrome 开发者工具等复制的 cURL 命令..."
            className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
          />

          {parsed.url && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 text-xs space-y-1 font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
                  {parsed.method}
                </span>
                <span className="text-slate-800 dark:text-slate-200 truncate select-all">
                  {parsed.url}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-sans pt-0.5">
                包含 {Object.keys(parsed.headers).length} 个请求头
                {parsed.data ? " · 包含请求体数据" : ""}
              </div>
            </div>
          )}
        </div>

        {/* Right: Code Output */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              转换生成的代码
            </label>

            <button
              onClick={() => handleCopy("code", generatedCode)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
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

          <textarea
            rows={14}
            readOnly
            value={generatedCode}
            className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-indigo-950 dark:text-indigo-200 outline-none select-all resize-none leading-relaxed"
          />

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 font-mono">
            <span>行数: {generatedCode.split("\n").length}</span>
            <span>字符数: {generatedCode.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
