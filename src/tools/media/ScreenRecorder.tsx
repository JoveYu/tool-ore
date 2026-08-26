import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  Mic,
  MicOff,
  Volume2,
  Play,
  Square,
  Pause,
  Download,
  RotateCcw,
  Sparkles,
  Sliders,
  Tv,
  Radio,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  MonitorPlay,
  Film,
} from "lucide-react";
import {
  RecordingOptions,
  RecordingInfo,
  formatRecordingTime,
  formatVideoFileSize,
  getSupportedMimeType,
  isScreenRecordingSupported,
} from "./screenRecorderUtils";

export default function ScreenRecorder() {
  const [includeMic, setIncludeMic] = useState<boolean>(false);
  const [resolution, setResolution] = useState<"1080p" | "720p" | "original">("1080p");
  const [frameRate, setFrameRate] = useState<30 | 60>(60);

  // Recording State Machine: "idle" | "ready" | "recording" | "paused" | "finished"
  const [recordState, setRecordState] = useState<"idle" | "ready" | "recording" | "paused" | "finished">("idle");
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedVideo, setRecordedVideo] = useState<RecordingInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const reviewVideoRef = useRef<HTMLVideoElement>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const isSupported = isScreenRecordingSupported();

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      stopAllMediaTracks();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const stopAllMediaTracks = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  // Timer runner
  useEffect(() => {
    if (recordState === "recording") {
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [recordState]);

  // Request display capture & initialize recorder
  const handleStartCapture = async () => {
    setErrorMessage(null);
    setRecordedVideo(null);
    setRecordingSeconds(0);
    recordedChunksRef.current = [];

    try {
      // 1. Get Screen / Window / Tab Display Media
      const videoConstraints: MediaTrackConstraints = {
        frameRate: { ideal: frameRate },
      };

      if (resolution === "1080p") {
        videoConstraints.width = { ideal: 1920 };
        videoConstraints.height = { ideal: 1080 };
      } else if (resolution === "720p") {
        videoConstraints.width = { ideal: 1280 };
        videoConstraints.height = { ideal: 720 };
      }

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: videoConstraints,
        audio: true, // Capture system audio if shared by user
      });

      let finalStream = displayStream;

      // 2. Mix Microphone Audio if requested
      if (includeMic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            },
          });

          // Mix display audio and mic audio into one stream via Web Audio API
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          audioContextRef.current = audioCtx;
          const dest = audioCtx.createMediaStreamDestination();

          // Add display stream audio track if present
          if (displayStream.getAudioTracks().length > 0) {
            const displaySource = audioCtx.createMediaStreamSource(displayStream);
            displaySource.connect(dest);
          }

          // Add microphone audio track
          const micSource = audioCtx.createMediaStreamSource(micStream);
          micSource.connect(dest);

          // Combine video track + mixed audio track
          const mixedTracks = [
            ...displayStream.getVideoTracks(),
            ...dest.stream.getAudioTracks(),
          ];
          finalStream = new MediaStream(mixedTracks);
        } catch (micErr: any) {
          console.warn("麦克风权限获取失败，将仅录制屏幕视频", micErr);
        }
      }

      mediaStreamRef.current = finalStream;

      // Show live preview in video monitor
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = displayStream;
        previewVideoRef.current.play().catch(() => {});
      }

      // Handle user clicking browser native "Stop Sharing" button
      const videoTrack = displayStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          handleStopRecording();
        };
      }

      // 3. Initialize MediaRecorder
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(finalStream, {
        mimeType,
        videoBitsPerSecond: resolution === "1080p" ? 5000000 : 2500000,
      });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(recordedChunksRef.current, { type: mimeType });
        const videoUrl = URL.createObjectURL(fullBlob);
        setRecordedVideo({
          durationMs: recordingSeconds * 1000,
          blobUrl: videoUrl,
          blobSize: fullBlob.size,
          mimeType,
        });
        setRecordState("finished");
        stopAllMediaTracks();
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000); // chunk every 1 sec
      setRecordState("recording");
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setErrorMessage("用户取消了屏幕捕获权限授权");
      } else {
        setErrorMessage(err?.message || "屏幕录制启动失败，请检查浏览器权限");
      }
      setRecordState("idle");
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setRecordState("paused");
    }
  };

  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setRecordState("recording");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      setRecordState("finished");
      stopAllMediaTracks();
    }
  };

  const handleReset = () => {
    stopAllMediaTracks();
    setRecordState("idle");
    setRecordedVideo(null);
    setRecordingSeconds(0);
    setErrorMessage(null);
  };

  const handleDownload = () => {
    if (!recordedVideo) return;
    const isMp4 = recordedVideo.mimeType.includes("mp4");
    const ext = isMp4 ? "mp4" : "webm";
    const a = document.createElement("a");
    a.href = recordedVideo.blobUrl;
    a.download = `screen_recording_${Date.now()}.${ext}`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              网页无插件屏幕与麦克风录制
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              纯本地调用浏览器底层 API 录制屏幕、窗口或标签页，支持系统声音与麦克风混音，导出高清视频
            </p>
          </div>
        </div>
      </div>

      {/* Error / Alert Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="hover:underline cursor-pointer"
          >
            关闭
          </button>
        </div>
      )}

      {/* Main Recording Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monitor & Preview Stage */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <Tv className="w-4 h-4 text-indigo-500" />
              <span>
                {recordState === "finished"
                  ? "录制成品回放与下载"
                  : recordState === "recording" || recordState === "paused"
                  ? "正在实时录屏监视"
                  : "录屏监视准备区"}
              </span>
            </div>

            {/* Live Indicator / Timer */}
            {(recordState === "recording" || recordState === "paused") && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>{recordState === "paused" ? "已暂停" : "REC"}</span>
                <span>{formatRecordingTime(recordingSeconds)}</span>
              </div>
            )}
          </div>

          {/* Video Stage Frame */}
          <div className="relative aspect-video w-full rounded-2xl bg-black/95 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-inner">
            {recordState === "finished" && recordedVideo ? (
              <video
                ref={reviewVideoRef}
                src={recordedVideo.blobUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : recordState === "recording" || recordState === "paused" ? (
              <video
                ref={previewVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
                  <MonitorPlay className="w-8 h-8 text-indigo-400" />
                </div>
                <div className="text-sm font-semibold text-slate-200">
                  点击右侧“开始捕获并录制”按钮选择屏幕源
                </div>
                <p className="text-xs text-slate-400 max-w-sm">
                  支持录制整个桌面显示器、指定软件窗口（如 VS Code、浏览器）或单个网页标签
                </p>
              </div>
            )}
          </div>

          {/* Bottom Action Controls */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>录制时长: {formatRecordingTime(recordingSeconds)}</span>
              {recordedVideo && (
                <span className="ml-2 font-mono">
                  · 体积: {formatVideoFileSize(recordedVideo.blobSize)}
                </span>
              )}
            </div>

            {/* State-driven Action Buttons */}
            <div className="flex items-center gap-2">
              {recordState === "idle" && (
                <button
                  onClick={handleStartCapture}
                  disabled={!isSupported}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>开始捕获并录制</span>
                </button>
              )}

              {recordState === "recording" && (
                <>
                  <button
                    onClick={handlePauseRecording}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>暂停录制</span>
                  </button>
                  <button
                    onClick={handleStopRecording}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>结束录制</span>
                  </button>
                </>
              )}

              {recordState === "paused" && (
                <>
                  <button
                    onClick={handleResumeRecording}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>继续录制</span>
                  </button>
                  <button
                    onClick={handleStopRecording}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>结束录制</span>
                  </button>
                </>
              )}

              {recordState === "finished" && (
                <>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>重新录制</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下载录制视频</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Settings & Audio Input Config */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>录制音频与画质设置</span>
            </div>

            {/* Microphone Toggle */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                麦克风人声录制
              </span>
              <button
                onClick={() => setIncludeMic(!includeMic)}
                disabled={recordState !== "idle"}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer disabled:opacity-50 ${
                  includeMic
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {includeMic ? <Mic className="w-4 h-4 text-indigo-500" /> : <MicOff className="w-4 h-4 text-slate-400" />}
                  <span>{includeMic ? "已启用麦克风收音" : "麦克风已静音"}</span>
                </div>
                <span className="text-[11px] font-mono font-normal">
                  {includeMic ? "混音输出" : "仅系统音"}
                </span>
              </button>
            </div>

            {/* Resolution Selector */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                视频分辨率规格
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "1080p", label: "1080P" },
                  { id: "720p", label: "720P" },
                  { id: "original", label: "原生尺寸" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setResolution(item.id as any)}
                    disabled={recordState !== "idle"}
                    className={`py-2 rounded-xl border text-center font-semibold transition-all disabled:opacity-50 cursor-pointer ${
                      resolution === item.id
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Rate */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                帧率流程度
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { fps: 60, label: "60 FPS (丝滑流畅)" },
                  { fps: 30, label: "30 FPS (标准节省)" },
                ].map((item) => (
                  <button
                    key={item.fps}
                    onClick={() => setFrameRate(item.fps as any)}
                    disabled={recordState !== "idle"}
                    className={`py-2 px-2 rounded-xl border text-center text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer ${
                      frameRate === item.fps
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy & Feature Info */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>纯本地私密录制保证</span>
            </div>
            <p className="leading-relaxed">
              所有音视频数据直接写入浏览器内存，录制生成后即可本地下载，绝不上报任何服务器。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
