import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  WatermarkMode,
  SinglePosition,
  WatermarkOptions,
  WATERMARK_PRESETS,
  applyWatermark,
} from "./watermarkUtils";
import {
  Stamp,
  Upload,
  Download,
  Sliders,
  RotateCcw,
  Sparkles,
  Layers,
  Eye,
  Type,
} from "lucide-react";

export default function ImageWatermark() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const [mode, setMode] = useState<WatermarkMode>("tile");
  const [text, setText] = useState<string>("仅供办理业务使用 · 复印无效");
  const [fontSize, setFontSize] = useState<number>(32);
  const [color, setColor] = useState<string>("#DC2626");
  const [opacity, setOpacity] = useState<number>(0.35);
  const [rotate, setRotate] = useState<number>(-25);
  const [gapX, setGapX] = useState<number>(100);
  const [gapY, setGapY] = useState<number>(80);
  const [position, setPosition] = useState<SinglePosition>("bottom-right");
  const [margin, setMargin] = useState<number>(30);
  const [outputFormat, setOutputFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [quality, setQuality] = useState<number>(0.92);

  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // 初始化样例图（模拟证件卡片图样）
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 640;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // 浅色卡片背景
      ctx.fillStyle = "#F8FAFC";
      ctx.fillRect(0, 0, 1000, 640);

      // 装饰底纹与卡片框架
      ctx.strokeStyle = "#CBD5E1";
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, 920, 560);

      // 头像占位框
      ctx.fillStyle = "#E2E8F0";
      ctx.fillRect(80, 100, 200, 260);

      // 信息条占位
      ctx.fillStyle = "#64748B";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText("居民身份证 / 证件测试样张", 320, 140);

      ctx.fillStyle = "#94A3B8";
      ctx.font = "24px sans-serif";
      ctx.fillText("姓名：张三 (示例)", 320, 200);
      ctx.fillText("性别：男   民族：汉", 320, 250);
      ctx.fillText("公民身份号码：11010119900307239X", 320, 300);
      ctx.fillText("住址：北京市海淀区中关村南大街 1 号", 320, 350);

      const url = canvas.toDataURL("image/png");
      setImageSrc(url);
      setNaturalSize({ width: 1000, height: 640 });
    }
  }, []);

  const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
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

  // 生成实时水印预览
  useEffect(() => {
    if (!imgRef.current) return;

    let isMounted = true;
    const runWatermark = async () => {
      try {
        if (!imgRef.current) return;
        const options: WatermarkOptions = {
          mode,
          text,
          fontSize,
          color,
          opacity,
          rotate,
          gapX,
          gapY,
          position,
          margin,
          outputFormat,
          quality,
        };
        const blob = await applyWatermark(imgRef.current, options);
        if (isMounted) {
          const url = URL.createObjectURL(blob);
          setPreviewBlobUrl(url);
        }
      } catch {}
    };

    runWatermark();
    return () => {
      isMounted = false;
    };
  }, [
    mode,
    text,
    fontSize,
    color,
    opacity,
    rotate,
    gapX,
    gapY,
    position,
    margin,
    outputFormat,
    quality,
    imageSrc,
  ]);

  const handleDownload = () => {
    if (!previewBlobUrl) return;
    const ext = outputFormat.split("/")[1] || "png";
    const a = document.createElement("a");
    a.href = previewBlobUrl;
    a.download = `watermarked_${Date.now()}.${ext}`;
    a.click();
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

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Stamp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              图片水印添加器
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              证件照防盗用全屏平铺水印、指定方位水印、字体大小与透明度旋转调校，100% 纯本地离线处理
            </p>
          </div>
        </div>
      </div>

      {/* Presets Quick Picker */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>常用防盗与防滥用水印文案</span>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-500" />
            <span>上传图片</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {WATERMARK_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => setText(preset)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-all cursor-pointer shadow-2xs"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Two Columns Workspace: Left Controls - Right Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>水印样式与排布设置</span>
            </span>

            {/* Mode Switch */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium">
              <button
                onClick={() => setMode("tile")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  mode === "tile"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                全屏平铺
              </button>
              <button
                onClick={() => setMode("single")}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  mode === "single"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                单处定位
              </button>
            </div>
          </div>

          {/* Text Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              水印文字内容
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="请输入水印文字..."
              className="w-full px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Color & Opacity & Font size */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Color */}
            <div className="space-y-1.5 text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">水印颜色</span>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-6 h-6 rounded-md border-0 p-0 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-20 font-mono font-bold text-slate-800 dark:text-slate-200 bg-transparent border-0 uppercase outline-none"
                />
              </div>
            </div>

            {/* Opacity */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                <span>不透明度</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {Math.round(opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Font Size */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                <span>文字字号</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {fontSize}px
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="80"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Mode Specific Controls */}
          {mode === "tile" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
              {/* Rotation */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                  <span>倾斜旋转角度</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {rotate}°
                  </span>
                </div>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  value={rotate}
                  onChange={(e) => setRotate(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Gap X */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                  <span>水平横向间距</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {gapX}px
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={gapX}
                  onChange={(e) => setGapX(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Gap Y */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                  <span>垂直纵向间距</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {gapY}px
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={gapY}
                  onChange={(e) => setGapY(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
              {/* Single Position */}
              <div className="space-y-1.5">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  水印锚定方位
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as SinglePosition)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none font-medium"
                >
                  <option value="top-left">左上方</option>
                  <option value="top-center">正上方</option>
                  <option value="top-right">右上方</option>
                  <option value="center-left">正左方</option>
                  <option value="center">正中间</option>
                  <option value="center-right">正右方</option>
                  <option value="bottom-left">左下方</option>
                  <option value="bottom-center">正下方</option>
                  <option value="bottom-right">右下方 (默认)</option>
                </select>
              </div>

              {/* Margin */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                  <span>边距距离</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {margin}px
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between items-center gap-6">
          <div className="w-full text-center pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            水印合成实时预览
          </div>

          <div className="relative p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center aspect-video w-full max-w-[280px] shadow-inner overflow-hidden">
            {previewBlobUrl ? (
              <img
                src={previewBlobUrl}
                alt="Watermarked Preview"
                className="w-full h-full object-contain drop-shadow-sm rounded-lg"
              />
            ) : (
              <span className="text-xs text-slate-400">正在生成预览...</span>
            )}
          </div>

          <div className="w-full space-y-2 font-mono text-center text-xs text-slate-400">
            <div>
              图像分辨率: {naturalSize.width} × {naturalSize.height}
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>下载添加水印后的图片</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
