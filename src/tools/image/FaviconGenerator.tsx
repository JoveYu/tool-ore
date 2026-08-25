import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  FAVICON_STANDARD_SIZES,
  FaviconSizeOption,
  resizeImageToPng,
  buildMultiSizeIco,
  generateFaviconHtmlTags,
} from "./faviconUtils";
import { CodeViewer } from "../../components/CodeViewer";
import {
  Sparkles,
  Upload,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Code2,
  Layers,
  Image as ImageIcon,
} from "lucide-react";

export default function FaviconGenerator() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [sizeOptions, setSizeOptions] = useState<FaviconSizeOption[]>(FAVICON_STANDARD_SIZES);
  const [generatedIcons, setGeneratedIcons] = useState<
    { size: number; blob: Blob; dataUrl: string; buffer: ArrayBuffer }[]
  >([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // 初始化样例图标
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // 渐变圆角矩形
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, "#6366F1");
      grad.addColorStop(1, "#A855F7");
      ctx.fillStyle = grad;

      // 绘制圆角矩形
      const r = 100;
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(512 - r, 0);
      ctx.quadraticCurveTo(512, 0, 512, r);
      ctx.lineTo(512, 512 - r);
      ctx.quadraticCurveTo(512, 512, 512 - r, 512);
      ctx.lineTo(r, 512);
      ctx.quadraticCurveTo(0, 512, 0, 512 - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.fill();

      // 白色中心字母图标
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 260px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("T", 256, 266);

      const url = canvas.toDataURL("image/png");
      setImageSrc(url);
    }
  }, []);

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

  const handleToggleSize = (size: number) => {
    setSizeOptions(
      sizeOptions.map((opt) => (opt.size === size ? { ...opt, selected: !opt.selected } : opt))
    );
  };

  // 生成选定尺寸的图标
  useEffect(() => {
    if (!imgRef.current) return;

    let isMounted = true;
    const runGenerate = async () => {
      if (!imgRef.current) return;
      const selected = sizeOptions.filter((opt) => opt.selected);
      const results: { size: number; blob: Blob; dataUrl: string; buffer: ArrayBuffer }[] = [];

      for (const opt of selected) {
        try {
          const res = await resizeImageToPng(imgRef.current, opt.size);
          results.push({ size: opt.size, ...res });
        } catch {}
      }

      if (isMounted) {
        setGeneratedIcons(results);
      }
    };

    runGenerate();
    return () => {
      isMounted = false;
    };
  }, [sizeOptions, imageSrc]);

  // 下载打包的多尺寸 .ico 文件
  const handleDownloadIco = () => {
    const icoSizes = generatedIcons.filter((i) => [16, 32, 48, 64].includes(i.size));
    const toPack = icoSizes.length > 0 ? icoSizes : generatedIcons.slice(0, 3);
    const icoBlob = buildMultiSizeIco(toPack);

    const url = URL.createObjectURL(icoBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "favicon.ico";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSinglePng = (dataUrl: string, size: number) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = size === 180 ? "apple-touch-icon.png" : `favicon-${size}x${size}.png`;
    a.click();
  };

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const htmlTags = useMemo(() => generateFaviconHtmlTags(), []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hidden processing image */}
      {imageSrc && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Favicon source"
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
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Favicon 多尺寸 ICO 图标生成
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              一键将图片转换为 16~512px 全规格 PNG 图标与 Windows 级标准二进制多尺寸 .ico 格式
            </p>
          </div>
        </div>
      </div>

      {/* Size Checkbox Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <span>生成尺寸与规格选择</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span>上传图标源文件</span>
            </button>

            <button
              onClick={handleDownloadIco}
              disabled={generatedIcons.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>下载打包的 favicon.ico</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {sizeOptions.map((opt) => (
            <label
              key={opt.size}
              className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                opt.selected
                  ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500/80 shadow-2xs"
                  : "bg-slate-50/40 dark:bg-slate-800/30 border-slate-200/70 dark:border-slate-700 opacity-60"
              }`}
            >
              <input
                type="checkbox"
                checked={opt.selected}
                onChange={() => handleToggleSize(opt.size)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
              />
              <div className="min-w-0">
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                  {opt.label}
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  {opt.recommendedFor}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Generated Icons Grid Preview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
          生成的各尺寸图标清单 ({generatedIcons.length} 种规格)
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {generatedIcons.map((icon) => (
            <div
              key={icon.size}
              className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 flex flex-col items-center justify-between gap-3 text-center"
            >
              <div className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                {icon.size} × {icon.size} px
              </div>

              <div className="w-20 h-20 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 p-2 shadow-inner">
                <img
                  src={icon.dataUrl}
                  alt={`Favicon ${icon.size}`}
                  style={{ width: Math.min(64, icon.size), height: Math.min(64, icon.size) }}
                  className="object-contain"
                />
              </div>

              <button
                onClick={() => handleDownloadSinglePng(icon.dataUrl, icon.size)}
                className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3 text-indigo-500" />
                <span>下载 PNG</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* HTML Head Link Tags Code */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-indigo-500" />
            <span>HTML &lt;head&gt; 引用代码片段</span>
          </span>

          <button
            onClick={() => handleCopy("html_tags", htmlTags)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
          >
            {copiedKey === "html_tags" ? (
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
          code={htmlTags}
          language="html"
          maxHeight="220px"
          showLineNumbers={false}
        />
      </div>
    </div>
  );
}
