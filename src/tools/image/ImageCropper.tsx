import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  AspectRatioType,
  ShapeType,
  CropArea,
  CropOptions,
  getDefaultCropArea,
  cropImageToBlob,
  sliceNineGrid,
} from "./cropperUtils";
import {
  Crop as CropIcon,
  Upload,
  Download,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  Grid3X3,
  Layers,
  Sparkles,
  Check,
  RotateCcw,
} from "lucide-react";

type Mode = "crop" | "grid";

export default function ImageCropper() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const [mode, setMode] = useState<Mode>("crop");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("1:1");
  const [shape, setShape] = useState<ShapeType>("rect");
  const [borderRadius, setBorderRadius] = useState<number>(30);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [outputFormat, setOutputFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [quality, setQuality] = useState<number>(0.92);

  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [nineGridPieces, setNineGridPieces] = useState<{ index: number; dataUrl: string }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // 初始化样例图片
  useEffect(() => {
    // 创建一个渐变几何图案作为初始样例图片
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 800, 800);
      grad.addColorStop(0, "#6366F1");
      grad.addColorStop(0.5, "#A855F7");
      grad.addColorStop(1, "#EC4899");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 800);

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(400, 400, 200, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#4F46E5";
      ctx.font = "bold 48px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Tool-Ore", 400, 400);

      const url = canvas.toDataURL("image/png");
      setImageSrc(url);
      setNaturalSize({ width: 800, height: 800 });
      setCropArea(getDefaultCropArea(800, 800, "1:1"));
    }
  }, []);

  // 比例改变时重算默认裁剪区
  useEffect(() => {
    if (naturalSize.width > 0 && naturalSize.height > 0) {
      setCropArea(getDefaultCropArea(naturalSize.width, naturalSize.height, aspectRatio));
    }
  }, [aspectRatio, naturalSize]);

  // 处理图片加载
  const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setCropArea(getDefaultCropArea(img.naturalWidth, img.naturalHeight, aspectRatio));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (src) {
        setImageSrc(src);
      }
    };
    reader.readAsDataURL(file);
  };

  // 生成实时裁剪预览
  useEffect(() => {
    if (!imgRef.current || cropArea.width === 0 || cropArea.height === 0) return;

    let isMounted = true;
    const runCrop = async () => {
      try {
        if (!imgRef.current) return;
        const options: CropOptions = {
          cropArea,
          shape,
          borderRadius,
          rotation,
          flipH,
          flipV,
          outputFormat,
          quality,
        };
        const blob = await cropImageToBlob(imgRef.current, options);
        if (isMounted) {
          const url = URL.createObjectURL(blob);
          setPreviewBlobUrl(url);
        }
      } catch {}
    };

    runCrop();
    return () => {
      isMounted = false;
    };
  }, [cropArea, shape, borderRadius, rotation, flipH, flipV, outputFormat, quality, imageSrc]);

  // 九宫格切图计算
  useEffect(() => {
    if (mode !== "grid" || !imgRef.current) return;
    const runSlice = async () => {
      if (!imgRef.current) return;
      const pieces = await sliceNineGrid(imgRef.current, "image/jpeg");
      setNineGridPieces(pieces);
    };
    runSlice();
  }, [mode, imageSrc]);

  const handleDownloadSingle = () => {
    if (!previewBlobUrl) return;
    const ext = outputFormat.split("/")[1] || "png";
    const a = document.createElement("a");
    a.href = previewBlobUrl;
    a.download = `cropped_${cropArea.width}x${cropArea.height}_${Date.now()}.${ext}`;
    a.click();
  };

  const handleDownloadGridPiece = (dataUrl: string, index: number) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `grid_slice_0${index}.jpg`;
    a.click();
  };

  const handleDownloadAllGridPieces = () => {
    nineGridPieces.forEach((piece, idx) => {
      setTimeout(() => {
        handleDownloadGridPiece(piece.dataUrl, piece.index);
      }, idx * 150);
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hidden Image for processing */}
      {imageSrc && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Source"
          onLoad={handleImageLoaded}
          className="hidden"
          crossOrigin="anonymous"
        />
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <CropIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                图片裁剪与圆角切图
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                支持多比例自由裁剪、正圆与圆角头像裁切、旋转镜像与朋友圈九宫格切图导出
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium">
              <button
                onClick={() => setMode("crop")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  mode === "crop"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                自由裁剪 / 圆角
              </button>
              <button
                onClick={() => setMode("grid")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  mode === "grid"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                九宫格切图
              </button>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>更换图片</span>
            </button>
          </div>
        </div>
      </div>

      {mode === "crop" ? (
        /* ================= CROP / CORNER RADIUS MODE ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Column */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>裁剪比例与形状参数</span>
            </div>

            {/* Aspect Ratio Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                预设裁剪比例
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                {[
                  { id: "free", label: "自由比例" },
                  { id: "1:1", label: "1:1 正方形" },
                  { id: "4:3", label: "4:3 标准" },
                  { id: "16:9", label: "16:9 宽屏" },
                  { id: "3:4", label: "3:4 竖版" },
                  { id: "9:16", label: "9:16 手机" },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setAspectRatio(r.id as AspectRatioType)}
                    className={`py-2 px-1 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                      aspectRatio === r.id
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shape & Corner Radius */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  裁剪外形
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: "rect", label: "直角方形" },
                    { id: "rounded", label: "平滑圆角" },
                    { id: "circle", label: "圆形头像" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setShape(s.id as ShapeType)}
                      className={`py-2 rounded-xl border font-semibold text-center transition-all cursor-pointer ${
                        shape === s.id
                          ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {shape === "rounded" && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span>圆角半径</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {borderRadius}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="160"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Transformations: Rotate & Flip */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                方向旋转与镜像翻转
              </label>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-indigo-500" />
                  <span>顺时针旋转 90° ({rotation}°)</span>
                </button>

                <button
                  onClick={() => setFlipH(!flipH)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                    flipH
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>水平翻转</span>
                </button>

                <button
                  onClick={() => setFlipV(!flipV)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                    flipV
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  <span>垂直翻转</span>
                </button>
              </div>
            </div>

            {/* Export Format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
              <div className="space-y-1.5">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  导出格式
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none font-medium"
                >
                  <option value="image/png">PNG (透明圆角通道支持)</option>
                  <option value="image/jpeg">JPG (标准高压缩)</option>
                  <option value="image/webp">WebP (下一代高效格式)</option>
                </select>
              </div>

              {outputFormat !== "image/png" && (
                <div className="space-y-1.5">
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>图像画质</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {Math.round(quality * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Preview & Download Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between items-center gap-6">
            <div className="w-full text-center pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              裁剪效果预览
            </div>

            <div className="relative p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center aspect-square w-full max-w-[260px] shadow-inner overflow-hidden">
              {previewBlobUrl ? (
                <img
                  src={previewBlobUrl}
                  alt="Cropped Preview"
                  className="w-full h-full object-contain drop-shadow-sm"
                />
              ) : (
                <span className="text-xs text-slate-400">正在生成预览...</span>
              )}
            </div>

            <div className="w-full space-y-2 font-mono text-center text-xs text-slate-400">
              <div>
                裁剪尺寸: {cropArea.width} × {cropArea.height} 像素
              </div>

              <button
                onClick={handleDownloadSingle}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>下载裁剪后图片</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= 3x3 NINE GRID SLICER MODE ================= */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <Grid3X3 className="w-4 h-4 text-indigo-500" />
              <span>朋友圈 / 微博 3×3 九宫格切图预览</span>
            </div>

            <button
              onClick={handleDownloadAllGridPieces}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-center"
            >
              <Download className="w-4 h-4" />
              <span>一键批量下载全部 9 张切图</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            {nineGridPieces.map((piece) => (
              <div
                key={piece.index}
                className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm"
              >
                <img
                  src={piece.dataUrl}
                  alt={`Slice ${piece.index}`}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDownloadGridPiece(piece.dataUrl, piece.index)}
                    className="p-2 rounded-lg bg-white/90 hover:bg-white text-slate-900 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
                    title={`下载第 ${piece.index} 张切图`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>#{piece.index}</span>
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
