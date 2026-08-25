import React, { useState, useMemo, useRef } from "react";
import {
  optimizeSvg,
  SvgOptimizeOptions,
  DEFAULT_SVG_OPTIONS,
  SvgOptimizeResult,
} from "./svgOptimizerUtils";
import { CodeViewer } from "../../components/CodeViewer";
import {
  FileCode,
  Copy,
  Check,
  RotateCcw,
  Download,
  Upload,
  Sliders,
  Sparkles,
  Eye,
  Code2,
  Layers,
  AlertCircle,
} from "lucide-react";

export default function SvgOptimizer() {
  const sampleSvg = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Generator: Adobe Illustrator 25.0, SVG Export Plug-In -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" width="100.0000" height="100.0000" xml:space="preserve">
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description about="" />
    </rdf:RDF>
  </metadata>
  <g id="Layer_1">
    <g id="Unused_Group"></g>
    <circle cx="50.1234" cy="50.5678" r="40.2345" fill="#6366F1" stroke="#4F46E5" stroke-width="4.0000" />
    <path d="M 35.1234 50.4567 L 45.7890 61.1234 L 65.4567 41.7890" fill="none" stroke="#FFFFFF" stroke-width="5.0000" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>`;

  const [svgInput, setSvgInput] = useState<string>(sampleSvg);
  const [options, setOptions] = useState<SvgOptimizeOptions>(DEFAULT_SVG_OPTIONS);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "preview" | "react" | "datauri">("preview");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const result: SvgOptimizeResult = useMemo(
    () => optimizeSvg(svgInput, options),
    [svgInput, options]
  );

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setSvgInput(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!result.optimizedSvg) return;
    const blob = new Blob([result.optimizedSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optimized_${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                SVG 压缩与代码优化
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                清除 SVG 冗余编辑器元数据与注释、缩减路径精度，导出轻量化 SVG、DataURI 与 React 组件
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span>上传 SVG 文件</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Compression Stats */}
      {result.isValid && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">原始体积</span>
            <span className="font-mono text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 block">
              {formatFileSize(result.originalSize)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">优化后体积</span>
            <span className="font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
              {formatFileSize(result.optimizedSize)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">节省体积</span>
            <span className="font-mono text-xl font-bold text-emerald-500 mt-1 block">
              {formatFileSize(result.savedBytes)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">体积压缩率</span>
            <span className="font-mono text-xl font-bold text-emerald-500 mt-1 block">
              {result.reductionPercentage}%
            </span>
          </div>
        </div>
      )}

      {/* Optimization Toggles Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-indigo-500" />
          <span>优化规则选项</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <input
              type="checkbox"
              checked={options.removeXmlDeclaration}
              onChange={(e) =>
                setOptions({ ...options, removeXmlDeclaration: e.target.checked })
              }
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">移除 XML 声明</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <input
              type="checkbox"
              checked={options.removeDoctype}
              onChange={(e) => setOptions({ ...options, removeDoctype: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">移除 DOCTYPE 声明</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <input
              type="checkbox"
              checked={options.removeComments}
              onChange={(e) => setOptions({ ...options, removeComments: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">移除 XML 注释</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <input
              type="checkbox"
              checked={options.removeMetadata}
              onChange={(e) => setOptions({ ...options, removeMetadata: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">移除元数据标签</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <input
              type="checkbox"
              checked={options.removeEditorNamespaces}
              onChange={(e) =>
                setOptions({ ...options, removeEditorNamespaces: e.target.checked })
              }
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">清理编辑器命名空间</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <input
              type="checkbox"
              checked={options.removeEmptyContainers}
              onChange={(e) =>
                setOptions({ ...options, removeEmptyContainers: e.target.checked })
              }
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">移除空容器元素</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <input
              type="checkbox"
              checked={options.minifyWhitespace}
              onChange={(e) =>
                setOptions({ ...options, minifyWhitespace: e.target.checked })
              }
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">压缩多余空格与换行</span>
          </label>

          <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <span className="text-slate-700 dark:text-slate-300 font-medium">坐标小数精度</span>
            <select
              value={options.precision}
              onChange={(e) =>
                setOptions({ ...options, precision: Number(e.target.value) })
              }
              className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs outline-none"
            >
              <option value="1">1 位</option>
              <option value="2">2 位 (推荐)</option>
              <option value="3">3 位</option>
              <option value="4">4 位</option>
            </select>
          </div>
        </div>
      </div>

      {/* Editor & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Raw SVG Input */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              原始 SVG 源代码
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSvgInput(sampleSvg)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                重置示例
              </button>
              <button
                onClick={() => setSvgInput("")}
                className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                清空
              </button>
            </div>
          </div>

          <textarea
            rows={14}
            value={svgInput}
            onChange={(e) => setSvgInput(e.target.value)}
            placeholder="请在此输入或粘贴 <svg> 代码..."
            className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />

          {!result.isValid && svgInput.trim() && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{result.error}</span>
            </div>
          )}
        </div>

        {/* Right: Output & Visual Preview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium">
              {[
                { id: "preview", label: "视觉预览" },
                { id: "code", label: "优化代码" },
                { id: "react", label: "React 组件" },
                { id: "datauri", label: "DataURI" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === t.id
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={!result.optimizedSvg}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                title="下载 SVG"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载</span>
              </button>

              <button
                onClick={() => {
                  let copyContent = result.optimizedSvg;
                  if (activeTab === "react") copyContent = result.reactComponentCode;
                  else if (activeTab === "datauri") copyContent = result.dataUriUtf8;
                  handleCopy("output", copyContent);
                }}
                disabled={!result.optimizedSvg}
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
                    <span>复制当前</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {activeTab === "preview" ? (
            <div className="flex-1 w-full min-h-[280px] rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center p-8 overflow-hidden relative">
              {result.isValid && result.optimizedSvg ? (
                <div
                  className="w-full h-full max-h-56 flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:object-contain"
                  dangerouslySetInnerHTML={{ __html: result.optimizedSvg }}
                />
              ) : (
                <span className="text-xs text-slate-400">请输入有效的 SVG 查看视觉呈现</span>
              )}
            </div>
          ) : activeTab === "react" ? (
            <CodeViewer
              code={result.reactComponentCode}
              language="typescript"
              maxHeight="340px"
            />
          ) : activeTab === "datauri" ? (
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500">UTF-8 DataURI:</span>
                <textarea
                  rows={4}
                  readOnly
                  value={result.dataUriUtf8}
                  className="w-full p-2.5 font-mono text-xs rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none select-all resize-none"
                />
              </div>

              <div className="space-y-1 flex-1">
                <span className="text-[11px] font-bold text-slate-500">Base64 DataURI:</span>
                <textarea
                  rows={4}
                  readOnly
                  value={result.dataUriBase64}
                  className="w-full p-2.5 font-mono text-xs rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none select-all resize-none"
                />
              </div>
            </div>
          ) : (
            <CodeViewer
              code={result.optimizedSvg}
              language="xml"
              maxHeight="340px"
            />
          )}

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 font-mono">
            <span>字符数: {result.optimizedSvg.length}</span>
            <span>优化后体积: {formatFileSize(result.optimizedSize)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
