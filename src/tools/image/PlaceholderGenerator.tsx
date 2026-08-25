import React, { useState, useEffect, useMemo } from "react";
import {
  PlaceholderOptions,
  PLACEHOLDER_SIZE_PRESETS,
  renderPlaceholderToBlob,
} from "./placeholderUtils";
import {
  Image as ImageIcon,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Sparkles,
  Layers,
  FileCode,
} from "lucide-react";

export default function PlaceholderGenerator() {
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(500);
  const [bgColor, setBgColor] = useState<string>("#6366F1");
  const [textColor, setTextColor] = useState<string>("#FFFFFF");
  const [customText, setCustomText] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(44);
  const [showDiagonalLines, setShowDiagonalLines] = useState<boolean>(true);
  const [showBorder, setShowBorder] = useState<boolean>(true);
  const [format, setFormat] = useState<"image/png" | "image/jpeg" | "image/webp" | "image/svg+xml">("image/png");

  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const options: PlaceholderOptions = useMemo(
    () => ({
      width,
      height,
      bgColor,
      textColor,
      customText,
      fontSize,
      showDiagonalLines,
      showBorder,
      format,
    }),
    [
      width,
      height,
      bgColor,
      textColor,
      customText,
      fontSize,
      showDiagonalLines,
      showBorder,
      format,
    ]
  );

  useEffect(() => {
    let isMounted = true;
    const runGenerate = async () => {
      try {
        const blob = await renderPlaceholderToBlob(options);
        if (isMounted) {
          const url = URL.createObjectURL(blob);
          setPreviewBlobUrl(url);
        }
      } catch {}
    };

    runGenerate();
    return () => {
      isMounted = false;
    };
  }, [options]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownload = () => {
    if (!previewBlobUrl) return;
    const ext = format === "image/svg+xml" ? "svg" : format.split("/")[1] || "png";
    const a = document.createElement("a");
    a.href = previewBlobUrl;
    a.download = `placeholder_${width}x${height}_${Date.now()}.${ext}`;
    a.click();
  };

  const handlePresetSelect = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
    setFontSize(Math.max(18, Math.floor(Math.min(w, h) / 12)));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              自定义占位图生成器
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              快速生成任意尺寸规格的网页开发占位图片，支持对角线、自定义文本色彩与 PNG/SVG 导出
            </p>
          </div>
        </div>
      </div>

      {/* Preset Sizes */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>常用标准分辨率规格:</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {PLACEHOLDER_SIZE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetSelect(preset.width, preset.height)}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                width === preset.width && height === preset.height
                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Control Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Settings */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>尺寸与样式参数</span>
            </span>
          </div>

          {/* Width & Height */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                宽度 (Width px)
              </label>
              <input
                type="number"
                min="10"
                max="4000"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full px-3.5 py-2 font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                高度 (Height px)
              </label>
              <input
                type="number"
                min="10"
                max="4000"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-3.5 py-2 font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Custom Text */}
          <div className="space-y-1.5 text-xs">
            <label className="font-medium text-slate-700 dark:text-slate-300">
              自定义居中文字 (留空则默认显示尺寸)
            </label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={`默认: ${width} × ${height}`}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Colors & Font size */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Background Color */}
            <div className="space-y-1.5">
              <span className="font-medium text-slate-700 dark:text-slate-300">背景颜色</span>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-6 h-6 rounded-md border-0 p-0 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-20 font-mono font-bold text-slate-800 dark:text-slate-200 bg-transparent border-0 uppercase outline-none"
                />
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-1.5">
              <span className="font-medium text-slate-700 dark:text-slate-300">文字颜色</span>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-6 h-6 rounded-md border-0 p-0 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-20 font-mono font-bold text-slate-800 dark:text-slate-200 bg-transparent border-0 uppercase outline-none"
                />
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                <span>文字字号</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {fontSize}px
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="120"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Options & Formats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
            {/* Format Selector */}
            <div className="space-y-1.5">
              <label className="font-medium text-slate-700 dark:text-slate-300">生成文件格式</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none font-medium"
              >
                <option value="image/png">PNG 图片</option>
                <option value="image/jpeg">JPG 图片</option>
                <option value="image/webp">WebP 图片</option>
                <option value="image/svg+xml">SVG 矢量图</option>
              </select>
            </div>

            {/* Toggles */}
            <div className="flex flex-col justify-end space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showDiagonalLines}
                  onChange={(e) => setShowDiagonalLines(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">显示对角交叉线</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showBorder}
                  onChange={(e) => setShowBorder(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">显示内侧边框</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Preview & Download Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between items-center gap-6">
          <div className="w-full text-center pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            占位图实时预览
          </div>

          <div className="relative p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center aspect-video w-full max-w-[280px] shadow-inner overflow-hidden">
            {previewBlobUrl ? (
              <img
                src={previewBlobUrl}
                alt="Placeholder Preview"
                className="w-full h-full object-contain drop-shadow-sm rounded-lg"
              />
            ) : (
              <span className="text-xs text-slate-400">正在生成占位图...</span>
            )}
          </div>

          <div className="w-full space-y-2 font-mono text-center text-xs text-slate-400">
            <div>
              生成规格: {width} × {height} 像素
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>下载占位图片</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
