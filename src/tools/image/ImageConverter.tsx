import React, { useState, useRef } from "react";
import {
  ImageFormat,
  ConvertItem,
  getFileExt,
  convertSingleImage,
} from "./converterUtils";
import { formatFileSize } from "./imageUtils";
import {
  UploadCloud,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";

const SUPPORTED_FORMATS: { id: ImageFormat; label: string }[] = [
  { id: "image/png", label: "PNG" },
  { id: "image/jpeg", label: "JPG / JPEG" },
  { id: "image/webp", label: "WebP" },
];

export default function ImageConverter() {
  const [items, setItems] = useState<ConvertItem[]>([]);
  const [globalTargetFormat, setGlobalTargetFormat] = useState<ImageFormat>("image/webp");
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: ConvertItem[] = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
        originalSize: file.size,
        originalFormat: file.type || "image/unknown",
        targetFormat: globalTargetFormat,
        status: "pending",
      }));

    setItems((prev) => [...prev, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleItemFormatChange = (id: string, format: ImageFormat) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, targetFormat: format, status: "pending", convertedUrl: undefined }
          : item
      )
    );
  };

  const handleConvertSingle = async (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "processing" } : item))
    );

    try {
      const { blob, dataUrl } = await convertSingleImage(target.file, target.targetFormat);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "success",
                convertedBlob: blob,
                convertedUrl: dataUrl,
                convertedSize: blob.size,
              }
            : item
        )
      );
    } catch (err: any) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "error", error: err?.message || "转换失败" }
            : item
        )
      );
    }
  };

  const handleConvertAll = async () => {
    setIsBatchProcessing(true);
    for (const item of items) {
      if (item.status !== "success") {
        await handleConvertSingle(item.id);
      }
    }
    setIsBatchProcessing(false);
  };

  const handleDownloadSingle = (item: ConvertItem) => {
    if (!item.convertedUrl) return;
    const baseName = item.file.name.replace(/\.[^/.]+$/, "");
    const ext = getFileExt(item.targetFormat);
    const link = document.createElement("a");
    link.href = item.convertedUrl;
    link.download = `${baseName}.${ext}`;
    link.click();
  };

  const handleDownloadAll = () => {
    items
      .filter((i) => i.status === "success" && i.convertedUrl)
      .forEach((item) => handleDownloadSingle(item));
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearAll = () => {
    setItems([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const successCount = items.filter((i) => i.status === "success").length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              图片格式转换
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              支持 PNG、JPG、WebP 格式之间快速批量互转，本地 Canvas 高速渲染
            </p>
          </div>
        </div>
      </div>

      {/* Upload Box */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900/60 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-500/5 group"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/bmp,image/gif"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <div className="max-w-sm mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              点击上传或拖拽多张图片到此
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              支持多选文件与批量转换
            </p>
          </div>
        </div>
      </div>

      {/* File List Area */}
      {items.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                统一目标格式:
              </span>
              <div className="flex gap-1.5">
                {SUPPORTED_FORMATS.map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => {
                      setGlobalTargetFormat(fmt.id);
                      setItems((prev) =>
                        prev.map((i) => ({
                          ...i,
                          targetFormat: fmt.id,
                          status: "pending",
                          convertedUrl: undefined,
                        }))
                      );
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-all ${
                      globalTargetFormat === fmt.id
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleConvertAll}
                disabled={isBatchProcessing}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs shadow-sm transition-all"
              >
                {isBatchProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>正在批量转换...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>全部转换 ({items.length})</span>
                  </>
                )}
              </button>

              {successCount > 0 && (
                <button
                  onClick={handleDownloadAll}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>全部下载 ({successCount})</span>
                </button>
              )}

              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>清空</span>
              </button>
            </div>
          </div>

          {/* List items */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.file.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                      <span>{formatFileSize(item.originalSize)}</span>
                      {item.convertedSize && (
                        <>
                          <ArrowRight className="w-3 h-3 text-slate-300" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {formatFileSize(item.convertedSize)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  {/* Item Format Selector */}
                  <select
                    value={item.targetFormat}
                    onChange={(e) =>
                      handleItemFormatChange(item.id, e.target.value as ImageFormat)
                    }
                    disabled={item.status === "processing"}
                    className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 outline-none"
                  >
                    {SUPPORTED_FORMATS.map((fmt) => (
                      <option key={fmt.id} value={fmt.id}>
                        ➔ {fmt.label}
                      </option>
                    ))}
                  </select>

                  {/* Actions */}
                  {item.status === "success" ? (
                    <button
                      onClick={() => handleDownloadSingle(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      下载
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConvertSingle(item.id)}
                      disabled={item.status === "processing"}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      {item.status === "processing" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "转换"
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                    title="移除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
