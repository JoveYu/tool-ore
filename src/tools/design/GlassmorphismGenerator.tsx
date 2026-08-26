import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Code2,
  Palette,
  Sun,
  Moon,
  Layers,
  Box,
  CircleDot,
  Radio,
  Eye,
} from "lucide-react";
import { CodeViewer } from "../../components/CodeViewer";
import {
  GlassStyleMode,
  GlassOptions,
  GlassOutput,
  GLASS_PRESETS,
  computeGlassmorphism,
} from "./glassmorphismUtils";

const BACKGROUND_SCENES = [
  {
    id: "mesh_gradient",
    name: "霓虹网格渐变",
    style: "radial-gradient(at 15% 20%, rgb(99, 102, 241) 0px, transparent 50%), radial-gradient(at 85% 15%, rgb(236, 72, 153) 0px, transparent 50%), radial-gradient(at 50% 80%, rgb(16, 185, 129) 0px, transparent 50%), radial-gradient(at 80% 85%, rgb(245, 158, 11) 0px, transparent 50%), rgb(30, 41, 59)",
  },
  {
    id: "vibrant_sunset",
    name: "落日晚霞绚丽",
    style: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 50%, #4D96FF 100%)",
  },
  {
    id: "cool_cyan",
    name: "极光青蓝冷色",
    style: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)",
  },
  {
    id: "clean_slate",
    name: "极简浅灰背景",
    style: "#E2E8F0",
  },
];

