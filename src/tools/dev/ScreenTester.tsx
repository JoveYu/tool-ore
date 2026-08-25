import React, { useState, useEffect, useRef } from "react";
import {
  SCREEN_TEST_PATTERNS,
  ScreenTestPattern,
  getScreenInfo,
  ScreenHardwareInfo,
} from "./screenTestUtils";
import {
  Monitor,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
  Layers,
  HelpCircle,
} from "lucide-react";

export default function ScreenTester() {
  const [screenInfo, setScreenInfo] = useState<ScreenHardwareInfo>(getScreenInfo());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setScreenInfo(getScreenInfo());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const currentPattern = SCREEN_TEST_PATTERNS[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SCREEN_TEST_PATTERNS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SCREEN_TEST_PATTERNS.length) % SCREEN_TEST_PATTERNS.length);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (fullscreenContainerRef.current) {
        fullscreenContainerRef.current
          .requestFullscreen()
          .then(() => setIsFullScreen(true))
          .catch(() => {
            document.documentElement
              .requestFullscreen()
              .then(() => setIsFullScreen(true))
              .catch(() => {});
          });
      } else {
        document.documentElement
          .requestFullscreen()
          .then(() => setIsFullScreen(true))
          .catch(() => {});
      }
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // 键盘快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Fullscreen Overlay Mode */}
      <div
        ref={fullscreenContainerRef}
        onClick={handleNext}
        className={`${
          isFullScreen ? "fixed inset-0 z-[9999] block" : "hidden"
        } cursor-pointer select-none overflow-hidden`}
        style={{
          margin: 0,
          padding: 0,
          border: "none",
          outline: "none",
          width: "100vw",
          height: "100vh",
          background:
            currentPattern.type === "solid"
              ? currentPattern.color
              : currentPattern.type === "gradient"
              ? "linear-gradient(to right, #000000 0%, #FFFFFF 100%)"
              : currentPattern.type === "spectrum"
              ? "linear-gradient(to right, red, orange, yellow, green, cyan, blue, violet)"
              : undefined,
          backgroundImage:
            currentPattern.type === "checkerboard"
              ? "repeating-conic-gradient(#000000 0% 25%, #FFFFFF 0% 50%) 50% / 40px 40px"
              : undefined,
        }}
      >
        {/* Top Floating Help Bar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-mono flex items-center gap-4 opacity-30 hover:opacity-100 transition-opacity shadow-2xl z-10 border border-white/10">
          <span>
            当前测试: {currentPattern.name} ({currentIndex + 1}/{SCREEN_TEST_PATTERNS.length})
          </span>
          <span>点击屏幕或空格键切换</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullScreen();
            }}
            className="p-1 hover:text-indigo-400 font-bold"
          >
            退出全屏 (ESC)
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                屏幕坏点与显示质量测试
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                全屏纯色坏点检测、四周漏光检测、256 级灰阶过渡与色阶均匀度测试
              </p>
            </div>
          </div>

          <button
            onClick={toggleFullScreen}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer self-start sm:self-center"
          >
            <Maximize2 className="w-4 h-4" />
            <span>进入全屏沉浸测试</span>
          </button>
        </div>
      </div>

      {/* Screen Hardware Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">物理显示器分辨率</span>
          <span className="font-mono text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mt-1 block">
            {screenInfo.screenWidth} × {screenInfo.screenHeight}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">当前视口尺寸</span>
          <span className="font-mono text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
            {screenInfo.windowWidth} × {screenInfo.windowHeight}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">设备像素比 (DPR)</span>
          <span className="font-mono text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mt-1 block">
            @{screenInfo.dpr}x ({screenInfo.dpr > 1 ? "Retina 高清屏" : "标准屏"})
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">色彩深度 (Color Depth)</span>
          <span className="font-mono text-base sm:text-lg font-bold text-emerald-500 mt-1 block">
            {screenInfo.colorDepth}-Bit 色深
          </span>
        </div>
      </div>

      {/* Main Preview Screen in Dashboard */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            当前测试图样预览: {currentPattern.name}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="上一个测试 (方向键左)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-mono text-xs text-slate-500">
              {currentIndex + 1} / {SCREEN_TEST_PATTERNS.length}
            </span>

            <button
              onClick={handleNext}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="下一个测试 (方向键右)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas Display Box */}
        <div
          onClick={toggleFullScreen}
          className="w-full h-64 sm:h-80 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-inner flex flex-col items-center justify-center p-6 cursor-pointer relative group overflow-hidden"
          style={{
            background:
              currentPattern.type === "solid"
                ? currentPattern.color
                : currentPattern.type === "gradient"
                ? "linear-gradient(to right, #000000 0%, #FFFFFF 100%)"
                : currentPattern.type === "spectrum"
                ? "linear-gradient(to right, red, orange, yellow, green, cyan, blue, violet)"
                : undefined,
            backgroundImage:
              currentPattern.type === "checkerboard"
                ? "repeating-conic-gradient(#000000 0% 25%, #FFFFFF 0% 50%) 50% / 40px 40px"
                : undefined,
          }}
        >
          <div className="px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 shadow-lg opacity-80 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>点击进入全屏纯净模式开始坏点检测</span>
          </div>

          <div className="absolute bottom-4 px-3 py-1.5 rounded-lg bg-black/50 text-[11px] text-white/90 font-mono">
            {currentPattern.description}
          </div>
        </div>
      </div>

      {/* Pattern Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SCREEN_TEST_PATTERNS.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => setCurrentIndex(idx)}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
              currentIndex === idx
                ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 shadow-xs"
                : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            <div
              className="w-7 h-7 rounded-lg border border-black/10 shrink-0 shadow-2xs"
              style={{
                background:
                  p.type === "solid"
                    ? p.color
                    : p.type === "gradient"
                    ? "linear-gradient(to right, #000, #fff)"
                    : p.type === "spectrum"
                    ? "linear-gradient(to right, red, yellow, blue)"
                    : undefined,
                backgroundImage:
                  p.type === "checkerboard"
                    ? "repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 10px 10px"
                    : undefined,
              }}
            />
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                {p.name.split(" ")[0]}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">#{idx + 1} 项检测</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
