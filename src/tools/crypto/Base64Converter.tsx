import React, { useState, useRef } from "react";
import { encodeBase64, decodeBase64, fileToBase64 } from "./base64Utils";
import { formatFileSize } from "../image/imageUtils";
import {
  Binary,
  Copy,
  Check,
  RotateCcw,
  UploadCloud,
  FileCode,
  ArrowDownUp,
  AlertCircle,
  FileText,
} from "lucide-react";

type Mode = "encode" | "decode" | "file";

export default function Base64Converter() {
  const [mode, setMode] = useState<Mode>("encode");
  const [inputText, setInputText] = useState<string>("Hello, Tool-Ore 在线工具!");
  const [urlSafe, setUrlSafe] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // File to Base64 state
  const [fileResult, setFileResult] = useState<{
    fileName: string;
    fileSize: number;
    rawBase64: string;
    dataUrl: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate Text Output
  const textOutput = React.useMemo(() => {
    if (mode === "encode") {
      return { result: encodeBase64(inputText, urlSafe) };
    }
    if (mode === "decode") {
      return decodeBase64(inputText, urlSafe);
    }
    return { result: "" };
  }, [mode, inputText, urlSafe]);

  const handleCopy = async (text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    if (textOutput.result && !textOutput.error) {
      setInputText(textOutput.result);
      setMode(mode === "encode" ? "decode" : "encode");
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const res = await fileToBase64(file);
      setFileResult({
        fileName: file.name,
        fileSize: file.size,
        rawBase64: res.rawBase64,
        dataUrl: res.dataUrl,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Base64 编解码转换
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              支持 UTF-8 文本编码/解码、URL 安全模式（URL-Safe）以及任意文件的 Base64 DataURI 转换
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium self-start sm:self-center">
            <button
              onClick={() => setMode("encode")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === "encode"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              文本编码
            </button>
            <button
              onClick={() => setMode("decode")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === "decode"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              文本解码
            </button>
            <button
              onClick={() => setMode("file")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === "file"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              文件转 Base64
            </button>
          </div>
        </div>
      </div>

      {mode !== "file" ? (
        /* Text Encode / Decode Area */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {mode === "encode" ? "输入原始明文 (UTF-8)" : "输入 Base64 编码字符串"}
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInputText("")}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  清空
                </button>
              </div>
            </div>

            <textarea
              rows={12}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={mode === "encode" ? "请输入需要编码的文本..." : "请输入 Base64 字符串..."}
              className="flex-1 w-full p-3.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />

            {/* Options */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={(e) => setUrlSafe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>URL 安全模式 (URL-Safe: - / _ 替换 + /)</span>
              </label>

              <button
                onClick={handleSwap}
                title="交换输入与输出"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
              >
                <ArrowDownUp className="w-3.5 h-3.5" />
                <span>换向</span>
              </button>
            </div>
          </div>

          {/* Output Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {mode === "encode" ? "Base64 编码结果" : "解码明文结果"}
              </label>

              {textOutput.result && (
                <button
                  onClick={() => handleCopy(textOutput.result)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>复制结果</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {textOutput.error ? (
              <div className="flex-1 w-full p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{textOutput.error}</span>
              </div>
            ) : (
              <textarea
                readOnly
                rows={12}
                value={textOutput.result}
                placeholder="转换结果将实时展示在此..."
                className="flex-1 w-full p-3.5 text-xs font-mono rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 outline-none resize-none select-all"
              />
            )}

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>字符数: {textOutput.result.length}</span>
              <span>字节大小: {new Blob([textOutput.result]).size} Bytes</span>
            </div>
          </div>
        </div>
      ) : (
        /* File to Base64 Area */
        <div className="space-y-6">
          {!fileResult ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileUpload(file);
              }}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900/60 rounded-3xl p-12 text-center cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-500/5 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                点击上传文件，或将任意文件拖放到这里
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                支持图片、字体、音频、文档等任意类型文件转 DataURI Base64
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
              {/* File Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {fileResult.fileName}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      文件大小: {formatFileSize(fileResult.fileSize)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setFileResult(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  更换文件
                </button>
              </div>

              {/* DataURL output */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    完整 Data URI (可直接用于 HTML/CSS 嵌入)
                  </span>
                  <button
                    onClick={() => handleCopy(fileResult.dataUrl)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    复制 DataURI
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={4}
                  value={fileResult.dataUrl}
                  className="w-full p-3 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none select-all"
                />
              </div>

              {/* Raw Base64 string */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    纯 Base64 字符串
                  </span>
                  <button
                    onClick={() => handleCopy(fileResult.rawBase64)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    复制纯 Base64
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={4}
                  value={fileResult.rawBase64}
                  className="w-full p-3 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none select-all"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
