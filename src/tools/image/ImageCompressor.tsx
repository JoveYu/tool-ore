import React, { useState, useRef, useEffect } from "react";
import {
  compressImage,
  formatFileSize,
  CompressResult,
} from "./imageUtils";
import {
  UploadCloud,
  Download,
  RotateCcw,
  Sliders,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HardDrive,
  Gauge,
  Loader2,
  Minimize2,
} from "lucide-react";

type CompressMode = "quality" | "targetSize";

export default function ImageCompressor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 压缩模式: 质量百分比 (quality) 或 限制期望最大体积 (targetSize)
  const [mode, setMode] = useState<CompressMode>("targetSize");

  // 质量模式参数
  const [quality, setQuality] = useState<number>(80);

  // 指定目标大小参数 (KB / MB)
  const [targetSizeValue, setTargetSizeValue] = useState<string>("500");
  const [targetSizeUnit, setTargetSizeUnit] = useState<"KB" | "MB">("KB");

  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [format, setFormat] = useState<"image/jpeg" | "image/webp" | "image/png">("image/webp");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<CompressResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadFile(file);
    }
  };

  const loadFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("请选择有效的图片文件 (JPG, PNG, WebP 等)");
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResult(null);

    // 智能推断一个合理的期望目标大小（默认约为原始大小的 50%，或者 300KB）
    const halfSizeKb = Math.round((file.size / 1024) * 0.5);
    const initialTarget = Math.max(50, Math.min(halfSizeKb, 1024));
    setTargetSizeValue(String(initialTarget));
    setTargetSizeUnit("KB");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      loadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Trigger compression when parameters change or file is loaded
  useEffect(() => {
    if (!selectedFile) return;

    let isMounted = true;
    const runCompress = async () => {
      setIsProcessing(true);
      try {
        let targetMaxSizeBytes: number | undefined = undefined;

        if (mode === "targetSize") {
          const num = parseFloat(targetSizeValue);
          if (!isNaN(num) && num > 0) {
            targetMaxSizeBytes =
              targetSizeUnit === "MB" ? num * 1024 * 1024 : num * 1024;
          }
        }

        const res = await compressImage(selectedFile, {
          quality: mode === "quality" ? quality / 100 : undefined,
          targetMaxSizeBytes,
          maxWidthOrHeight: maxWidth > 0 ? maxWidth : undefined,
          format,
        });

        if (isMounted) {
          setResult(res);
        }
      } catch (err) {
        console.error("压缩失败", err);
      } finally {
        if (isMounted) {
          setIsProcessing(false);
        }
      }
    };

    const timer = setTimeout(runCompress, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedFile, mode, quality, targetSizeValue, targetSizeUnit, maxWidth, format]);

  const handleDownload = () => {
    if (!result || !selectedFile) return;
    const ext = format === "image/webp" ? "webp" : format === "image/jpeg" ? "jpg" : "png";
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, "");
    const link = document.createElement("a");
    link.href = result.dataUrl;
    link.download = `${baseName}-compressed.${ext}`;
    link.click();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Minimize2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              图片压缩
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              支持按目标大小或质量参数快速精准压缩
            </p>
          </div>
        </div>
      </div>

      {!selectedFile ? (
        /* Upload Area */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900/60 rounded-3xl p-12 text-center cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-500/5 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/bmp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="max-w-sm mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                点击选择图片，或拖拽图片到这里
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                支持 JPG, PNG, WebP, BMP 等常见格式
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Compression Controls & Comparison */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs h-fit">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  压缩模式与参数
                </h2>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                重新选择
              </button>
            </div>

            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium">
              <button
                onClick={() => setMode("targetSize")}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  mode === "targetSize"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>期望最大大小</span>
              </button>
              <button
                onClick={() => setMode("quality")}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  mode === "quality"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>质量百分比</span>
              </button>
            </div>

            {/* Target Max Size Mode Inputs */}
            {mode === "targetSize" ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-medium text-slate-700 dark:text-slate-300">
                    期望限制在
                  </label>
                  <span className="text-[11px] text-slate-400">
                    原图: {formatFileSize(selectedFile.size)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="10"
                      step="10"
                      value={targetSizeValue}
                      onChange={(e) => setTargetSizeValue(e.target.value)}
                      placeholder="如: 500"
                      className="w-full px-3 py-2 text-sm font-mono font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <select
                    value={targetSizeUnit}
                    onChange={(e) => setTargetSizeUnit(e.target.value as "KB" | "MB")}
                    className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="KB">KB</option>
                    <option value="MB">MB</option>
                  </select>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["100", "200", "500", "1024"].map((val) => (
                    <button
                      key={val}
                      onClick={() => {
                        setTargetSizeValue(val);
                        setTargetSizeUnit("KB");
                      }}
                      className="px-2 py-0.5 text-[10px] rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 border border-slate-200/60 dark:border-slate-700"
                    >
                      {val} KB
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Quality Percentage Mode Inputs */
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-medium text-slate-700 dark:text-slate-300">
                    压缩质量
                  </label>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {quality}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>更小体积</span>
                  <span>推荐 (75-85%)</span>
                  <span>更高画质</span>
                </div>
              </div>
            )}

            {/* Target Format */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                目标格式
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "image/webp", label: "WebP (推荐)" },
                  { id: "image/jpeg", label: "JPG" },
                  { id: "image/png", label: "PNG" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormat(item.id as any)}
                    className={`py-2 px-1 text-xs font-medium rounded-xl border transition-all ${
                      format === item.id
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Width */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  最大边长限制 (px)
                </label>
                <span className="font-mono text-slate-400">
                  {maxWidth === 0 ? "原始尺寸" : `${maxWidth}px`}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: "原尺寸", val: 0 },
                  { label: "1080p", val: 1920 },
                  { label: "2K", val: 2560 },
                  { label: "4K", val: 3840 },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setMaxWidth(item.val)}
                    className={`py-1.5 text-xs rounded-lg border transition-all ${
                      maxWidth === item.val
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent font-medium"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={!result || isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>正在智能计算压缩...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>下载压缩后的图片</span>
                </>
              )}
            </button>
          </div>

          {/* Preview & Stats Comparison */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Card */}
            {result && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 text-center">
                  <div className="px-2">
                    <div className="text-xs text-slate-400">原始大小</div>
                    <div className="text-base font-bold text-slate-700 dark:text-slate-300 font-mono mt-0.5">
                      {formatFileSize(result.originalSize)}
                    </div>
                  </div>
                  <div className="px-2">
                    <div className="text-xs text-slate-400">压缩后大小</div>
                    <div className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                      {formatFileSize(result.compressedSize)}
                    </div>
                  </div>
                  <div className="px-2">
                    <div className="text-xs text-slate-400">体积减小</div>
                    <div className="text-base font-bold text-emerald-500 font-mono mt-0.5">
                      {result.compressionRatio > 0 ? `-${result.compressionRatio}%` : "0%"}
                    </div>
                  </div>
                </div>

                {result.actualQuality !== undefined && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {mode === "targetSize" ? "算法自动匹配质量" : "输出质量"}:
                    </span>
                    <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {result.actualQuality}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Preview Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
                <span>实时效果预览</span>
                {result && (
                  <span className="font-mono text-[11px] text-slate-400">
                    分辨率: {result.width} × {result.height}
                  </span>
                )}
              </div>

              <div className="relative aspect-video max-h-[420px] rounded-xl bg-slate-100 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                {result ? (
                  <img
                    src={result.dataUrl}
                    alt="压缩预览"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ImageIcon className="w-5 h-5 animate-pulse" />
                    <span>计算预览中...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
