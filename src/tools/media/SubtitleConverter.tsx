import React, { useState, useMemo, useRef } from "react";
import {
  FileText,
  UploadCloud,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  Clock,
  FastForward,
  Eraser,
  ListOrdered,
  Film,
  Music,
  Code2,
} from "lucide-react";
import { CodeViewer } from "../../components/CodeViewer";
import {
  SubtitleFormat,
  SubtitleCue,
  SAMPLE_SUBTITLE_SRT,
  parseSubtitle,
  adjustSubtitleTimeline,
  exportToSrt,
  exportToVtt,
  exportToLrc,
  exportToAss,
  msToSrtTime,
} from "./subtitleUtils";

export default function SubtitleConverter() {
  const [rawText, setRawText] = useState<string>(SAMPLE_SUBTITLE_SRT);
  const [targetFormat, setTargetFormat] = useState<SubtitleFormat>("vtt");

  // Adjustment options
  const [offsetMs, setOffsetMs] = useState<number>(0);
  const [speedRatio, setSpeedRatio] = useState<number>(1.0);
  const [cleanTags, setCleanTags] = useState<boolean>(true);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse raw subtitle into Cues
  const parsedCues = useMemo(() => {
    return parseSubtitle(rawText);
  }, [rawText]);

  // Apply timeline offset & speed adjustment
  const adjustedCues = useMemo(() => {
    return adjustSubtitleTimeline(parsedCues, {
      offsetMs,
      speedRatio,
      cleanTags,
    });
  }, [parsedCues, offsetMs, speedRatio, cleanTags]);

  // Convert to target format
  const outputCode = useMemo(() => {
    if (adjustedCues.length === 0) return "";
    switch (targetFormat) {
      case "srt":
        return exportToSrt(adjustedCues);
      case "vtt":
        return exportToVtt(adjustedCues);
      case "lrc":
        return exportToLrc(adjustedCues);
      case "ass":
        return exportToAss(adjustedCues);
      default:
        return "";
    }
  }, [adjustedCues, targetFormat]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownload = () => {
    if (!outputCode) return;
    const blob = new Blob([outputCode], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `subtitles_${targetFormat}_${Date.now()}.${targetFormat}`;
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".srt,.vtt,.lrc,.ass,.ssa,.txt"
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
              视频字幕与歌词转换校准
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              纯本地 SRT、WebVTT、LRC 歌词与 ASS 字幕双向互转，支持毫秒级时间轴批量平移与音画同步校准
            </p>
          </div>
        </div>
      </div>

      {/* Format Selector Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mr-1">
            目标字幕格式:
          </span>

          {[
            { id: "vtt", label: "WebVTT (VTT)", desc: "现代网页播放器标准" },
            { id: "srt", label: "SubRip (SRT)", desc: "最通用的视频字幕" },
            { id: "lrc", label: "LRC 歌词", desc: "音乐播放器逐行歌词" },
            { id: "ass", label: "Advanced SSA (ASS)", desc: "高级特效字幕" },
          ].map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setTargetFormat(fmt.id as SubtitleFormat)}
              className={`px-3.5 py-2 rounded-xl border font-semibold transition-all cursor-pointer ${
                targetFormat === fmt.id
                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs ring-2 ring-indigo-500/20"
                  : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span>{fmt.label}</span>
            </button>
          ))}
        </div>

        {/* Clean Tags Toggle */}
        <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium select-none">
          <input
            type="checkbox"
            checked={cleanTags}
            onChange={(e) => setCleanTags(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
          />
          <span>清除 HTML/ASS 样式代码</span>
        </label>
      </div>

      {/* Timeline Offset & Speed Adjustment Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>时间轴平移偏移与音画同步校准</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          {/* Offset slider & quick buttons */}
          <div className="space-y-2">
            <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
              <span>时间轴整体平移偏移</span>
              <span className={`font-mono font-bold ${offsetMs !== 0 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}>
                {offsetMs > 0 ? `+${offsetMs}` : offsetMs} 毫秒 ({offsetMs / 1000} 秒)
              </span>
            </div>

            <input
              type="range"
              min="-10000"
              max="10000"
              step="100"
              value={offsetMs}
              onChange={(e) => setOffsetMs(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              {[-3000, -1000, -500, 0, 500, 1000, 3000].map((ms) => (
                <button
                  key={ms}
                  onClick={() => setOffsetMs(ms)}
                  className={`px-2 py-0.5 rounded-md border text-[11px] font-mono transition-colors ${
                    offsetMs === ms
                      ? "bg-indigo-600 text-white font-bold border-indigo-600"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {ms === 0 ? "重置 0" : `${ms > 0 ? "+" : ""}${ms / 1000}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Speed ratio */}
          <div className="space-y-2">
            <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
              <span>播放速度时间轴缩放倍率</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{speedRatio}x</span>
            </div>

            <input
              type="range"
              min="0.8"
              max="1.25"
              step="0.01"
              value={speedRatio}
              onChange={(e) => setSpeedRatio(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              {[0.9, 0.95, 1.0, 1.05, 1.1].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setSpeedRatio(ratio)}
                  className={`px-2 py-0.5 rounded-md border text-[11px] font-mono transition-colors ${
                    speedRatio === ratio
                      ? "bg-indigo-600 text-white font-bold border-indigo-600"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {ratio === 1.0 ? "原速 1.0x" : `${ratio}x`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Textarea */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                原始字幕内容 (SRT / VTT / LRC / ASS)
              </label>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <UploadCloud className="w-3 h-3" />
                  <span>上传字幕文件</span>
                </button>
                <button
                  onClick={() => setRawText(SAMPLE_SUBTITLE_SRT)}
                  className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>示例</span>
                </button>
                <button
                  onClick={() => setRawText("")}
                  className="text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer transition-colors font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>清空</span>
                </button>
              </div>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="在此粘贴 SRT、VTT 或 LRC 歌词文本..."
              spellCheck={false}
              className="flex-1 w-full min-h-[380px] p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed whitespace-pre"
              rows={18}
            />
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>已识别字幕句数: {parsedCues.length} 句</span>
            <span>字符数: {rawText.length}</span>
          </div>
        </div>

        {/* Right: Output Converted Subtitle */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                转换结果 ({targetFormat.toUpperCase()})
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  disabled={!outputCode}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                  title="下载字幕文件"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载</span>
                </button>

                <button
                  onClick={() => handleCopy("output", outputCode)}
                  disabled={!outputCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-xs transition-colors cursor-pointer"
                >
                  {copiedKey === "output" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制字幕</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <CodeViewer
                code={outputCode}
                language="text"
                maxHeight="380px"
                placeholder="转换后的字幕将在此处呈现..."
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>输出大小: {new Blob([outputCode]).size} 字节</span>
            <span>格式: {targetFormat.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