export default function GlassmorphismGenerator() {
  const [mode, setMode] = useState<GlassStyleMode>("glass");
  const [blur, setBlur] = useState<number>(16);
  const [opacity, setOpacity] = useState<number>(0.25);
  const [color, setColor] = useState<string>("#FFFFFF");
  const [borderWidth, setBorderWidth] = useState<number>(1);
  const [borderOpacity, setBorderOpacity] = useState<number>(0.3);
  const [borderRadius, setBorderRadius] = useState<number>(24);
  const [shadowBlur, setShadowBlur] = useState<number>(20);
  const [shadowOpacity, setShadowOpacity] = useState<number>(0.12);
  const [neuDistance, setNeuDistance] = useState<number>(8);
  const [neuIntensity, setNeuIntensity] = useState<number>(0.18);

  const [bgScene, setBgScene] = useState<string>("mesh_gradient");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<"css" | "tailwind">("css");

  const options: GlassOptions = useMemo(
    () => ({
      mode,
      blur,
      opacity,
      color,
      borderWidth,
      borderOpacity,
      borderRadius,
      shadowBlur,
      shadowOpacity,
      neuDistance,
      neuIntensity,
    }),
    [
      mode,
      blur,
      opacity,
      color,
      borderWidth,
      borderOpacity,
      borderRadius,
      shadowBlur,
      shadowOpacity,
      neuDistance,
      neuIntensity,
    ]
  );

  const output: GlassOutput = useMemo(() => {
    return computeGlassmorphism(options);
  }, [options]);

  const handleApplyPreset = (p: (typeof GLASS_PRESETS)[0]) => {
    setMode(p.options.mode);
    setBlur(p.options.blur);
    setOpacity(p.options.opacity);
    setColor(p.options.color);
    setBorderWidth(p.options.borderWidth);
    setBorderOpacity(p.options.borderOpacity);
    setBorderRadius(p.options.borderRadius);
    setShadowBlur(p.options.shadowBlur);
    setShadowOpacity(p.options.shadowOpacity);
    if (p.options.neuDistance) setNeuDistance(p.options.neuDistance);
    if (p.options.neuIntensity) setNeuIntensity(p.options.neuIntensity);
    if (p.options.mode !== "glass") {
      setBgScene("clean_slate");
    } else if (bgScene === "clean_slate") {
      setBgScene("mesh_gradient");
    }
  };

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const currentBgStyle = BACKGROUND_SCENES.find((s) => s.id === bgScene)?.style || BACKGROUND_SCENES[0].style;

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
              CSS 毛玻璃与拟态效果生成
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              可视化实时调校 Backdrop Blur 毛玻璃透光特效与软拟物光影，一键复制纯 CSS 与 Tailwind 类代码
            </p>
          </div>
        </div>
      </div>

      {/* Quick Presets Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>常用高颜值视觉风格预设</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {GLASS_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleApplyPreset(p)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-all cursor-pointer shadow-2xs"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sliders & Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>视觉风格与光影参数</span>
            </span>
          </div>

          {/* Mode Selector */}
          <div className="space-y-2 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">特效模式</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "glass", label: "现代毛玻璃" },
                { id: "neumorphism_flat", label: "软拟物凸起" },
                { id: "neumorphism_inset", label: "软拟物内凹" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMode(m.id as GlassStyleMode);
                    if (m.id !== "glass") setBgScene("clean_slate");
                  }}
                  className={`py-2 px-1 text-center rounded-xl border font-semibold transition-all cursor-pointer ${
                    mode === m.id
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs ring-2 ring-indigo-500/20"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Controls for Glassmorphism */}
          {mode === "glass" && (
            <div className="space-y-4 text-xs">
              {/* Blur Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                  <span>背景模糊半径 (Blur)</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">{blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={blur}
                  onChange={(e) => setBlur(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Opacity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                  <span>背景透光透明度</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    {Math.round(opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.95"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Tint Color */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">玻璃色调</span>
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
                    className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200 bg-transparent border-0 uppercase outline-none flex-1"
                  />
                </div>
              </div>

              {/* Border Controls */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>边框高光粗细</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{borderWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="1"
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>边框透明度</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {Math.round(borderOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={borderOpacity}
                    onChange={(e) => setBorderOpacity(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Radius & Shadow */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>圆角半径</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="2"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>景深阴影</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{shadowBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="2"
                    value={shadowBlur}
                    onChange={(e) => setShadowBlur(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Controls for Neumorphism */}
          {mode !== "glass" && (
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">基准底色</span>
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
                    className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200 bg-transparent border-0 uppercase outline-none flex-1"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                  <span>阴影偏移距离</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">{neuDistance}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={neuDistance}
                  onChange={(e) => setNeuDistance(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                  <span>光影对比度强度</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    {Math.round(neuIntensity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.4"
                  step="0.02"
                  value={neuIntensity}
                  onChange={(e) => setNeuIntensity(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                  <span>圆角半径</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">{borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="2"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visual Stage & Code View (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Visual Live Stage */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-500" />
                <span>实时效果演示舞台</span>
              </div>

              {/* Background scene selector */}
              {mode === "glass" && (
                <div className="flex items-center gap-1.5 text-xs">
                  {BACKGROUND_SCENES.map((scene) => (
                    <button
                      key={scene.id}
                      onClick={() => setBgScene(scene.id)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        bgScene === scene.id
                          ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold"
                          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {scene.name.slice(0, 4)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Stage Box */}
            <div
              className="relative w-full aspect-video min-h-[280px] rounded-2xl p-8 flex items-center justify-center overflow-hidden transition-all shadow-inner"
              style={{
                background: mode === "glass" ? currentBgStyle : color,
              }}
            >
              {/* Foreground Glass Card (Mock Credit Card / Player Card) */}
              <div
                style={output.cssStyles}
                className="w-full max-w-sm p-6 flex flex-col justify-between space-y-4 transition-all select-none"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/80 flex items-center justify-center text-white font-bold shadow-xs">
                      ✨
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-800 dark:text-white tracking-wide">
                        GLASSMORPHISM
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-300 font-mono">
                        Modern UI Card
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-200 backdrop-blur-xs">
                    PRO
                  </span>
                </div>

                <div className="space-y-1 py-2">
                  <div className="font-mono text-sm sm:text-base font-bold text-slate-800 dark:text-white tracking-widest">
                    4288 •••• •••• 8848
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-300">
                    Blur {blur}px · Opacity {Math.round(opacity * 100)}%
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 pt-2 border-t border-black/5 dark:border-white/10">
                  <span>EXPIRES: 08/28</span>
                  <span className="font-mono">VALID</span>
                </div>
              </div>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setActiveCodeTab("css")}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    activeCodeTab === "css"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  CSS 样式声明
                </button>
                <button
                  onClick={() => setActiveCodeTab("tailwind")}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    activeCodeTab === "tailwind"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Tailwind CSS 类名
                </button>
              </div>

              <button
                onClick={() =>
                  handleCopy(
                    "code",
                    activeCodeTab === "css" ? output.cssCode : output.tailwindClass
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
              >
                {copiedKey === "code" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>已复制代码</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>复制代码</span>
                  </>
                )}
              </button>
            </div>

            <CodeViewer
              code={activeCodeTab === "css" ? output.cssCode : output.tailwindClass}
              language={activeCodeTab === "css" ? "css" : "text"}
              maxHeight="200px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
