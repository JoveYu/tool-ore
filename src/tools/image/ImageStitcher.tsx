import React, { useState, useEffect, useRef } from "react";
import {
  Layers,
  UploadCloud,
  Download,
  RotateCcw,
  Sliders,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Grid3X3,
  MoveDown,
  MoveRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import {
  StitchDirection,
  StitchImageItem,
  StitchOptions,
  stitchImagesToDataUrl,
} from "./stitcherUtils";

export default function ImageStitcher() {
  const [items, setItems] = useState<StitchImageItem[]>([]);
  const [direction, setDirection] = useState<StitchDirection>("vertical");
  const [gridCols, setGridCols] = useState<number>(3);
  const [gap, setGap] = useState<number>(10);
  const [padding, setPadding] = useState<number>(16);
  const [backgroundColor, setBackgroundColor] = useState<string>("#FFFFFF");
  const [borderRadius, setBorderRadius] = useState<number>(8);
  const [outputFormat, setOutputFormat] = useState<"image/png" | "image/jpeg">("image/png");

  const [stitchedDataUrl, setStitchedDataUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const newItems: StitchImageItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      const { width, height } = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.src = dataUrl;
      });

      newItems.push({
        id: Math.random().toString(36).slice(2, 9),
        name: file.name,
        dataUrl,
        width,
        height,
        size: file.size,
      });
    }

    setItems((prev) => [...prev, ...newItems]);
  };

  // Re-stitch when parameters or items change
  useEffect(() => {
    if (items.length === 0) {
      setStitchedDataUrl("");
      return;
    }

    let isMounted = true;
    setIsProcessing(true);

    const options: StitchOptions = {
      direction,
      gridCols,
      gap,
      padding,
      backgroundColor,
      borderRadius,
      outputFormat,
    };

    stitchImagesToDataUrl(items, options)
      .then((url) => {
        if (isMounted) {
          setStitchedDataUrl(url);
          setIsProcessing(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(err?.message || "图片拼接失败");
          setIsProcessing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [items, direction, gridCols, gap, padding, backgroundColor, borderRadius, outputFormat]);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setItems((prev) => {
      const arr = [...prev];
      const temp = arr[index - 1];
      arr[index - 1] = arr[index];
      arr[index] = temp;
      return arr;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    setItems((prev) => {
      const arr = [...prev];
      const temp = arr[index + 1];
      arr[index + 1] = arr[index];
      arr[index] = temp;
      return arr;
    });
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleDownload = () => {
    if (!stitchedDataUrl) return;
    const isPng = outputFormat === "image/png";
    const ext = isPng ? "png" : "jpg";
    const a = document.createElement("a");
    a.href = stitchedDataUrl;
    a.download = `stitched_${direction}_${Date.now()}.${ext}`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              长图横竖与网格拼接
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              纯本地 Canvas 高清批量拼接图片，支持垂直竖向长图、水平横向长图与九宫格矩阵排版导出
            </p>
          </div>
        </div>
      </div>

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

      {/* Upload or Main Workspace */}
      {items.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileUpload(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900/60 rounded-3xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-4 shadow-xs"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="text-base font-semibold text-slate-800 dark:text-slate-200">
              点击上传或拖拽多张图片到此处
            </div>
            <p className="text-xs text-slate-400">
              支持批量添加 JPG、PNG、WebP 图片，自动按顺序长图拼接与矩阵排版
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Items Management & Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stitch Direction Selector Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  拼图方向与布局模式
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-500" />
                    <span>添加图片</span>
                  </button>
                  <button
                    onClick={() => setItems([])}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>清空</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <button
                  onClick={() => setDirection("vertical")}
                  className={`p-3.5 rounded-xl border font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    direction === "vertical"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <MoveDown className="w-4 h-4" />
                  <span>垂直竖向长图</span>
                </button>
                <button
                  onClick={() => setDirection("horizontal")}
                  className={`p-3.5 rounded-xl border font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    direction === "horizontal"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <MoveRight className="w-4 h-4" />
                  <span>水平横向长图</span>
                </button>
                <button
                  onClick={() => setDirection("grid")}
                  className={`p-3.5 rounded-xl border font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    direction === "grid"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  <span>网格矩阵拼图</span>
                </button>
              </div>

              {direction === "grid" && (
                <div className="flex items-center gap-2 pt-2 text-xs">
                  <span className="text-slate-500 font-medium">网格列数:</span>
                  {[2, 3, 4].map((cols) => (
                    <button
                      key={cols}
                      onClick={() => setGridCols(cols)}
                      className={`px-3 py-1 rounded-lg border font-mono font-bold transition-all ${
                        gridCols === cols
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {cols} 列
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Layout Customization Sliders */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>边距、间距与圆角微调</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>图片间距</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{gap}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="2"
                    value={gap}
                    onChange={(e) => setGap(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>画布外边距</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{padding}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="2"
                    value={padding}
                    onChange={(e) => setPadding(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>图片圆角</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="2"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Background Color Picker */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-500 font-medium">画布底色:</span>
                {[
                  { name: "纯白", color: "#FFFFFF" },
                  { name: "浅灰", color: "#F1F5F9" },
                  { name: "极夜黑", color: "#0F172A" },
                  { name: "透明底", color: "transparent" },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setBackgroundColor(item.color)}
                    className={`px-3 py-1 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      backgroundColor === item.color
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: item.color === "transparent" ? "#ffffff" : item.color }}
                    />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Uploaded Items List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
                已选图片排序清单 ({items.length} 张图片)
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 font-mono font-bold text-xs text-slate-400 text-center">
                        {idx + 1}
                      </span>
                      <img
                        src={item.dataUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {item.width} × {item.height} px
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500"
                        title="上移"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === items.length - 1}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500"
                        title="下移"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500"
                        title="移除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 1 Column: Preview & Download Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-center pb-2 border-b border-slate-100 dark:border-slate-800">
                拼接大图实时预览
              </div>

              <div
                className="rounded-2xl p-2 border border-slate-200 dark:border-slate-800 flex items-center justify-center max-h-[460px] overflow-y-auto shadow-inner"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)",
                  backgroundSize: "12px 12px",
                }}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2 p-8 text-xs text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    <span>正在拼接长图中...</span>
                  </div>
                ) : stitchedDataUrl ? (
                  <img
                    src={stitchedDataUrl}
                    alt="拼接预览"
                    className="max-w-full h-auto object-contain rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="text-xs text-slate-400 p-8">等待添加图片生成预览...</div>
                )}
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={!stitchedDataUrl || isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>下载拼接图片</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
