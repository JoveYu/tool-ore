import React, { useState, useMemo } from "react";
import {
  transformSvgPath,
  SvgPathTransformOptions,
  PathBBox,
} from "./svgPathUtils";
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Move,
  Maximize2,
  FlipHorizontal,
  FlipVertical,
  Code2,
  Eye,
  Download,
} from "lucide-react";

export default function SvgPathEditor() {
  const samplePath = "M 20 20 L 80 20 L 90 60 L 50 90 L 10 60 Z";

  const [pathInput, setPathInput] = useState<string>(samplePath);
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);
  const [scaleX, setScaleX] = useState<number>(1);
  const [scaleY, setScaleY] = useState<number>(1);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [precision, setPrecision] = useState<number>(2);

  const [fillColor, setFillColor] = useState<string>("#6366F1");
  const [strokeColor, setStrokeColor] = useState<string>("#4F46E5");
  const [strokeWidth, setStrokeWidth] = useState<number>(2);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const options: SvgPathTransformOptions = useMemo(
    () => ({
      translateX,
      translateY,
      scaleX,
      scaleY,
      flipH,
      flipV,
      precision,
      toAbsolute: true,
    }),
    [translateX, translateY, scaleX, scaleY, flipH, flipV, precision]
  );

  const result = useMemo(
    () => transformSvgPath(pathInput, options),
    [pathInput, options]
  );

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleResetTransforms = () => {
    setTranslateX(0);
    setTranslateY(0);
    setScaleX(1);
    setScaleY(1);
    setFlipH(false);
    setFlipV(false);
  };

  const svgViewBox = useMemo(() => {
    const { bbox } = result;
    const padding = Math.max(10, Math.max(bbox.width, bbox.height) * 0.1);
    const minX = Math.floor(bbox.minX - padding);
    const minY = Math.floor(bbox.minY - padding);
    const w = Math.ceil(bbox.width + padding * 2);
    const h = Math.ceil(bbox.height + padding * 2);
    return `${minX} ${minY} ${w} ${h}`;
  }, [result]);

  const fullSvgCode = useMemo(() => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${svgViewBox}">
  <path d="${result.transformedPath}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
</svg>`;
  }, [svgViewBox, result.transformedPath, fillColor, strokeColor, strokeWidth]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              SVG 路径变换与调整
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              SVG Path (d 属性) 路径实时平移、缩放、水平/垂直镜像翻转、坐标包围盒计算与代码导出
            </p>
          </div>
        </div>
      </div>

      {/* Visual Canvas Preview Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <span>路径实时画布渲染</span>
          <span className="text-slate-400 font-mono text-[11px]">
            包围盒: {Math.round(result.bbox.width)} × {Math.round(result.bbox.height)} px
          </span>
        </div>

        <div className="w-full h-56 sm:h-72 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center p-8 overflow-hidden shadow-inner relative">
          {result.isValid && result.transformedPath ? (
            <svg
              viewBox={svgViewBox}
              className="w-full h-full max-h-56 object-contain drop-shadow-md"
            >
              <path
                d={result.transformedPath}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <span className="text-xs text-slate-400">请输入有效的 SVG Path 字符串</span>
          )}
        </div>
      </div>

      {/* Control Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input & Transform Sliders */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              原始 SVG Path (d 属性)
            </label>
            <button
              onClick={handleResetTransforms}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重置变换参数
            </button>
          </div>

          <textarea
            rows={4}
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            placeholder="粘贴 SVG path 的 d 属性字符串..."
            className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
          />

          {/* Transformation Sliders */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {/* Translate X & Y */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>平移 X (Translate X)</span>
                  <span className="font-mono">{translateX}px</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  value={translateX}
                  onChange={(e) => setTranslateX(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>平移 Y (Translate Y)</span>
                  <span className="font-mono">{translateY}px</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  value={translateY}
                  onChange={(e) => setTranslateY(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Scale X & Y */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>缩放 X (Scale X)</span>
                  <span className="font-mono">{scaleX}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={scaleX}
                  onChange={(e) => setScaleX(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>缩放 Y (Scale Y)</span>
                  <span className="font-mono">{scaleY}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={scaleY}
                  onChange={(e) => setScaleY(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Flip Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setFlipH(!flipH)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  flipH
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>水平翻转</span>
              </button>

              <button
                onClick={() => setFlipV(!flipV)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  flipV
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                <FlipVertical className="w-3.5 h-3.5" />
                <span>垂直翻转</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Transformed Output & Full SVG */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                变换后 Path (d 属性)
              </label>

              <button
                onClick={() => handleCopy("d", result.transformedPath)}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {copiedKey === "d" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>已复制 Path</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>复制 Path</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={4}
              readOnly
              value={result.transformedPath}
              className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-indigo-950 dark:text-indigo-200 outline-none select-all resize-none leading-relaxed"
            />

            {/* Complete SVG Code */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase">
                  完整 SVG 标签代码
                </span>
                <button
                  onClick={() => handleCopy("svg", fullSvgCode)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === "svg" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>复制完整 SVG</span>
                </button>
              </div>

              <textarea
                rows={4}
                readOnly
                value={fullSvgCode}
                className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none select-all resize-none leading-relaxed"
              />
            </div>
          </div>

          <button
            onClick={() => handleCopy("all_d", result.transformedPath)}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>一键复制变换后的 Path</span>
          </button>
        </div>
      </div>
    </div>
  );
}
