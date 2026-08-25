import React, { useState, useMemo, useRef } from "react";
import {
  ThemeId,
  BackgroundPresetId,
  THEME_CONFIGS,
  BACKGROUND_PRESETS,
  highlightCodeSimple,
  renderElementToPngBlob,
} from "./codeToImageUtils";
import {
  Code2,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  Palette,
  Eye,
  Layers,
  Camera,
} from "lucide-react";

export default function CodeToImage() {
  const sampleCode = `// 🚀 Tool-Ore 纯前端在线工具箱
async function computeHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

console.log(await computeHash("Hello 2026!"));`;

  const [code, setCode] = useState<string>(sampleCode);
  const [title, setTitle] = useState<string>("hashCalculator.ts");
  const [theme, setTheme] = useState<ThemeId>("one_dark");
  const [background, setBackground] = useState<BackgroundPresetId>("aurora");
  const [windowHeader, setWindowHeader] = useState<"mac" | "win" | "none">("mac");
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [padding, setPadding] = useState<number>(36);
  const [fontSize, setFontSize] = useState<number>(14);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  const themeConfig = THEME_CONFIGS[theme];
  const bgPreset = useMemo(
    () => BACKGROUND_PRESETS.find((b) => b.id === background) || BACKGROUND_PRESETS[0],
    [background]
  );

  const highlightedHtml = useMemo(
    () => highlightCodeSimple(code, themeConfig),
    [code, themeConfig]
  );

  const lineCount = code.split("\n").length;

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const blob = await renderElementToPngBlob(cardRef.current, 2);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `code_snippet_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("生成图片失败，请重试");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopiedKey("code");
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              代码美化截图与卡片生成
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              将代码片段一键生成高颜值 Ray.so / Carbon 风格分享卡片，支持多主题与高清 PNG 导出
            </p>
          </div>
        </div>
      </div>

      {/* Visual Live Preview Box (WYSIWYG) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <span>实时视觉效果预览 ({lineCount} 行 · {themeConfig.name})</span>

          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? "生成图片中..." : "导出高清 PNG 截图"}</span>
          </button>
        </div>

        {/* Outer Background Container for screenshot rendering */}
        <div className="overflow-x-auto p-4 flex items-center justify-center bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
          <div
            ref={cardRef}
            className="rounded-3xl transition-all select-none max-w-full"
            style={{
              background: bgPreset.gradient,
              padding: `${padding}px`,
            }}
          >
            {/* Inner IDE Window Container */}
            <div
              className="rounded-2xl overflow-hidden shadow-2xl transition-all"
              style={{
                backgroundColor: themeConfig.bg,
                color: themeConfig.fg,
                minWidth: "320px",
                maxWidth: "680px",
              }}
            >
              {/* Window Header */}
              {windowHeader !== "none" && (
                <div
                  className="px-4 py-3 flex items-center justify-between border-b border-black/10 select-none"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.15)" }}
                >
                  {/* macOS Dots */}
                  {windowHeader === "mac" ? (
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block shadow-xs" />
                      <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block shadow-xs" />
                      <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block shadow-xs" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 opacity-60 text-xs font-mono">
                      <span>🗕</span>
                      <span>🗖</span>
                      <span>✕</span>
                    </div>
                  )}

                  {/* Window Title */}
                  <span
                    className="text-xs font-mono font-bold truncate max-w-xs px-2"
                    style={{ color: themeConfig.comment }}
                  >
                    {title}
                  </span>

                  <div className="w-12" />
                </div>
              )}

              {/* Code Body Area */}
              <div
                className="p-5 overflow-x-auto flex font-mono leading-relaxed"
                style={{ fontSize: `${fontSize}px` }}
              >
                {/* Line Numbers */}
                {showLineNumbers && (
                  <div
                    className="select-none pr-4 text-right border-r mr-4 opacity-40 font-mono"
                    style={{
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      color: themeConfig.comment,
                    }}
                  >
                    {Array.from({ length: lineCount }).map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                )}

                {/* Highlighted Code Text */}
                <pre
                  className="flex-1 font-mono m-0 bg-transparent overflow-x-auto leading-relaxed"
                  style={{ color: themeConfig.fg }}
                  dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Code Input */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              输入代码内容
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === "code" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                复制代码
              </button>
              <button
                onClick={() => setCode("")}
                className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                清空
              </button>
            </div>
          </div>

          <textarea
            rows={12}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="粘贴你的代码..."
            className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Right: Style & Themes Customizer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
            样式与视觉参数调校
          </div>

          {/* Theme Selector */}
          <div className="space-y-1.5 text-xs">
            <label className="font-medium text-slate-700 dark:text-slate-300">IDE 代码配色主题</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(THEME_CONFIGS).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`py-2 px-2.5 rounded-xl border text-center font-medium transition-all cursor-pointer flex items-center justify-between ${
                    theme === t.id
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  <span>{t.name}</span>
                  <span
                    className="w-3 h-3 rounded-full border border-black/20"
                    style={{ backgroundColor: t.bg }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Background Gradients */}
          <div className="space-y-1.5 text-xs">
            <label className="font-medium text-slate-700 dark:text-slate-300">背景渐变风格</label>
            <div className="grid grid-cols-3 gap-2">
              {BACKGROUND_PRESETS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBackground(b.id)}
                  className={`py-2 px-2.5 rounded-xl border text-center font-medium transition-all cursor-pointer flex items-center justify-between ${
                    background === b.id
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  <span>{b.name}</span>
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                    style={{ background: b.gradient }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title & Window Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500">文件标题名称</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如 index.ts"
                className="w-full px-3 py-1.5 font-mono text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <span className="text-slate-500">窗口顶部控件</span>
              <select
                value={windowHeader}
                onChange={(e) => setWindowHeader(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="mac">macOS 红黄绿圆点</option>
                <option value="win">Windows 窗口按键</option>
                <option value="none">无顶部栏 (极简模式)</option>
              </select>
            </div>
          </div>

          {/* Padding & Font Size & Line numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>外边距</span>
                <span className="font-mono">{padding}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="64"
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>字体大小</span>
                <span className="font-mono">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="22"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center pt-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showLineNumbers}
                  onChange={(e) => setShowLineNumbers(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">显示代码行号</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
