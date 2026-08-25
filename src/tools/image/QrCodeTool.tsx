import React, { useState, useEffect, useRef } from "react";
import {
  generateQrCode,
  decodeQrCodeFromFile,
  QRCodeOptions,
} from "./qrcodeUtils";
import {
  QrCode,
  Download,
  UploadCloud,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Link,
} from "lucide-react";

type Mode = "generate" | "scan";

const COLOR_PRESETS = [
  { name: "经典黑", dark: "#000000", light: "#FFFFFF" },
  { name: "商务蓝", dark: "#1E40AF", light: "#EFF6FF" },
  { name: "优雅靛", dark: "#4F46E5", light: "#EEF2FF" },
  { name: "科技青", dark: "#0D9488", light: "#F0FDFA" },
  { name: "高级黑金", dark: "#27272A", light: "#FEFCE8" },
];

export default function QrCodeTool() {
  const [mode, setMode] = useState<Mode>("generate");

  // Generator states
  const [text, setText] = useState<string>("Hello World");
  const [size, setSize] = useState<number>(400);
  const [margin, setMargin] = useState<number>(2);
  const [colorDark, setColorDark] = useState<string>("#000000");
  const [colorLight, setColorLight] = useState<string>("#FFFFFF");
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Scanner states
  const [scannedResult, setScannedResult] = useState<{
    text?: string;
    error?: string;
    fileName?: string;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Generate QR Code on state changes
  useEffect(() => {
    if (mode !== "generate" || !text.trim()) {
      setQrDataUrl("");
      return;
    }

    let isMounted = true;
    const runGenerate = async () => {
      try {
        const url = await generateQrCode(text, {
          width: size,
          margin,
          colorDark,
          colorLight,
          errorCorrectionLevel: errorLevel,
          logoUrl: logoUrl || undefined,
        });
        if (isMounted) {
          setQrDataUrl(url);
        }
      } catch (err) {
        console.error("生成二维码失败", err);
      }
    };

    const timer = setTimeout(runGenerate, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [mode, text, size, margin, colorDark, colorLight, errorLevel, logoUrl]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `qrcode-${Date.now()}.png`;
    link.click();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    }
  };

  const handleScanFile = async (file: File) => {
    const res = await decodeQrCodeFromFile(file);
    setScannedResult({
      text: res.text,
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
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                二维码生成与识别
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                支持高清二维码生成、自定义色彩、中心嵌入 Logo、容错级别调节以及本地图片解析
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium self-start sm:self-center shrink-0">
            <button
              onClick={() => setMode("generate")}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "generate"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              二维码生成
            </button>
            <button
              onClick={() => setMode("scan")}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "scan"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              识别 / 解析
            </button>
          </div>
        </div>
      </div>

      {mode === "generate" ? (
        /* Generator Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            {/* Input Content */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                二维码文本 / URL 链接
              </label>
              <textarea
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="请输入文本、网址、WiFi 配置或名片信息..."
                className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Color Presets & Custom Pickers */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                配色方案
              </label>

              {/* Presets */}
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setColorDark(p.dark);
                      setColorLight(p.light);
                    }}
                    className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      colorDark === p.dark && colorLight === p.light
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs shrink-0"
                      style={{ backgroundColor: p.dark }}
                    />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>

              {/* Custom hex pickers */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-600 dark:text-slate-400">前景色 (码点)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorDark}
                      onChange={(e) => setColorDark(e.target.value)}
                      className="w-6 h-6 rounded-md border-0 p-0 cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                      {colorDark}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-600 dark:text-slate-400">背景色</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorLight}
                      onChange={(e) => setColorLight(e.target.value)}
                      className="w-6 h-6 rounded-md border-0 p-0 cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                      {colorLight}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error correction & Logo upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Error correction level */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  容错纠错级别
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-medium">
                  {[
                    { id: "L", label: "L (7%)" },
                    { id: "M", label: "M (15%)" },
                    { id: "Q", label: "Q (25%)" },
                    { id: "H", label: "H (30%)" },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => setErrorLevel(lvl.id as any)}
                      className={`py-1.5 rounded-lg border text-center transition-all ${
                        errorLevel === lvl.id
                          ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent font-bold"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Center Logo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  中心嵌入 Logo (可选)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{logoUrl ? "更换 Logo" : "上传中心图标"}</span>
                  </button>

                  {logoUrl && (
                    <button
                      onClick={() => setLogoUrl(null)}
                      className="px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="移除 Logo"
                    >
                      移除
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preview & Download Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-between gap-6">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider w-full text-center pb-2 border-b border-slate-100 dark:border-slate-800">
              二维码预览
            </div>

            <div className="relative p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center aspect-square w-full max-w-[260px] shadow-inner">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="生成的二维码"
                  className="w-full h-full object-contain rounded-lg shadow-sm"
                />
              ) : (
                <div className="text-center text-xs text-slate-400">
                  请输入文本生成二维码
                </div>
              )}
            </div>

            <button
              onClick={handleDownload}
              disabled={!qrDataUrl}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              下载高清二维码 (PNG)
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
              上传或拖拽包含二维码的图片
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              纯前端本地算法解析，无需上传到云端，保护私密信息
            </p>
          </div>

          {/* Scanned Result Card */}
          {scannedResult && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    解析结果
                  </span>
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
                        <span>复制内容</span>
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
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 font-mono text-xs text-slate-900 dark:text-slate-100 select-all whitespace-pre-wrap break-all leading-relaxed">
                    {scannedResult.text}
                  </div>

                  {scannedResult.text?.startsWith("http") && (
                    <div className="flex justify-end">
                      <a
                        href={scannedResult.text}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <Link className="w-3.5 h-3.5" />
                        访问链接
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
