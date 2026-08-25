import React, { useState, useRef, useMemo } from "react";
import {
  VideoToGifOptions,
  convertVideoToGif,
} from "./gifUtils";
import {
  Film,
  Upload,
  Download,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";

export default function VideoToGif() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);

  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(3.0);
  const [fps, setFps] = useState<number>(12);
  const [width, setWidth] = useState<number>(480);
  const [quality, setQuality] = useState<number>(10);

  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [gifBlobUrl, setGifBlobUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    setGifBlobUrl(null);
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
  };

  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    setDuration(v.duration);
    setStartTime(0);
    setEndTime(Math.min(v.duration, 4.0));
  };

  const handleConvert = async () => {
    if (!videoRef.current || !videoSrc) return;
    setIsConverting(true);
    setProgress(0);
    setGifBlobUrl(null);

    const options: VideoToGifOptions = {
      startTime,
      endTime,
      fps,
      width,
      quality,
    };

    try {
      const blob = await convertVideoToGif(videoRef.current, options, (p) => {
        setProgress(p);
      });
      const url = URL.createObjectURL(blob);
      setGifBlobUrl(url);
    } catch {
      alert("视频转换失败，请确认浏览器支持该视频格式");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadGif = () => {
    if (!gifBlobUrl) return;
    const a = document.createElement("a");
    a.href = gifBlobUrl;
    a.download = `animated_${Date.now()}.gif`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,.mp4,.webm,.mov"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              视频转 GIF 动图
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              纯本地读取视频文件，截取指定时间段、调节帧率与分辨率快速生成高质量 GIF
            </p>
          </div>
        </div>
      </div>

      {!videoSrc ? (
        /* Upload Drag & Drop Area */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-3xl p-12 text-center transition-all cursor-pointer space-y-3"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
            <Film className="w-8 h-8" />
          </div>
          <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
            点击或拖入待转换的本地视频文件
          </div>
          <p className="text-xs text-slate-400">
            支持 MP4、WebM、MOV 等常见格式，所有转码在本地浏览器端完成，无需等待网络上传
          </p>
        </div>
      ) : (
        /* Video Player & Conversion Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Video Player & Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <span>视频截取与参数 (总时长: {duration.toFixed(1)}s)</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer text-xs font-medium"
              >
                <Upload className="w-3 h-3 text-indigo-500" />
                <span>更换视频</span>
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black/90 aspect-video border border-slate-200 dark:border-slate-800">
              <video
                ref={videoRef}
                src={videoSrc}
                controls
                onLoadedMetadata={handleVideoLoadedMetadata}
                className="w-full h-full object-contain"
                crossOrigin="anonymous"
              />
            </div>

            {/* Time Sliders */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                  <span>起始时间 (Start Time)</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {startTime.toFixed(1)}s
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, endTime - 0.2)}
                  step="0.1"
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
                  <span>结束时间 (End Time)</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {endTime.toFixed(1)}s
                  </span>
                </div>
                <input
                  type="range"
                  min={startTime + 0.2}
                  max={duration || 10}
                  step="0.1"
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* FPS & Width */}
            <div className="grid grid-cols-2 gap-4 pt-1 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">动图帧率 (FPS)</label>
                <select
                  value={fps}
                  onChange={(e) => setFps(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none font-mono font-bold"
                >
                  <option value="8">8 FPS (小体积)</option>
                  <option value="12">12 FPS (标准推荐)</option>
                  <option value="16">16 FPS (流畅)</option>
                  <option value="24">24 FPS (极度丝滑)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">目标宽度 (px)</label>
                <select
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none font-mono font-bold"
                >
                  <option value="320">320 px (表情包推荐)</option>
                  <option value="480">480 px (标准宽)</option>
                  <option value="640">640 px (高清)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={isConverting}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>正在逐帧提取并编码 GIF ({progress}%)</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  <span>开始转换生成 GIF 动图</span>
                </>
              )}
            </button>
          </div>

          {/* Right: GIF Output Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between items-center gap-6">
            <div className="w-full text-center pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              GIF 动图生成预览
            </div>

            <div className="relative p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center aspect-video w-full max-w-[340px] shadow-inner overflow-hidden">
              {gifBlobUrl ? (
                <img
                  src={gifBlobUrl}
                  alt="Generated GIF"
                  className="w-full h-full object-contain drop-shadow-sm rounded-lg"
                />
              ) : (
                <span className="text-xs text-slate-400">
                  {isConverting ? `转换中 ${progress}%...` : "点击左侧“开始转换”生成 GIF"}
                </span>
              )}
            </div>

            <div className="w-full space-y-2 font-mono text-center text-xs text-slate-400">
              <button
                onClick={handleDownloadGif}
                disabled={!gifBlobUrl}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>下载生成的高清 GIF 动图</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
