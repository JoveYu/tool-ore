import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  generateBarcode,
  decodeBarcodeFromFile,
  BarcodeFormat,
} from "./barcodeUtils";
import {
  Barcode,
  Download,
  UploadCloud,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Link,
  Sparkles,
} from "lucide-react";

type Mode = "generate" | "scan";

const SUPPORTED_FORMATS: { id: BarcodeFormat; name: string; desc: string }[] = [
  { id: "CODE128", name: "CODE 128 (通用推荐)", desc: "支持全部 ASCII 字符与数字，最通用" },
  { id: "EAN13", name: "EAN-13 (商品码)", desc: "国际标准商品条码，需 12 或 13 位纯数字" },
  { id: "EAN8", name: "EAN-8 (缩短码)", desc: "7 或 8 位纯数字商品码" },
  { id: "UPC", name: "UPC-A (北美商品)", desc: "11 或 12 位纯数字商品条码" },
  { id: "CODE39", name: "CODE 39 (工业码)", desc: "支持大写字母、数字及部分特殊字符" },
  { id: "ITF14", name: "ITF-14 (物流箱码)", desc: "13 或 14 位纯数字包装箱码" },
  { id: "pharmacode", name: "Pharmacode (医药码)", desc: "用于医药包装的纯数字单轨条码" },
];

export default function BarcodeTool() {
  const [mode, setMode] = useState<Mode>("generate");

  // Generator states
  const [format, setFormat] = useState<BarcodeFormat>("CODE128");
  const [value, setValue] = useState<string>("123456789012");
  const [height, setHeight] = useState<number>(80);
  const [width, setWidth] = useState<number>(2);
  const [displayValue, setDisplayValue] = useState<boolean>(true);
  const [lineColor, setLineColor] = useState<string>("#000000");
  const [background, setBackground] = useState<string>("#FFFFFF");

  const [barcodeDataUrl, setBarcodeDataUrl] = useState<string>("");
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Scanner states
  const [scannedResult, setScannedResult] = useState<{
    text?: string;
    format?: string;
    error?: string;
    fileName?: string;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const scanInputRef = useRef<HTMLInputElement>(null);

  // Real-time Barcode generation
  useEffect(() => {
    if (mode !== "generate" || !value.trim()) {
      setBarcodeDataUrl("");
      setGenerateError(null);
      return;
    }

    try {
      const url = generateBarcode(value, {
        format,
        height,
        width,
        displayValue,
        lineColor,
        background,
      });
      setBarcodeDataUrl(url);
      setGenerateError(null);
    } catch (err: any) {
      setBarcodeDataUrl("");
      setGenerateError(err?.message || "条形码格式不匹配，无法生成");
    }
  }, [mode, format, value, height, width, displayValue, lineColor, background]);

  const handleDownload = () => {
    if (!barcodeDataUrl) return;
    const link = document.createElement("a");
    link.href = barcodeDataUrl;
    link.download = `barcode-${format}-${Date.now()}.png`;
    link.click();
  };

  const handleScanFile = async (file: File) => {
    const res = await decodeBarcodeFromFile(file);
    setScannedResult({
      text: res.text,
      format: res.format,
      error: res.error,
      fileName: file.name,
    });
  };

  const handleCopy = async (val: string) => {
    if (!val) return;
    await navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                条形码生成与识别
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                支持 CODE128、EAN-13、UPC、CODE39 等主流标准条形码生成下载，支持本地图片精准扫码识别
              </p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium self-start sm:self-center shrink-0">
            <button
              onClick={() => setMode("generate")}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "generate"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              条形码生成
            </button>
            <button
              onClick={() => setMode("scan")}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "scan"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              识别 / 扫码
            </button>
          </div>
        </div>
      </div>

      {mode === "generate" ? (
        /* Generator Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            {/* Format Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                条形码格式 (Standard)
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as BarcodeFormat)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
              >
                {SUPPORTED_FORMATS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} - {f.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                条形码内容 (Content)
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="请输入条码内容 (如: 123456789012)..."
                className="w-full px-3.5 py-2.5 font-mono text-sm font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {generateError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400 mt-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{generateError}</span>
                </div>
              )}
            </div>

            {/* Visual Adjustments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Height */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    条码高度 (Height)
                  </span>
                  <span className="font-mono text-slate-400">{height}px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="160"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Bar Width */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    条宽粗细 (Bar Width)
                  </span>
                  <span className="font-mono text-slate-400">{width}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Colors & Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Line color */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-600 dark:text-slate-400">条码颜色</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={lineColor}
                    onChange={(e) => setLineColor(e.target.value)}
                    className="w-5 h-5 rounded-md border-0 p-0 cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{lineColor}</span>
                </div>
              </div>

              {/* Background color */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-600 dark:text-slate-400">背景颜色</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="w-5 h-5 rounded-md border-0 p-0 cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{background}</span>
                </div>
              </div>

              {/* Display text */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer select-none">
                <span className="text-slate-600 dark:text-slate-400">底部显示文本</span>
                <input
                  type="checkbox"
                  checked={displayValue}
                  onChange={(e) => setDisplayValue(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Preview & Download Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-between gap-6">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider w-full text-center pb-2 border-b border-slate-100 dark:border-slate-800">
              条形码实时预览
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center w-full min-h-[160px] overflow-hidden shadow-inner">
              {barcodeDataUrl ? (
                <img
                  src={barcodeDataUrl}
                  alt="生成的条形码"
                  className="max-h-full max-w-full object-contain rounded-md"
                />
              ) : (
                <div className="text-center text-xs text-slate-400">
                  {generateError ? "内容不符合格式规则" : "请输入条码内容生成预览"}
                </div>
              )}
            </div>

            <button
              onClick={handleDownload}
              disabled={!barcodeDataUrl}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              下载高清条形码 (PNG)
            </button>
          </div>
        </div>
      ) : (
        /* Scanner / Decoder Layout */
        <div className="space-y-6">
          <div
            onClick={() => scanInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleScanFile(file);
            }}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900/60 rounded-3xl p-12 text-center cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-500/5 group"
          >
            <input
              ref={scanInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleScanFile(file);
              }}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              上传或拖拽包含条形码的图片
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              纯前端本地 ZXing 引擎毫秒级识别 CODE128、EAN-13、UPC 等标准条形码
            </p>
          </div>

          {/* Scanned Result Card */}
          {scannedResult && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    条形码解析结果
                  </span>
                  {scannedResult.format && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono font-bold border border-indigo-100 dark:border-indigo-900/50">
                      {scannedResult.format}
                    </span>
                  )}
                  {scannedResult.fileName && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      ({scannedResult.fileName})
                    </span>
                  )}
                </div>

                {scannedResult.text && (
                  <button
                    onClick={() => handleCopy(scannedResult.text || "")}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>复制条码内容</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {scannedResult.error ? (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{scannedResult.error}</span>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 font-mono text-sm font-bold text-slate-900 dark:text-slate-100 select-all whitespace-pre-wrap break-all leading-relaxed">
                  {scannedResult.text}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
