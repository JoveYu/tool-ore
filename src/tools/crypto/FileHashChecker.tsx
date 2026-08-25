import React, { useState, useRef } from "react";
import {
  FileChecksumResult,
  ComparisonOutcome,
  calculateFileChecksum,
  compareChecksums,
} from "./fileHashUtils";
import {
  ShieldCheck,
  Upload,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  FileCheck2,
  AlertTriangle,
  FileText,
  Equal,
  EqualNot,
  Loader2,
} from "lucide-react";

type CompareMode = "verify_hash" | "two_files";

export default function FileHashChecker() {
  const [mode, setMode] = useState<CompareMode>("verify_hash");

  // File A
  const [fileA, setFileA] = useState<File | null>(null);
  const [checksumA, setChecksumA] = useState<FileChecksumResult | null>(null);
  const [loadingA, setLoadingA] = useState<boolean>(false);

  // File B (for two files mode)
  const [fileB, setFileB] = useState<File | null>(null);
  const [checksumB, setChecksumB] = useState<FileChecksumResult | null>(null);
  const [loadingB, setLoadingB] = useState<boolean>(false);

  // Target Checksum String (for single file verify mode)
  const [targetChecksum, setTargetChecksum] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);

  const handleFileUploadA = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileA(file);
    setLoadingA(true);
    try {
      const res = await calculateFileChecksum(file);
      setChecksumA(res);
    } finally {
      setLoadingA(false);
    }
  };

  const handleFileUploadB = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileB(file);
    setLoadingB(true);
    try {
      const res = await calculateFileChecksum(file);
      setChecksumB(res);
    } finally {
      setLoadingB(false);
    }
  };

  const outcome: ComparisonOutcome | null = React.useMemo(() => {
    if (!checksumA) return null;
    if (mode === "two_files") {
      if (!checksumB) return null;
      return compareChecksums(checksumA, checksumB);
    } else {
      if (!targetChecksum.trim()) return null;
      return compareChecksums(checksumA, targetChecksum);
    }
  }, [checksumA, checksumB, targetChecksum, mode]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                文件哈希散列与完整性校验
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                计算 SHA-256、SHA-1、SHA-512 校验指纹，比对官方签名或双文件内容一致性防篡改
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium self-start sm:self-center">
            <button
              onClick={() => setMode("verify_hash")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "verify_hash"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              比对目标校验码
            </button>
            <button
              onClick={() => setMode("two_files")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "two_files"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              双文件一致性比对
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Outcome Banner */}
      {outcome && (
        <div
          className={`p-5 rounded-2xl border flex items-center gap-3.5 shadow-xs transition-all ${
            outcome.isMatch
              ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200"
              : "bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200"
          }`}
        >
          {outcome.isMatch ? (
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Equal className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <EqualNot className="w-6 h-6" />
            </div>
          )}

          <div className="space-y-0.5">
            <div className="font-bold text-sm">
              {outcome.isMatch ? "校验结果：完全一致 (Matched)" : "校验结果：不一致 (Mismatch)"}
            </div>
            <div className="text-xs opacity-90">{outcome.details}</div>
          </div>
        </div>
      )}

      {/* Upload & Input Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File A Upload */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <span>{mode === "two_files" ? "文件 A" : "上传待校验文件"}</span>
            {fileA && (
              <span className="font-mono text-slate-400 font-normal">
                {formatFileSize(fileA.size)}
              </span>
            )}
          </div>

          <input
            ref={fileInputRefA}
            type="file"
            onChange={handleFileUploadA}
            className="hidden"
          />

          {!fileA ? (
            <div
              onClick={() => fileInputRefA.current?.click()}
              className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 rounded-2xl text-center cursor-pointer space-y-2 transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto text-indigo-500" />
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                点击或拖入本地文件
              </div>
              <div className="text-[11px] text-slate-400">大文件本地极速流式散列计算</div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {fileA.name}
                </span>
                <button
                  onClick={() => fileInputRefA.current?.click()}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  更换
                </button>
              </div>

              {loadingA ? (
                <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  <span>正在计算文件哈希散列值...</span>
                </div>
              ) : (
                checksumA && (
                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex justify-between text-slate-400 font-sans text-[11px]">
                        <span>SHA-256 (推荐校验)</span>
                        <button
                          onClick={() => handleCopy("a_sha256", checksumA.sha256)}
                          className="hover:text-indigo-600"
                        >
                          {copiedKey === "a_sha256" ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="text-indigo-950 dark:text-indigo-200 select-all break-all text-[11px]">
                        {checksumA.sha256}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex justify-between text-slate-400 font-sans text-[11px]">
                        <span>SHA-1</span>
                        <button
                          onClick={() => handleCopy("a_sha1", checksumA.sha1)}
                          className="hover:text-indigo-600"
                        >
                          {copiedKey === "a_sha1" ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 select-all break-all text-[11px]">
                        {checksumA.sha1}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Right: File B or Target Hash */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <span>{mode === "two_files" ? "文件 B" : "输入官方/目标校验码 (SHA-256 / SHA-1)"}</span>
            {fileB && mode === "two_files" && (
              <span className="font-mono text-slate-400 font-normal">
                {formatFileSize(fileB.size)}
              </span>
            )}
          </div>

          {mode === "two_files" ? (
            <>
              <input
                ref={fileInputRefB}
                type="file"
                onChange={handleFileUploadB}
                className="hidden"
              />

              {!fileB ? (
                <div
                  onClick={() => fileInputRefB.current?.click()}
                  className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 rounded-2xl text-center cursor-pointer space-y-2 transition-colors"
                >
                  <Upload className="w-8 h-8 mx-auto text-indigo-500" />
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    点击或拖入第二个文件
                  </div>
                  <div className="text-[11px] text-slate-400">将与文件 A 进行全量哈希指纹比对</div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {fileB.name}
                    </span>
                    <button
                      onClick={() => fileInputRefB.current?.click()}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      更换
                    </button>
                  </div>

                  {loadingB ? (
                    <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                      <span>正在计算文件哈希散列值...</span>
                    </div>
                  ) : (
                    checksumB && (
                      <div className="space-y-2 text-xs font-mono">
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                          <div className="flex justify-between text-slate-400 font-sans text-[11px]">
                            <span>SHA-256</span>
                            <button
                              onClick={() => handleCopy("b_sha256", checksumB.sha256)}
                              className="hover:text-indigo-600"
                            >
                              {copiedKey === "b_sha256" ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="text-indigo-950 dark:text-indigo-200 select-all break-all text-[11px]">
                            {checksumB.sha256}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <textarea
                rows={6}
                value={targetChecksum}
                onChange={(e) => setTargetChecksum(e.target.value)}
                placeholder="粘贴从软件官网或发布页复制的 SHA-256、SHA-1 或 MD5 校验码..."
                className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none break-all"
              />

              <div className="text-[11px] text-slate-400">
                支持不区分大小写的 32/40/64/128 位十六进制哈希特征值快速匹配校验
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
