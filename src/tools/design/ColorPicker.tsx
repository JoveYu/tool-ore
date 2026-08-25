import React, { useState, useRef } from "react";
import { calculateAllFormats, ColorFormats, rgbToHex } from "./colorUtils";
import {
  Pipette,
  UploadCloud,
  Copy,
  Check,
  RotateCcw,
  ZoomIn,
  Sparkles,
} from "lucide-react";

export default function ColorPicker() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<{ r: number; g: number; b: number } | null>(
    null
  );
  const [hoverColor, setHoverColor] = useState<{
    r: number;
    g: number;
    b: number;
    x: number;
    y: number;
  } | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Check EyeDropper API support
  const isEyeDropperSupported = typeof window !== "undefined" && "EyeDropper" in window;

  const formats: ColorFormats | null = selectedColor
    ? calculateAllFormats(selectedColor.r, selectedColor.g, selectedColor.b)
    : null;

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("请上传有效的图片文件");
      return;
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      imgRef.current = img;
      renderImageToCanvas(img);
    };
  };

  const renderImageToCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    setHoverColor({ r: pixel[0], g: pixel[1], b: pixel[2], x, y });

    // Draw Zoom Loupe
    const zoomCanvas = zoomCanvasRef.current;
    if (zoomCanvas) {
      const zCtx = zoomCanvas.getContext("2d");
      if (zCtx) {
        zCtx.imageSmoothingEnabled = false;
        zCtx.clearRect(0, 0, zoomCanvas.width, zoomCanvas.height);

        const zoomSize = 11; // 11x11 square around cursor
        const half = Math.floor(zoomSize / 2);
        const sx = Math.max(0, Math.min(canvas.width - zoomSize, x - half));
        const sy = Math.max(0, Math.min(canvas.height - zoomSize, y - half));

        zCtx.drawImage(
          canvas,
          sx,
          sy,
          zoomSize,
          zoomSize,
          0,
          0,
          zoomCanvas.width,
          zoomCanvas.height
        );

        // Center crosshair
        const center = zoomCanvas.width / 2;
        const cell = zoomCanvas.width / zoomSize;
        zCtx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        zCtx.lineWidth = 2;
        zCtx.strokeRect(center - cell / 2, center - cell / 2, cell, cell);
        zCtx.strokeStyle = "rgba(0, 0, 0, 0.6)";
        zCtx.lineWidth = 1;
        zCtx.strokeRect(center - cell / 2 - 1, center - cell / 2 - 1, cell + 2, cell + 2);
      }
    }
  };

  const handleCanvasClick = () => {
    if (hoverColor) {
      const newColor = { r: hoverColor.r, g: hoverColor.g, b: hoverColor.b };
      setSelectedColor(newColor);
      const hex = rgbToHex(newColor.r, newColor.g, newColor.b);
      setHistory((prev) => [hex, ...prev.filter((h) => h !== hex)].slice(0, 10));
    }
  };

  // Native Browser EyeDropper API (can pick anywhere on screen)
  const handleNativeEyeDropper = async () => {
    if (!isEyeDropperSupported) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eyeDropper = new (window as any).EyeDropper();
      const res = await eyeDropper.open();
      const hex = res.sRGBHex.toUpperCase();
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      setSelectedColor({ r, g, b });
      setHistory((prev) => [hex, ...prev.filter((h) => h !== hex)].slice(0, 10));
    } catch {
      // User cancelled pipette
    }
  };

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Pipette className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              颜色拾取器
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              高倍放大镜精准拾色，支持屏幕任意位置吸管取色，并提供 HEX, RGB, HSL, HSV, CMYK 多格式换算
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Image / Canvas Area */}
        <div className="lg:col-span-2 space-y-4">
          {!imageUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900/60 rounded-3xl p-12 text-center cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-500/5 group min-h-[380px] flex flex-col items-center justify-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                上传图片以开始吸色
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                点击选择或拖放图片到此处 (PNG, JPG, WebP)
              </p>
              {isEyeDropperSupported && (
                <div className="mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNativeEyeDropper();
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    <Pipette className="w-3.5 h-3.5" />
                    屏幕吸管拾色
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Pipette className="w-3.5 h-3.5 text-indigo-500" />
                  移动鼠标预览像素，点击图片锁定颜色
                  {hoverColor && (
                    <span className="font-mono ml-2">
                      (坐标: {hoverColor.x}, {hoverColor.y})
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {isEyeDropperSupported && (
                    <button
                      onClick={handleNativeEyeDropper}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-2xs transition-all cursor-pointer"
                    >
                      <Pipette className="w-3 h-3" />
                      屏幕吸管
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setImageUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    更换图片
                  </button>
                </div>
              </div>

              {/* Main Canvas with Custom Cursor */}
              <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 max-h-[500px] flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={() => setHoverColor(null)}
                  onClick={handleCanvasClick}
                  className="max-h-[500px] max-w-full object-contain cursor-crosshair"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Color Output & Loupe Inspector */}
        <div className="space-y-6">
          {/* Zoom Loupe & Active Hover Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  像素放大镜
                </h3>
              </div>
              {hoverColor ? (
                <div
                  className="w-7 h-7 rounded-lg border border-black/10 dark:border-white/10 shadow-xs"
                  style={{
                    backgroundColor: `rgb(${hoverColor.r}, ${hoverColor.g}, ${hoverColor.b})`,
                  }}
                />
              ) : selectedColor ? (
                <div
                  className="w-7 h-7 rounded-lg border border-black/10 dark:border-white/10 shadow-xs"
                  style={{
                    backgroundColor: `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`,
                  }}
                />
              ) : (
                <div className="w-7 h-7 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800" />
              )}
            </div>

            <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 flex items-center justify-center shadow-inner">
              <canvas
                ref={zoomCanvasRef}
                width={160}
                height={160}
                className="w-full h-full"
              />
              {!hoverColor && !imageUrl && (
                <span className="text-xs text-slate-500 absolute">等待上传与悬停...</span>
              )}
            </div>
          </div>

          {/* Color Values & Formats */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            {formats ? (
              <>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl shadow-md border border-black/10 dark:border-white/10 shrink-0"
                    style={{ backgroundColor: formats.hex }}
                  />
                  <div>
                    <div className="text-xs font-medium text-slate-400">已拾取颜色</div>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      {formats.hex}
                    </div>
                  </div>
                </div>

                {/* Formats Copy List */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {[
                    { label: "HEX", val: formats.hex },
                    { label: "RGB", val: formats.rgb },
                    { label: "HSL", val: formats.hsl },
                    { label: "HSV", val: formats.hsv },
                    { label: "CMYK", val: formats.cmyk },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs font-mono"
                    >
                      <span className="text-slate-400 font-sans font-semibold w-12">
                        {item.label}
                      </span>
                      <span className="truncate flex-1 text-slate-800 dark:text-slate-200 select-all">
                        {item.val}
                      </span>
                      <button
                        onClick={() => handleCopy(item.label, item.val)}
                        className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ml-2 cursor-pointer"
                        title="复制"
                      >
                        {copiedKey === item.label ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Pipette className="w-5 h-5" />
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  暂未拾取颜色
                </div>
                <div className="text-[11px] text-slate-400">
                  点击图片中任意像素或使用屏幕吸管取色
                </div>
              </div>
            )}

            {/* History Palette */}
            {history.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-medium text-slate-400">取色历史</div>
                <div className="flex flex-wrap gap-2">
                  {history.map((hex) => (
                    <button
                      key={hex}
                      onClick={() => {
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        setSelectedColor({ r, g, b });
                      }}
                      className="w-7 h-7 rounded-lg border border-black/10 dark:border-white/10 hover:scale-110 transition-transform shadow-xs cursor-pointer"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
