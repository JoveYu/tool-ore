import React, { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Download,
  Layers,
  Scissors,
  RotateCw,
  Image as ImageIcon,
  Stamp,
  ArrowUp,
  ArrowDown,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCcw,
  Sparkles,
  Plus,
} from "lucide-react";
import {
  getPdfInfo,
  mergePdfFiles,
  splitOrExtractPdf,
  rotatePdfPages,
  imagesToPdf,
  addWatermarkToPdf,
  parsePageRange,
  ImageToPdfItem,
  ImagePageFit,
  WatermarkOptions,
} from "./pdfUtils";

type PdfTabMode = "merge" | "split" | "rotate" | "image_to_pdf" | "watermark";

interface MergeFileItem {
  id: string;
  name: string;
  size: number;
  buffer: ArrayBuffer;
  pageCount: number;
}

export default function PdfTool() {
  const [activeTab, setActiveTab] = useState<PdfTabMode>("merge");

  // Global processing & alert states
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // 1. Merge States
  const [mergeFiles, setMergeFiles] = useState<MergeFileItem[]>([]);
  const mergeInputRef = useRef<HTMLInputElement>(null);

  // 2. Split States
  const [splitFile, setSplitFile] = useState<{
    name: string;
    size: number;
    buffer: ArrayBuffer;
    pageCount: number;
  } | null>(null);
  const [rangeInput, setRangeInput] = useState<string>("");
  const splitInputRef = useRef<HTMLInputElement>(null);

  // 3. Rotate States
  const [rotateFile, setRotateFile] = useState<{
    name: string;
    size: number;
    buffer: ArrayBuffer;
    pageCount: number;
  } | null>(null);
  const [rotationDegrees, setRotationDegrees] = useState<number>(90);
  const [rotateRangeInput, setRotateRangeInput] = useState<string>("");
  const rotateInputRef = useRef<HTMLInputElement>(null);

  // 4. Image to PDF States
  const [imgItems, setImgItems] = useState<
    (ImageToPdfItem & { id: string; name: string; size: number })[]
  >([]);
  const [pageFit, setPageFit] = useState<ImagePageFit>("fit");
  const [margin, setMargin] = useState<number>(20);
  const imgInputRef = useRef<HTMLInputElement>(null);

  // 5. Watermark States
  const [watermarkFile, setWatermarkFile] = useState<{
    name: string;
    size: number;
    buffer: ArrayBuffer;
    pageCount: number;
  } | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>("内部资料 严禁外传");
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.2);
  const [watermarkSize, setWatermarkSize] = useState<number>(36);
  const [watermarkAngle, setWatermarkAngle] = useState<number>(30);
  const [watermarkMode, setWatermarkMode] = useState<"single" | "tile">("tile");
  const [watermarkColor, setWatermarkColor] = useState<string>("#EF4444");
  const watermarkInputRef = useRef<HTMLInputElement>(null);

  const resetAlerts = () => {
    setErrorMessage(null);
    setSuccessInfo(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const triggerDownload = (bytes: Uint8Array, fileName: string) => {
    const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Handler: Merge ──
  const handleMergeUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    resetAlerts();
    try {
      const newItems: MergeFileItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) continue;
        const buffer = await file.arrayBuffer();
        const info = await getPdfInfo(buffer);
        newItems.push({
          id: Math.random().toString(36).slice(2, 9),
          name: file.name,
          size: file.size,
          buffer,
          pageCount: info.pageCount,
        });
      }
      setMergeFiles((prev) => [...prev, ...newItems]);
    } catch (err: any) {
      setErrorMessage(err?.message || "解析 PDF 文件失败");
    }
  };

  const handleMergeProcess = async () => {
    if (mergeFiles.length < 2) {
      setErrorMessage("请至少添加 2 个 PDF 文件进行合并");
      return;
    }
    resetAlerts();
    setIsProcessing(true);
    try {
      const buffers = mergeFiles.map((f) => f.buffer);
      const mergedBytes = await mergePdfFiles(buffers);
      triggerDownload(mergedBytes, `merged_${Date.now()}.pdf`);
      setSuccessInfo(`成功合并 ${mergeFiles.length} 个 PDF 文件`);
    } catch (err: any) {
      setErrorMessage(err?.message || "PDF 合并失败");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Handler: Split ──
  const handleSplitUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    resetAlerts();
    const file = files[0];
    try {
      const buffer = await file.arrayBuffer();
      const info = await getPdfInfo(buffer);
      setSplitFile({
        name: file.name,
        size: file.size,
        buffer,
        pageCount: info.pageCount,
      });
      setRangeInput(`1-${Math.min(info.pageCount, 3)}`);
    } catch (err: any) {
      setErrorMessage(err?.message || "解析 PDF 失败");
    }
  };

  const handleSplitProcess = async () => {
    if (!splitFile) return;
    resetAlerts();
    setIsProcessing(true);
    try {
      const pageIndices = parsePageRange(rangeInput, splitFile.pageCount);
      if (pageIndices.length === 0) {
        throw new Error("输入的页码范围无效或超出版面范围");
      }
      const extractedBytes = await splitOrExtractPdf(splitFile.buffer, pageIndices);
      triggerDownload(extractedBytes, `extracted_${Date.now()}.pdf`);
      setSuccessInfo(`成功提取 ${pageIndices.length} 页并生成新文档`);
    } catch (err: any) {
      setErrorMessage(err?.message || "提取 PDF 页面失败");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Handler: Rotate ──
  const handleRotateUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    resetAlerts();
    const file = files[0];
    try {
      const buffer = await file.arrayBuffer();
      const info = await getPdfInfo(buffer);
      setRotateFile({
        name: file.name,
        size: file.size,
        buffer,
        pageCount: info.pageCount,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || "解析 PDF 失败");
    }
  };

  const handleRotateProcess = async () => {
    if (!rotateFile) return;
    resetAlerts();
    setIsProcessing(true);
    try {
      const targetIndices = rotateRangeInput.trim()
        ? parsePageRange(rotateRangeInput, rotateFile.pageCount)
        : undefined;

      const rotatedBytes = await rotatePdfPages(
        rotateFile.buffer,
        rotationDegrees,
        targetIndices
      );
      triggerDownload(rotatedBytes, `rotated_${Date.now()}.pdf`);
      setSuccessInfo("成功旋转 PDF 页面并保存");
    } catch (err: any) {
      setErrorMessage(err?.message || "旋转 PDF 失败");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Handler: Images to PDF ──
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    resetAlerts();
    const items: (ImageToPdfItem & { id: string; name: string; size: number })[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      const dataUrl = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = (e) => res(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      const { width, height } = await new Promise<{ width: number; height: number }>(
        (res) => {
          const img = new Image();
          img.onload = () => res({ width: img.naturalWidth, height: img.naturalHeight });
          img.src = dataUrl;
        }
      );

      items.push({
        id: Math.random().toString(36).slice(2, 9),
        name: file.name,
        size: file.size,
        dataUrl,
        type: file.type,
        width,
        height,
      });
    }

    setImgItems((prev) => [...prev, ...items]);
  };

  const handleImagesToPdfProcess = async () => {
    if (imgItems.length === 0) {
      setErrorMessage("请至少选择一张图片生成 PDF");
      return;
    }
    resetAlerts();
    setIsProcessing(true);
    try {
      const pdfBytes = await imagesToPdf(imgItems, {
        pageFit,
        margin,
      });
      triggerDownload(pdfBytes, `images_album_${Date.now()}.pdf`);
      setSuccessInfo(`成功将 ${imgItems.length} 张图片转换为 PDF`);
    } catch (err: any) {
      setErrorMessage(err?.message || "图片转换 PDF 失败");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Handler: Watermark ──
  const handleWatermarkUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    resetAlerts();
    const file = files[0];
    try {
      const buffer = await file.arrayBuffer();
      const info = await getPdfInfo(buffer);
      setWatermarkFile({
        name: file.name,
        size: file.size,
        buffer,
        pageCount: info.pageCount,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || "解析 PDF 失败");
    }
  };

  const handleWatermarkProcess = async () => {
    if (!watermarkFile) return;
    if (!watermarkText.trim()) {
      setErrorMessage("请输入水印文字");
      return;
    }
    resetAlerts();
    setIsProcessing(true);
    try {
      const options: WatermarkOptions = {
        text: watermarkText,
        opacity: watermarkOpacity,
        size: watermarkSize,
        angle: watermarkAngle,
        mode: watermarkMode,
        color: watermarkColor,
      };

      const watermarkedBytes = await addWatermarkToPdf(watermarkFile.buffer, options);
      triggerDownload(watermarkedBytes, `watermarked_${Date.now()}.pdf`);
      setSuccessInfo(`成功为全部 ${watermarkFile.pageCount} 页添加水印`);
    } catch (err: any) {
      setErrorMessage(err?.message || "添加水印失败");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                PDF 格式处理与工具箱
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                支持纯本地离线 PDF 合并、提取拆分、页面旋转、图片转 PDF 与全屏防盗文字水印
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex flex-wrap items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium self-start sm:self-center shrink-0">
            <button
              onClick={() => {
                setActiveTab("merge");
                resetAlerts();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "merge"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>PDF 合并</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("split");
                resetAlerts();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "split"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>页面拆分</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("rotate");
                resetAlerts();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "rotate"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>页面旋转</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("image_to_pdf");
                resetAlerts();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "image_to_pdf"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>图片转 PDF</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("watermark");
                resetAlerts();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "watermark"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Stamp className="w-3.5 h-3.5" />
              <span>PDF 水印</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Toast Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="hover:underline cursor-pointer"
          >
            关闭
          </button>
        </div>
      )}

      {successInfo && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">{successInfo}</span>
          </div>
          <button
            onClick={() => setSuccessInfo(null)}
            className="hover:underline cursor-pointer"
          >
            关闭
          </button>
        </div>
      )}

      {/* ── TAB 1: PDF MERGE ── */}
      {activeTab === "merge" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                待合并文件列表 ({mergeFiles.length} 个文件)
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={mergeInputRef}
                  type="file"
                  multiple
                  accept="application/pdf,.pdf"
                  onChange={(e) => handleMergeUpload(e.target.files)}
                  className="hidden"
                />
                <button
                  onClick={() => mergeInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-500" />
                  <span>添加 PDF 文件</span>
                </button>
                {mergeFiles.length > 0 && (
                  <button
                    onClick={() => setMergeFiles([])}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>清空</span>
                  </button>
                )}
              </div>
            </div>

            {mergeFiles.length === 0 ? (
              <div
                onClick={() => mergeInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleMergeUpload(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  点击或拖拽多个 PDF 文件到此处
                </div>
                <p className="text-xs text-slate-400">
                  支持多选文件并随时调整合并排列顺序
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {mergeFiles.map((file, idx) => (
                  <div
                    key={file.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                          {file.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {file.pageCount} 页 · {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => {
                          if (idx === 0) return;
                          setMergeFiles((prev) => {
                            const arr = [...prev];
                            const temp = arr[idx - 1];
                            arr[idx - 1] = arr[idx];
                            arr[idx] = temp;
                            return arr;
                          });
                        }}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500"
                        title="上移"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (idx === mergeFiles.length - 1) return;
                          setMergeFiles((prev) => {
                            const arr = [...prev];
                            const temp = arr[idx + 1];
                            arr[idx + 1] = arr[idx];
                            arr[idx] = temp;
                            return arr;
                          });
                        }}
                        disabled={idx === mergeFiles.length - 1}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500"
                        title="下移"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setMergeFiles((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500"
                        title="移除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {mergeFiles.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={handleMergeProcess}
                  disabled={isProcessing || mergeFiles.length < 2}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>正在合并文档...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>立即合并并下载 PDF ({mergeFiles.reduce((acc, cur) => acc + cur.pageCount, 0)} 页)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: PDF SPLIT & EXTRACT ── */}
      {activeTab === "split" && (
        <div className="space-y-6">
          <input
            ref={splitInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => handleSplitUpload(e.target.files)}
            className="hidden"
          />

          {!splitFile ? (
            <div
              onClick={() => splitInputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                handleSplitUpload(e.dataTransfer.files);
              }}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900/60 rounded-3xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Scissors className="w-8 h-8" />
              </div>
              <div className="text-base font-semibold text-slate-800 dark:text-slate-200">
                点击或拖拽单个 PDF 文件进行拆分与提取
              </div>
              <p className="text-xs text-slate-400">
                支持输入指定页码区间、奇偶页提取与单页提取
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-sm">
                      {splitFile.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      共 {splitFile.pageCount} 页 · {formatFileSize(splitFile.size)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => splitInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  更换文件
                </button>
              </div>

              {/* Range Input & Quick Presets */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  提取页码范围 (例如: 1-3, 5, 8)
                </label>

                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder={`1-${splitFile.pageCount}`}
                  className="w-full px-4 py-3 font-mono text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-slate-400 py-1">快捷选择:</span>
                  <button
                    onClick={() => setRangeInput(`1-${splitFile.pageCount}`)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    全部页面
                  </button>
                  <button
                    onClick={() => setRangeInput("1")}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    仅第一页
                  </button>
                  <button
                    onClick={() => {
                      const odds: number[] = [];
                      for (let i = 1; i <= splitFile.pageCount; i += 2) odds.push(i);
                      setRangeInput(odds.join(", "));
                    }}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    奇数页
                  </button>
                  <button
                    onClick={() => {
                      const evens: number[] = [];
                      for (let i = 2; i <= splitFile.pageCount; i += 2) evens.push(i);
                      setRangeInput(evens.join(", "));
                    }}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    偶数页
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={handleSplitProcess}
                  disabled={isProcessing || !rangeInput.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>正在提取页面...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>提取并下载新 PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: PDF ROTATE ── */}
      {activeTab === "rotate" && (
        <div className="space-y-6">
          <input
            ref={rotateInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => handleRotateUpload(e.target.files)}
            className="hidden"
          />

          {!rotateFile ? (
            <div
              onClick={() => rotateInputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                handleRotateUpload(e.dataTransfer.files);
              }}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900/60 rounded-3xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <RotateCw className="w-8 h-8" />
              </div>
              <div className="text-base font-semibold text-slate-800 dark:text-slate-200">
                点击或拖拽 PDF 文件调整页面方向
              </div>
              <p className="text-xs text-slate-400">
                支持顺时针 90°、180°、逆时针 90° 旋转所有或指定页面
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-sm">
                      {rotateFile.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      共 {rotateFile.pageCount} 页 · {formatFileSize(rotateFile.size)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => rotateInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  更换文件
                </button>
              </div>

              {/* Rotation Angle Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  旋转角度
                </label>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  {[
                    { deg: 90, label: "顺时针 90°" },
                    { deg: 180, label: "旋转 180°" },
                    { deg: 270, label: "逆时针 90° (270°)" },
                  ].map((item) => (
                    <button
                      key={item.deg}
                      onClick={() => setRotationDegrees(item.deg)}
                      className={`p-3 rounded-xl border font-semibold text-center transition-all cursor-pointer ${
                        rotationDegrees === item.deg
                          ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Specific Pages */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  指定旋转页码 (留空表示旋转全部页面)
                </label>
                <input
                  type="text"
                  value={rotateRangeInput}
                  onChange={(e) => setRotateRangeInput(e.target.value)}
                  placeholder="留空旋转全部，或输入: 1, 3-5"
                  className="w-full px-4 py-2.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={handleRotateProcess}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>正在旋转并重构 PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>保存旋转后的 PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: IMAGES TO PDF ── */}
      {activeTab === "image_to_pdf" && (
        <div className="space-y-6">
          <input
            ref={imgInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={(e) => handleImageUpload(e.target.files)}
            className="hidden"
          />

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                选择图片清单 ({imgItems.length} 张图片)
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => imgInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-500" />
                  <span>添加图片</span>
                </button>
                {imgItems.length > 0 && (
                  <button
                    onClick={() => setImgItems([])}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>清空</span>
                  </button>
                )}
              </div>
            </div>

            {imgItems.length === 0 ? (
              <div
                onClick={() => imgInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleImageUpload(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  点击或拖拽 JPG / PNG 图片到此处
                </div>
                <p className="text-xs text-slate-400">
                  自动将多张图片按顺序排版并合并生成为标准 PDF 电子书 / 相册
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Options Toolbar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 text-xs">
                  <div className="space-y-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      页面规格与方向:
                    </span>
                    <div className="flex gap-2">
                      {[
                        { id: "fit", label: "自适应原图尺寸" },
                        { id: "a4_portrait", label: "A4 纵向排版" },
                        { id: "a4_landscape", label: "A4 横向排版" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setPageFit(item.id as ImagePageFit)}
                          className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                            pageFit === item.id
                              ? "bg-white dark:bg-slate-900 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                      <span>页边距空白:</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400">{margin}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="5"
                      value={margin}
                      onChange={(e) => setMargin(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Image Items List */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {imgItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="group relative rounded-xl border border-slate-200 dark:border-slate-700 p-2 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center gap-2"
                    >
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-900 flex items-center justify-center">
                        <img
                          src={item.dataUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-full text-center">
                        <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          第 {idx + 1} 页
                        </div>
                      </div>
                      <button
                        onClick={() => setImgItems((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        title="删除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={handleImagesToPdfProcess}
                    disabled={isProcessing || imgItems.length === 0}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>正在合成 PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>生成并下载 PDF 文档 ({imgItems.length} 页)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 5: PDF WATERMARK ── */}
      {activeTab === "watermark" && (
        <div className="space-y-6">
          <input
            ref={watermarkInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => handleWatermarkUpload(e.target.files)}
            className="hidden"
          />

          {!watermarkFile ? (
            <div
              onClick={() => watermarkInputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                handleWatermarkUpload(e.dataTransfer.files);
              }}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900/60 rounded-3xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Stamp className="w-8 h-8" />
              </div>
              <div className="text-base font-semibold text-slate-800 dark:text-slate-200">
                点击或拖拽 PDF 文件添加防伪水印
              </div>
              <p className="text-xs text-slate-400">
                支持全页平铺网格水印、透明度调节、倾斜旋转与颜色定制
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-sm">
                      {watermarkFile.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      共 {watermarkFile.pageCount} 页 · {formatFileSize(watermarkFile.size)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => watermarkInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  更换文件
                </button>
              </div>

              {/* Watermark Config Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Watermark Text */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    水印文本内容
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="输入防盗用水印文字..."
                    className="w-full px-4 py-2.5 font-medium rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      "内部资料 严禁外传",
                      "仅供办理业务使用",
                      "绝密文件 仅供审阅",
                      "复印无效",
                    ].map((sample) => (
                      <button
                        key={sample}
                        onClick={() => setWatermarkText(sample)}
                        className="px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode */}
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300">水印排布模式:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setWatermarkMode("tile")}
                      className={`p-2.5 rounded-xl border font-semibold text-center transition-all ${
                        watermarkMode === "tile"
                          ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      全屏平铺防盗
                    </button>
                    <button
                      onClick={() => setWatermarkMode("single")}
                      className={`p-2.5 rounded-xl border font-semibold text-center transition-all ${
                        watermarkMode === "single"
                          ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      页面中心单处
                    </button>
                  </div>
                </div>

                {/* Color */}
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300">水印颜色:</span>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <input
                      type="color"
                      value={watermarkColor}
                      onChange={(e) => setWatermarkColor(e.target.value)}
                      className="w-7 h-7 rounded-md border-0 p-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={watermarkColor}
                      onChange={(e) => setWatermarkColor(e.target.value)}
                      className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-transparent border-0 uppercase outline-none"
                    />
                  </div>
                </div>

                {/* Opacity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>透明度:</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {Math.round(watermarkOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.8"
                    step="0.05"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Font Size */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>文字字号:</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{watermarkSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="72"
                    step="2"
                    value={watermarkSize}
                    onChange={(e) => setWatermarkSize(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={handleWatermarkProcess}
                  disabled={isProcessing || !watermarkText.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>正在添加水印...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>生成并下载加水印 PDF ({watermarkFile.pageCount} 页)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
