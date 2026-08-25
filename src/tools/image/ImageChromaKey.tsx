import React, { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  Download,
  Pipette,
  RotateCcw,
  Sliders,
  Sparkles,
  Layers,
  Printer,
  CheckCircle2,
  AlertCircle,
  Eye,
  Crop,
} from "lucide-react";
import {
  ChromaKeyOptions,
  PHOTO_SIZE_PRESETS,
  TARGET_COLOR_PRESETS,
  PhotoCropPreset,
  processChromaKey,
  generatePhotoSheet,
} from "./chromaKeyUtils";

export default function ImageChromaKey() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");

  // Chroma key parameters
  const [keyColor, setKeyColor] = useState<{ r: number; g: number; b: number }>({
    r: 211,
    g: 47,
    b: 47,
  }); // 默认红底
  const [targetColor, setTargetColor] = useState<string>("#0099FF"); // 默认换蓝底
  const [tolerance, setTolerance] = useState<number>(32);
  const [smoothness, setSmoothness] = useState<number>(12);
  const [spillReduction, setSpillReduction] = useState<number>(40);
  const [selectedCrop, setSelectedCrop] = useState<string>("free");

  const [isPickingKeyColor, setIsPickingKeyColor] = useState<boolean>(false);
  const [processedDataUrl, setProcessedDataUrl] = useState<string>("");
  const [sheetDataUrl, setSheetDataUrl] = useState<string | null>(null);
  const [isGeneratingSheet, setIsGeneratingSheet] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  // Load uploaded image into source canvas
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("请上传有效的图片文件");
      return;
    }

    setImageName(file.name.replace(/\.[^/.]+$/, ""));
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setSheetDataUrl(null);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      originalImageRef.current = img;
      renderSourceImage(img, selectedCrop, true);
    };
    img.src = url;
  };

  const renderSourceImage = (img: HTMLImageElement, cropId: string, isInitial: boolean = false) => {
    const canvas = sourceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const preset = PHOTO_SIZE_PRESETS.find((p) => p.id === cropId);

    if (!preset || preset.id === "free" || preset.width === 0) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
    } else {
      // 裁切为指定标准比例
      const targetAspect = preset.width / preset.height;
      const srcAspect = img.naturalWidth / img.naturalHeight;

      let sx = 0;
      let sy = 0;
      let sWidth = img.naturalWidth;
      let sHeight = img.naturalHeight;

      if (srcAspect > targetAspect) {
        sWidth = img.naturalHeight * targetAspect;
        sx = (img.naturalWidth - sWidth) / 2;
      } else {
        sHeight = img.naturalWidth / targetAspect;
        sy = 0; // 证件照通常顶部保留头部
      }

      canvas.width = preset.width;
      canvas.height = preset.height;
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, preset.width, preset.height);
    }

    // 仅在首次上传新图片时自动采样左上角像素，裁剪时不重置已有底色
    if (isInitial) {
      const topLeftPixel = ctx.getImageData(5, 5, 1, 1).data;
      setKeyColor({ r: topLeftPixel[0], g: topLeftPixel[1], b: topLeftPixel[2] });
    }
  };

  // When crop preset changes, re-render source without overriding keyColor
  useEffect(() => {
    if (originalImageRef.current) {
      renderSourceImage(originalImageRef.current, selectedCrop, false);
    }
  }, [selectedCrop]);

  // Execute chroma key replacement
  useEffect(() => {
    const canvas = sourceCanvasRef.current;
    if (!canvas || !imageSrc) return;

    const opts: ChromaKeyOptions = {
      keyColor,
      targetColor,
      tolerance,
      smoothness,
      spillReduction,
    };

    const outUrl = processChromaKey(canvas, opts);
    setProcessedDataUrl(outUrl);
    setSheetDataUrl(null);
  }, [imageSrc, keyColor, targetColor, tolerance, smoothness, spillReduction, selectedCrop]);

  // Click on canvas to pick background color
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPickingKeyColor) return;
    const canvas = sourceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      const p = ctx.getImageData(x, y, 1, 1).data;
      setKeyColor({ r: p[0], g: p[1], b: p[2] });
      setIsPickingKeyColor(false);
    }
  };

  const handleDownloadSingle = () => {
    if (!processedDataUrl) return;
    const link = document.createElement("a");
    link.href = processedDataUrl;
    link.download = `${imageName || "photo"}_chroma_${Date.now()}.png`;
    link.click();
  };

  const handleCreatePrintSheet = async () => {
    if (!processedDataUrl) return;
    setIsGeneratingSheet(true);
    try {
      const sheetUrl = await generatePhotoSheet(processedDataUrl, 8);
      setSheetDataUrl(sheetUrl);
    } finally {
      setIsGeneratingSheet(false);
    }
  };

  const handleDownloadSheet = () => {
    if (!sheetDataUrl) return;
    const link = document.createElement("a");
    link.href = sheetDataUrl;
    link.download = `${imageName || "photo"}_print_sheet_${Date.now()}.jpg`;
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hidden Source Canvas */}
      <canvas ref={sourceCanvasRef} className="hidden" />

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              证件照与纯色背景换色
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              纯本地离线色度抠图，红底/蓝底/白底一键转换、边缘去杂色与 6 寸排版打印生成
            </p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {!imageSrc ? (
        /* Upload Area */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900/60 rounded-3xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 shadow-xs hover:shadow-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="text-base font-semibold text-slate-800 dark:text-slate-200">
            点击或拖拽证件照到此处开始换底色
          </div>
          <p className="text-xs text-slate-400">
            支持 JPG、PNG、WebP，本地浏览器即时处理，无需上传至服务器
          </p>
        </div>
      ) : (
        /* Workspace Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Target Background Colors Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>选择目标背景颜色</span>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  更换照片
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {TARGET_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setTargetColor(preset.color)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                      targetColor === preset.color
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold ring-2 ring-indigo-500/20"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-md border border-black/15 shadow-2xs shrink-0"
                      style={{
                        backgroundColor:
                          preset.color === "transparent" ? "transparent" : preset.color,
                        backgroundImage:
                          preset.color === "transparent"
                            ? "linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)"
                            : "none",
                        backgroundSize: "6px 6px",
                      }}
                    />
                    <span>{preset.name}</span>
                  </button>
                ))}

                {/* Custom Color Picker */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                  <input
                    type="color"
                    value={targetColor === "transparent" ? "#0099FF" : targetColor}
                    onChange={(e) => setTargetColor(e.target.value)}
                    className="w-6 h-6 rounded-md border-0 p-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                    自定义色彩
                  </span>
                </div>
              </div>
            </div>

            {/* Standard Size Selector Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
                <Crop className="w-4 h-4 text-indigo-500" />
                <span>标准证件照裁剪规格</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {PHOTO_SIZE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedCrop(preset.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                      selectedCrop === preset.id
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="font-semibold">{preset.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono font-normal">
                      {preset.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tuning Sliders (Tolerance / Feather / Spill) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-500" />
                  <span>边缘平滑与抠图参数微调</span>
                </span>

                <button
                  onClick={() => setIsPickingKeyColor(!isPickingKeyColor)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isPickingKeyColor
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80"
                  }`}
                >
                  <Pipette className="w-3.5 h-3.5" />
                  <span>{isPickingKeyColor ? "点击原图拾取底色" : "吸管重拾底色"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
                {/* Tolerance */}
                <div className="space-y-2">
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                    <span>底色容差范围</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {tolerance}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={tolerance}
                    onChange={(e) => setTolerance(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    调大可吸取更多背景阴影
                  </span>
                </div>

                {/* Smoothness */}
                <div className="space-y-2">
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                    <span>边缘羽化平滑</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {smoothness}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={smoothness}
                    onChange={(e) => setSmoothness(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    消除边缘生硬毛刺感
                  </span>
                </div>

                {/* Color Spill */}
                <div className="space-y-2">
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                    <span>发丝反光溢色抑制</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {spillReduction}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={spillReduction}
                    onChange={(e) => setSpillReduction(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    去除头发边沿残留原底色
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Live Preview & Downloads */}
          <div className="space-y-6">
            {/* Single Photo Preview Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-between gap-5">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider w-full text-center pb-2 border-b border-slate-100 dark:border-slate-800">
                换色效果实时预览
              </div>

              <div
                className="relative rounded-2xl p-2 border border-slate-200 dark:border-slate-700 flex items-center justify-center max-h-[320px] shadow-inner overflow-hidden"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
                  backgroundSize: "12px 12px",
                }}
              >
                {processedDataUrl ? (
                  <img
                    src={processedDataUrl}
                    alt="换色预览"
                    className="max-h-[290px] max-w-full object-contain rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="text-xs text-slate-400 p-8">正在处理照片...</div>
                )}
              </div>

              <div className="w-full space-y-2">
                <button
                  onClick={handleDownloadSingle}
                  disabled={!processedDataUrl}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>下载单张高清照片 PNG</span>
                </button>

                <button
                  onClick={handleCreatePrintSheet}
                  disabled={!processedDataUrl || isGeneratingSheet}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Printer className="w-4 h-4 text-indigo-500" />
                  <span>{isGeneratingSheet ? "排版生成中..." : "生成 6 寸相纸冲印排版 (8张)"}</span>
                </button>
              </div>
            </div>

            {/* Print Sheet Card (if generated) */}
            {sheetDataUrl && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <span>6 寸冲印排版图预览</span>
                  <span className="text-emerald-500">已就绪</span>
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                  <img src={sheetDataUrl} alt="冲印排版" className="w-full h-auto block" />
                </div>

                <button
                  onClick={handleDownloadSheet}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>下载 6 寸冲印排版大图 JPG</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
