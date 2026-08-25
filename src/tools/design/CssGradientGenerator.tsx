import React, { useState, useMemo } from "react";
import {
  GradientConfig,
  ShadowLayer,
  buildGradientCss,
  buildBoxShadowCss,
  GRADIENT_PRESETS,
  SHADOW_PRESETS,
} from "./cssUtils";
import {
  Palette,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Sun,
} from "lucide-react";

type ActiveTab = "gradient" | "shadow";

export default function CssGradientGenerator() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("gradient");

  // 渐变状态
  const [gradientConfig, setGradientConfig] = useState<GradientConfig>(
    GRADIENT_PRESETS[0].config
  );

  // 阴影状态
  const [shadowLayers, setShadowLayers] = useState<ShadowLayer[]>(
    SHADOW_PRESETS[0].layers
  );

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 计算输出
  const gradientOutput = useMemo(
    () => buildGradientCss(gradientConfig),
    [gradientConfig]
  );
  const shadowOutput = useMemo(
    () => buildBoxShadowCss(shadowLayers),
    [shadowLayers]
  );

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // 渐变停靠点操作
  const handleAddStop = () => {
    const newStop = {
      id: Math.random().toString(36).slice(2, 9),
      color: "#3B82F6",
      position: 50,
    };
    setGradientConfig({
      ...gradientConfig,
      stops: [...gradientConfig.stops, newStop],
    });
  };

  const handleRemoveStop = (id: string) => {
    if (gradientConfig.stops.length <= 2) return;
    setGradientConfig({
      ...gradientConfig,
      stops: gradientConfig.stops.filter((s) => s.id !== id),
    });
  };

  const handleUpdateStop = (id: string, field: "color" | "position", val: any) => {
    setGradientConfig({
      ...gradientConfig,
      stops: gradientConfig.stops.map((s) => (s.id === id ? { ...s, [field]: val } : s)),
    });
  };

  // 阴影层操作
  const handleAddShadowLayer = () => {
    const newLayer: ShadowLayer = {
      id: Math.random().toString(36).slice(2, 9),
      x: 0,
      y: 8,
      blur: 16,
      spread: 0,
      color: "rgba(0, 0, 0, 0.1)",
      inset: false,
    };
    setShadowLayers([...shadowLayers, newLayer]);
  };

  const handleRemoveShadowLayer = (id: string) => {
    setShadowLayers(shadowLayers.filter((l) => l.id !== id));
  };

  const handleUpdateShadowLayer = (id: string, field: keyof ShadowLayer, val: any) => {
    setShadowLayers(
      shadowLayers.map((l) => (l.id === id ? { ...l, [field]: val } : l))
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                CSS 渐变与阴影生成器
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                可视化调色盘设计线性与径向渐变、多层柔和拟物阴影并导出 CSS 与 Tailwind 样式
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium self-start sm:self-center">
            <button
              onClick={() => setActiveTab("gradient")}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === "gradient"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              CSS 渐变生成
            </button>
            <button
              onClick={() => setActiveTab("shadow")}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === "shadow"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              CSS 多层阴影生成
            </button>
          </div>
        </div>
      </div>

      {activeTab === "gradient" ? (
        /* ================= GRADIENT GENERATOR ================= */
        <div className="space-y-6">
          {/* Live Preview Canvas Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <span>渐变实时视觉预览</span>
              <span className="text-slate-400 font-mono text-[11px] lowercase">
                {gradientConfig.type === "linear" ? `${gradientConfig.angle}° 线性渐变` : "径向渐变"}
              </span>
            </div>

            <div
              className="w-full h-44 sm:h-56 rounded-2xl shadow-inner border border-black/10 flex items-center justify-center transition-all"
              style={{
                background: gradientOutput.cssBackground.replace("background: ", "").replace(";", ""),
              }}
            >
              <div className="px-5 py-2.5 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 text-slate-900 font-bold text-sm shadow-sm select-none">
                渐变效果呈现
              </div>
            </div>

            {/* Presets List */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                推荐预设色彩风格:
              </span>
              <div className="flex flex-wrap gap-2">
                {GRADIENT_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setGradientConfig(p.config)}
                    className="px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium transition-all cursor-pointer shadow-2xs"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls & Color Stops */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <span>渐变类型与角度</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Type */}
                <div className="space-y-2">
                  <label className="font-medium text-slate-700 dark:text-slate-300">渐变类型</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "linear", label: "线性渐变" },
                      { id: "radial", label: "径向渐变" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() =>
                          setGradientConfig({ ...gradientConfig, type: t.id as any })
                        }
                        className={`py-2 rounded-xl border font-semibold text-center transition-all cursor-pointer ${
                          gradientConfig.type === t.id
                            ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Angle or Shape */}
                {gradientConfig.type === "linear" ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-medium text-slate-700 dark:text-slate-300">
                        旋转角度
                      </label>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {gradientConfig.angle}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={gradientConfig.angle}
                      onChange={(e) =>
                        setGradientConfig({ ...gradientConfig, angle: Number(e.target.value) })
                      }
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="font-medium text-slate-700 dark:text-slate-300">径向形状</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "circle", label: "圆形 (Circle)" },
                        { id: "ellipse", label: "椭圆 (Ellipse)" },
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() =>
                            setGradientConfig({ ...gradientConfig, shape: s.id as any })
                          }
                          className={`py-2 rounded-xl border font-semibold text-center transition-all cursor-pointer ${
                            gradientConfig.shape === s.id
                              ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Color Stops List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <span>渐变色彩停靠点 ({gradientConfig.stops.length})</span>
                  <button
                    onClick={handleAddStop}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>添加颜色</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {gradientConfig.stops.map((stop, idx) => (
                    <div
                      key={stop.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={stop.color}
                          onChange={(e) => handleUpdateStop(stop.id, "color", e.target.value)}
                          className="w-7 h-7 rounded-lg border-0 p-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={stop.color}
                          onChange={(e) => handleUpdateStop(stop.id, "color", e.target.value)}
                          className="w-20 px-2 py-1 font-mono font-bold rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 uppercase outline-none"
                        />
                      </div>

                      <div className="flex-1 flex items-center gap-2 px-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={stop.position}
                          onChange={(e) =>
                            handleUpdateStop(stop.id, "position", Number(e.target.value))
                          }
                          className="flex-1 accent-indigo-600 cursor-pointer"
                        />
                        <span className="font-mono text-slate-500 w-10 text-right">
                          {stop.position}%
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemoveStop(stop.id)}
                        disabled={gradientConfig.stops.length <= 2}
                        className="p-1.5 text-slate-400 hover:text-rose-500 disabled:opacity-30 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="删除该颜色"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Generated CSS & Tailwind Code Output */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
                  CSS 代码与 Tailwind 样式
                </div>

                {/* Standard CSS */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">标准 CSS 代码</span>
                    <button
                      onClick={() => handleCopy("css_grad", gradientOutput.cssBackground)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === "css_grad" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      复制 CSS
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 font-mono text-xs text-indigo-950 dark:text-indigo-200 whitespace-pre-wrap select-all break-all leading-relaxed">
                    {gradientOutput.cssBackground}
                  </pre>
                </div>

                {/* Tailwind Class */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Tailwind CSS 类名</span>
                    <button
                      onClick={() => handleCopy("tw_grad", gradientOutput.tailwindClass)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === "tw_grad" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      复制类名
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 font-mono text-xs text-indigo-950 dark:text-indigo-200 whitespace-pre-wrap select-all break-all leading-relaxed">
                    {gradientOutput.tailwindClass}
                  </pre>
                </div>
              </div>

              <button
                onClick={() => handleCopy("all_grad", gradientOutput.cssBackground)}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>一键复制标准 CSS</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= BOX SHADOW GENERATOR ================= */
        <div className="space-y-6">
          {/* Live Preview Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 sm:p-12 shadow-xs flex flex-col items-center justify-center gap-6">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              多层阴影实时视觉效果
            </div>

            <div
              className="w-48 h-32 sm:w-64 sm:h-40 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-sm select-none transition-all"
              style={{
                boxShadow: shadowOutput.cssBoxShadow.replace("box-shadow: ", "").replace(";", ""),
              }}
            >
              拟物阴影容器
            </div>

            {/* Presets List */}
            <div className="space-y-2 pt-2 text-center">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                推荐预设阴影质感:
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {SHADOW_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setShadowLayers(p.layers)}
                    className="px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium transition-all cursor-pointer shadow-2xs"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Shadow Layers & Codes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <span>阴影层列表 ({shadowLayers.length} 层)</span>
                <button
                  onClick={handleAddShadowLayer}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>添加阴影层</span>
                </button>
              </div>

              <div className="space-y-4">
                {shadowLayers.map((layer, idx) => (
                  <div
                    key={layer.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>第 {idx + 1} 层阴影参数</span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium select-none">
                          <input
                            type="checkbox"
                            checked={layer.inset}
                            onChange={(e) =>
                              handleUpdateShadowLayer(layer.id, "inset", e.target.checked)
                            }
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>内阴影 (Inset)</span>
                        </label>

                        <button
                          onClick={() => handleRemoveShadowLayer(layer.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {/* X */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-500">
                          <span>X 偏移</span>
                          <span className="font-mono">{layer.x}px</span>
                        </div>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={layer.x}
                          onChange={(e) =>
                            handleUpdateShadowLayer(layer.id, "x", Number(e.target.value))
                          }
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>

                      {/* Y */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-500">
                          <span>Y 偏移</span>
                          <span className="font-mono">{layer.y}px</span>
                        </div>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={layer.y}
                          onChange={(e) =>
                            handleUpdateShadowLayer(layer.id, "y", Number(e.target.value))
                          }
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>

                      {/* Blur */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-500">
                          <span>模糊半径</span>
                          <span className="font-mono">{layer.blur}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={layer.blur}
                          onChange={(e) =>
                            handleUpdateShadowLayer(layer.id, "blur", Number(e.target.value))
                          }
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>

                      {/* Spread */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-500">
                          <span>扩展半径</span>
                          <span className="font-mono">{layer.spread}px</span>
                        </div>
                        <input
                          type="range"
                          min="-20"
                          max="50"
                          value={layer.spread}
                          onChange={(e) =>
                            handleUpdateShadowLayer(layer.id, "spread", Number(e.target.value))
                          }
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Color Input */}
                    <div className="flex items-center gap-3 pt-1 text-xs">
                      <span className="text-slate-500 font-medium">阴影颜色:</span>
                      <input
                        type="text"
                        value={layer.color}
                        onChange={(e) => handleUpdateShadowLayer(layer.id, "color", e.target.value)}
                        placeholder="如 rgba(0,0,0,0.1) 或 #000000"
                        className="flex-1 px-3 py-1.5 font-mono rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated CSS Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
                  CSS 阴影代码输出
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">标准 CSS box-shadow</span>
                    <button
                      onClick={() => handleCopy("css_shadow", shadowOutput.cssBoxShadow)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === "css_shadow" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      复制 CSS
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 font-mono text-xs text-indigo-950 dark:text-indigo-200 whitespace-pre-wrap select-all break-all leading-relaxed">
                    {shadowOutput.cssBoxShadow}
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Tailwind 类名</span>
                    <button
                      onClick={() => handleCopy("tw_shadow", shadowOutput.tailwindClass)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === "tw_shadow" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      复制类名
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 font-mono text-xs text-indigo-950 dark:text-indigo-200 whitespace-pre-wrap select-all break-all leading-relaxed">
                    {shadowOutput.tailwindClass}
                  </pre>
                </div>
              </div>

              <button
                onClick={() => handleCopy("all_shadow", shadowOutput.cssBoxShadow)}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>一键复制 box-shadow 代码</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
