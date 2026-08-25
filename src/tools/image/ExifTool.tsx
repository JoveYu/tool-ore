import React, { useState, useRef, useMemo } from "react";
import { parseImageExif, stripExifMetadata, ParsedExifData } from "./exifUtils";
import {
  Camera,
  Upload,
  Download,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Clock,
  Sliders,
  Sparkles,
  ExternalLink,
  Layers,
  FileText,
  Eye,
} from "lucide-react";

export default function ExifTool() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [exifData, setExifData] = useState<ParsedExifData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStripping, setIsStripping] = useState<boolean>(false);
  const [strippedUrl, setStrippedUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgElementRef = useRef<HTMLImageElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setIsLoading(true);
    setStrippedUrl(null);

    const srcUrl = URL.createObjectURL(file);
    setImageSrc(srcUrl);

    try {
      const data = await parseImageExif(file);
      setExifData(data);
    } catch {
      setExifData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripAndDownload = async () => {
    if (!imgElementRef.current) return;
    setIsStripping(true);

    try {
      const cleanBlob = await stripExifMetadata(imgElementRef.current, "image/jpeg", 0.95);
      const url = URL.createObjectURL(cleanBlob);
      setStrippedUrl(url);

      const a = document.createElement("a");
      a.href = url;
      a.download = `clean_no_exif_${imageFile?.name || "image.jpg"}`;
      a.click();
    } finally {
      setIsStripping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hidden image element for canvas processing */}
      {imageSrc && (
        <img
          ref={imgElementRef}
          src={imageSrc}
          alt="Original for strip"
          className="hidden"
          crossOrigin="anonymous"
        />
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic,.tiff"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              图片 EXIF 查看与隐私清除
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              读取照片拍摄相机型号、镜头、曝光参数与 GPS 定位，支持一键脱敏清除隐私元数据
            </p>
          </div>
        </div>
      </div>

      {!imageSrc ? (
        /* Upload Drag & Drop Placeholder */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-3xl p-12 text-center transition-all cursor-pointer space-y-3"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
            <Upload className="w-8 h-8" />
          </div>
          <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
            点击或拖拽照片至此处读取 EXIF 元数据
          </div>
          <p className="text-xs text-slate-400">
            支持 JPEG、PNG、WebP、HEIC 与 TIFF，所有解析在本地浏览器完成，绝不上传到服务器
          </p>
        </div>
      ) : (
        /* Image Preview & Details Workspace */
        <div className="space-y-6">
          {/* Main Action Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                <img src={imageSrc} alt="Thumbnail" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                  {imageFile?.name}
                </div>
                <div className="text-slate-400 font-mono mt-0.5">
                  {((imageFile?.size || 0) / 1024 / 1024).toFixed(2)} MB · {imageFile?.type}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleStripAndDownload}
                disabled={isStripping}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition-colors cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>一键清除 EXIF 并下载安全图片</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
              >
                更换图片
              </button>
            </div>
          </div>

          {/* Quick Specs Dashboard Cards */}
          {exifData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Camera */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
                <span className="text-xs text-slate-400 block font-medium">拍摄设备 / 相机</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white block truncate">
                  {exifData.model || exifData.make || "未知设备"}
                </span>
                <span className="text-[11px] text-slate-400 font-mono block truncate">
                  {exifData.lensModel || exifData.make || "标准镜头"}
                </span>
              </div>

              {/* Exposure */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
                <span className="text-xs text-slate-400 block font-medium">曝光三要素</span>
                <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 block truncate">
                  {exifData.fNumber ? `f/${exifData.fNumber}` : "-"} · {exifData.exposureTime ? `${exifData.exposureTime}s` : "-"}
                </span>
                <span className="text-[11px] text-slate-400 font-mono block">
                  ISO: {exifData.iso || "-"} · 焦距: {exifData.focalLength ? `${exifData.focalLength}mm` : "-"}
                </span>
              </div>

              {/* Date */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
                <span className="text-xs text-slate-400 block font-medium">拍摄时间</span>
                <span className="font-mono font-bold text-xs text-slate-900 dark:text-white block truncate">
                  {exifData.dateTime || "未记录时间"}
                </span>
                <span className="text-[11px] text-slate-400 block truncate font-mono">
                  处理软件: {exifData.software || "原生直出"}
                </span>
              </div>

              {/* GPS */}
              <div
                className={`p-4 rounded-2xl border shadow-xs space-y-1 ${
                  exifData.gps
                    ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                    : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 block font-medium">地理位置 GPS</span>
                  {exifData.gps && <MapPin className="w-3.5 h-3.5 text-rose-500" />}
                </div>
                {exifData.gps ? (
                  <>
                    <span className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400 block truncate">
                      {exifData.gps.latitude.toFixed(4)}, {exifData.gps.longitude.toFixed(4)}
                    </span>
                    <a
                      href={exifData.gps.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>在地图中查看</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                ) : (
                  <span className="text-xs text-slate-400 block">无 GPS 坐标信息</span>
                )}
              </div>
            </div>
          )}

          {/* Full Raw EXIF Tags Table */}
          {exifData && exifData.hasExif && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <span>全部元数据标签明细 ({Object.keys(exifData.rawTags).length} 项)</span>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10 text-[11px] text-slate-500 uppercase">
                    <tr>
                      <th className="py-2.5 px-6 font-semibold w-1/3">标签名 Tag</th>
                      <th className="py-2.5 px-6 font-semibold">标签值 Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(exifData.rawTags).map(([tag, val]) => (
                      <tr
                        key={tag}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-2 px-6 font-bold text-indigo-600 dark:text-indigo-400">
                          {tag}
                        </td>
                        <td className="py-2 px-6 text-slate-800 dark:text-slate-200 select-all break-all">
                          {val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
