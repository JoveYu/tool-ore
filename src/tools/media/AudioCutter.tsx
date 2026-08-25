import React, { useState, useRef, useEffect } from "react";
import {
  AudioTrimOptions,
  audioBufferToWavBlob,
  drawWaveform,
  trimAudioBuffer,
} from "./audioUtils";
import {
  Volume2,
  Upload,
  Play,
  Pause,
  Download,
  RotateCcw,
  Sliders,
  Sparkles,
  Scissors,
  Layers,
} from "lucide-react";

export default function AudioCutter() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [duration, setDuration] = useState<number>(0);

  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [fadeInDuration, setFadeInDuration] = useState<number>(0.5);
  const [fadeOutDuration, setFadeOutDuration] = useState<number>(0.5);
  const [volume, setVolume] = useState<number>(1.0);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [trimmedBlobUrl, setTrimmedBlobUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // 初始化音频上下文
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    return audioCtxRef.current;
  };

  // 生成示例音频波形（初始展示）
  useEffect(() => {
    const ctx = getAudioContext();
    const sampleRate = 44100;
    const dur = 12; // 12 秒
    const buffer = ctx.createBuffer(2, sampleRate * dur, sampleRate);

    // 填充一段温和的合成音频
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        data[i] =
          (Math.sin(2 * Math.PI * 440 * t) * 0.3 +
            Math.sin(2 * Math.PI * 880 * t) * 0.15) *
          Math.sin((Math.PI * t) / dur);
      }
    }

    setAudioBuffer(buffer);
    setDuration(dur);
    setStartTime(2);
    setEndTime(8);
  }, []);

  // 绘制波形图
  useEffect(() => {
    if (!canvasRef.current || !audioBuffer || duration <= 0) return;
    drawWaveform(canvasRef.current, audioBuffer, {
      startPercent: Math.max(0, startTime / duration),
      endPercent: Math.min(1, endTime / duration),
    });
  }, [audioBuffer, startTime, endTime, duration]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
    setIsProcessing(true);
    setTrimmedBlobUrl(null);

    const ctx = getAudioContext();
    const arrayBuffer = await file.arrayBuffer();

    try {
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      setAudioBuffer(decoded);
      setDuration(decoded.duration);
      setStartTime(0);
      setEndTime(Math.min(decoded.duration, 15));
    } catch {
      alert("音频解码失败，请确认文件格式");
    } finally {
      setIsProcessing(false);
    }
  };

  // 播放当前区间音频预览
  const handlePlayPreview = () => {
    if (!audioBuffer) return;
    const ctx = getAudioContext();

    if (isPlaying) {
      sourceNodeRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    const trimmed = trimAudioBuffer(ctx, audioBuffer, {
      startTime,
      endTime,
      fadeInDuration,
      fadeOutDuration,
      volume,
    });

    const source = ctx.createBufferSource();
    source.buffer = trimmed;
    source.connect(ctx.destination);
    source.onended = () => setIsPlaying(false);

    sourceNodeRef.current = source;
    source.start(0);
    setIsPlaying(true);
  };

  // 导出截取后的 WAV 音频文件
  const handleExportWav = () => {
    if (!audioBuffer) return;
    const ctx = getAudioContext();

    const trimmed = trimAudioBuffer(ctx, audioBuffer, {
      startTime,
      endTime,
      fadeInDuration,
      fadeOutDuration,
      volume,
    });

    const blob = audioBufferToWavBlob(trimmed);
    const url = URL.createObjectURL(blob);
    setTrimmedBlobUrl(url);

    const a = document.createElement("a");
    a.href = url;
    a.download = `trimmed_audio_${Math.round(startTime)}s_${Math.round(endTime)}s.wav`;
    a.click();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toFixed(1);
    return `${m}:${s.padStart(4, "0")}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              纯本地音频波形剪辑
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              基于 Web Audio API 绘制音频波形、毫秒级区间裁剪、淡入淡出调节并导出无损 WAV 文件
            </p>
          </div>
        </div>
      </div>

      {/* Waveform Visual Canvas Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <span>音频波形与裁剪区间</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-mono">
            选中时长: {(endTime - startTime).toFixed(1)} 秒 (总时长: {formatTime(duration)})
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 shadow-inner">
          <canvas
            ref={canvasRef}
            width={900}
            height={140}
            className="w-full h-36 rounded-xl block"
          />
        </div>

        {/* Playback & Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span>上传音频文件</span>
            </button>

            <button
              onClick={handlePlayPreview}
              disabled={!audioBuffer || isProcessing}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
                isPlaying
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>暂停试听</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>播放选定区间</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleExportWav}
            disabled={!audioBuffer || isProcessing}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>导出并下载截取音频 (WAV)</span>
          </button>
        </div>
      </div>

      {/* Sliders & Parameters Configuration */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-indigo-500" />
          <span>时间截取与音效微调</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          {/* Start Time Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
              <span>起始时间 (Start Time)</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {formatTime(startTime)} ({startTime.toFixed(1)}s)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(0, endTime - 0.1)}
              step="0.1"
              value={startTime}
              onChange={(e) => setStartTime(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* End Time Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
              <span>结束时间 (End Time)</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {formatTime(endTime)} ({endTime.toFixed(1)}s)
              </span>
            </div>
            <input
              type="range"
              min={startTime + 0.1}
              max={duration || 10}
              step="0.1"
              value={endTime}
              onChange={(e) => setEndTime(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Fade In */}
          <div className="space-y-2">
            <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
              <span>淡入时长 (Fade In)</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {fadeInDuration}s
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={fadeInDuration}
              onChange={(e) => setFadeInDuration(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Fade Out */}
          <div className="space-y-2">
            <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
              <span>淡出时长 (Fade Out)</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {fadeOutDuration}s
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={fadeOutDuration}
              onChange={(e) => setFadeOutDuration(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
