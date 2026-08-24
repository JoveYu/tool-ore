import React, { useState, useRef, useEffect, useMemo } from "react";
import { computeAllHashes, computeFileHashes, HashResult } from "./hashUtils";
import { formatFileSize } from "../image/imageUtils";
import {
  Hash,
  Copy,
  Check,
  RotateCcw,
  UploadCloud,
  FileCode,
  Key,
  ShieldCheck,
  FileText,
  Loader2,
} from "lucide-react";

type HashMode = "text" | "file";

export default function HashCalculator() {
  const [mode, setMode] = useState<HashMode>("text");
  const [inputText, setInputText] = useState<string>("Hello World");
  const [hmacKey, setHmacKey] = useState<string>("");
  const [useHmac, setUseHmac] = useState<boolean>(false);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // File hash state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHashes, setFileHashes] = useState<HashResult[]>([]);
  const [isCalculatingFile, setIsCalculatingFile] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Text hashes computed in real time
  const textHashes = useMemo(() => {
    if (mode !== "text" || !inputText) return [];
    return computeAllHashes(inputText, {
      uppercase,
      hmacKey: useHmac ? hmacKey : undefined,
    });
  }, [mode, inputText, uppercase, useHmac, hmacKey]);

  // Handle file calculation
  useEffect(() => {
    if (!selectedFile || mode !== "file") return;

    let isMounted = true;
    const runFileHash = async () => {
      setIsCalculatingFile(true);
      try {
        const hashes = await computeFileHashes(selectedFile, { uppercase });
        if (isMounted) {
          setFileHashes(hashes);
        }
      } catch (err) {
        console.error("文件哈希计算失败", err);
      } finally {
        if (isMounted) {
          setIsCalculatingFile(false);
        }
      }
    };

    runFileHash();
    return () => {
      isMounted = false;
    };
  }, [selectedFile, mode, uppercase]);

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleResetFile = () => {
    setSelectedFile(null);
    setFileHashes([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const currentHashes = mode === "text" ? textHashes : fileHashes;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Hash className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                哈希散列计算器
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                一站式聚合 MD5、SHA-1、SHA-256、SHA-512、SHA3、RIPEMD-160 等散列算法，支持 HMAC 密钥与文件校验
              </p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium self-start sm:self-center shrink-0">
            <button
              onClick={() => setMode("text")}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "text"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              文本哈希
            </button>
            <button
              onClick={() => setMode("file")}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "file"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              文件校验码
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="space-y-6">
        {mode === "text" ? (
          /* Text Mode Input Card */
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                输入待计算的明文文本
              </label>
              {inputText && (
                <button
                  onClick={() => setInputText("")}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  清空
                </button>
              )}
            </div>

            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="请输入需要计算 Hash 的文本..."
              className="w-full p-3.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />

            {/* Options Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 text-xs">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useHmac}
                  onChange={(e) => setUseHmac(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>启用 HMAC 密钥加密</span>
              </label>

              {useHmac && (
                <div className="flex items-center gap-2 flex-1 max-w-xs">
                  <Key className="w-4 h-4 text-indigo-500 shrink-0" />
                  <input
                    type="text"
                    value={hmacKey}
                    onChange={(e) => setHmacKey(e.target.value)}
                    placeholder="输入 HMAC 密钥 Secret..."
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          /* File Mode Upload Card */
          <div className="space-y-4">
            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900/60 rounded-3xl p-12 text-center cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-500/5 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  点击上传文件或拖放到此处
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  纯本地计算文件 MD5, SHA-1, SHA-256, SHA-512 校验码，不上传至任何服务器
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedFile.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      大小: {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetFile}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    更换文件
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Table */}
        {isCalculatingFile ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span className="text-xs text-slate-400">正在计算大文件哈希散列值...</span>
          </div>
        ) : currentHashes.length > 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                聚合计算结果 ({currentHashes.length} 种算法)
              </h2>

              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={uppercase}
                  onChange={(e) => setUppercase(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>大写输出 (HEX)</span>
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 uppercase bg-slate-50/30 dark:bg-slate-800/10">
                    <th className="py-2.5 px-4 font-semibold w-28">算法</th>
                    <th className="py-2.5 px-2 font-semibold w-16 text-center">位数</th>
                    <th className="py-2.5 px-4 font-semibold">哈希值 (Hash Digest)</th>
                    <th className="py-2.5 px-4 font-semibold w-20 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {currentHashes.map((item) => (
                    <tr
                      key={item.algorithm}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {item.name}
                      </td>
                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {item.bitLength}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-indigo-950 dark:text-indigo-200 select-all break-all leading-relaxed font-medium">
                        {item.hash}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap font-sans">
                        <button
                          onClick={() => handleCopy(item.algorithm, item.hash)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                          {copiedKey === item.algorithm ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">
                                已复制
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span className="text-[11px]">复制</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
