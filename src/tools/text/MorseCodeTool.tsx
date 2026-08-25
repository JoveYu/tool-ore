import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  encodeToMorse,
  decodeFromMorse,
  MorseAudioPlayer,
  MORSE_CODE_MAP,
} from "./morseUtils";
import {
  Radio,
  Play,
  Square,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  Volume2,
  Table,
} from "lucide-react";

type Mode = "encode" | "decode";

export default function MorseCodeTool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [inputText, setInputText] = useState<string>("SOS MAYDAY");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [wpm, setWpm] = useState<number>(20);
  const [frequency, setFrequency] = useState<number>(700);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const playerRef = useRef<MorseAudioPlayer | null>(null);

  useEffect(() => {
    playerRef.current = new MorseAudioPlayer();
    return () => {
      playerRef.current?.stop();
    };
  }, []);

  const convertedResult = useMemo(() => {
    if (!inputText.trim()) return "";
    if (mode === "encode") {
      return encodeToMorse(inputText);
    } else {
      return decodeFromMorse(inputText);
    }
  }, [inputText, mode]);

  const morseCodeToPlay = useMemo(() => {
    return mode === "encode" ? convertedResult : inputText;
  }, [mode, convertedResult, inputText]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleSwap = () => {
    if (convertedResult) {
      setInputText(convertedResult);
      setMode(mode === "encode" ? "decode" : "encode");
    } else {
      setMode(mode === "encode" ? "decode" : "encode");
    }
  };

  const handlePlayAudio = async () => {
    if (!playerRef.current || !morseCodeToPlay.trim()) return;

    if (isPlaying) {
      playerRef.current.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    try {
      await playerRef.current.play(morseCodeToPlay, wpm, frequency);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleStopAudio = () => {
    if (playerRef.current) {
      playerRef.current.stop();
      setIsPlaying(false);
    }
  };

  const presets = [
    { label: "SOS 紧急求救", text: "SOS" },
    { label: "我爱你 I LOVE YOU", text: "I LOVE YOU" },
    { label: "确认 OK", text: "OK" },
    { label: "HELLO WORLD", text: "HELLO WORLD" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                摩斯电码编解码与发音
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                国际标准摩斯密码实时双向翻译、支持 Web Audio API 真实电报滴答音频发声播放
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium self-start sm:self-center">
            <button
              onClick={() => setMode("encode")}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                mode === "encode"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              明文转摩斯电码
            </button>
            <button
              onClick={() => setMode("decode")}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                mode === "decode"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              摩斯电码解密
            </button>
          </div>
        </div>
      </div>

      {/* Audio Player Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayAudio}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
                isPlaying
                  ? "bg-amber-500 hover:bg-amber-600 text-white animate-pulse"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-4 h-4" />
                  <span>正在发声播放 (点击停止)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>电报音频发声播放</span>
                </>
              )}
            </button>

            {isPlaying && (
              <button
                onClick={handleStopAudio}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                停止
              </button>
            )}
          </div>

          {/* Speed & Frequency Slider */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">发报速率:</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {wpm} WPM
              </span>
              <input
                type="range"
                min="10"
                max="40"
                value={wpm}
                onChange={(e) => setWpm(Number(e.target.value))}
                className="w-24 accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">蜂鸣音调:</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {frequency} Hz
              </span>
              <input
                type="range"
                min="400"
                max="1200"
                step="50"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-24 accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">快捷常用预设:</span>
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => setInputText(p.text)}
            className="px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-all cursor-pointer shadow-2xs"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Editor & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {mode === "encode" ? "输入明文文本" : "输入摩斯电码 (以 . 和 - 组成)"}
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSwap}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                对调
              </button>
              <button
                onClick={() => setInputText("")}
                className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                清空
              </button>
            </div>
          </div>

          <textarea
            rows={12}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              mode === "encode"
                ? "输入英文或数字 (如: SOS HELP)..."
                : "输入摩斯电码 (如: ... --- ...)..."
            }
            className="flex-1 w-full p-3.5 font-mono text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
          />

          <div className="text-[11px] text-slate-400 font-mono">长度: {inputText.length} 字符</div>
        </div>

        {/* Output */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {mode === "encode" ? "生成的摩斯电码" : "解密还原的明文"}
            </label>

            <button
              onClick={() => handleCopy("result", convertedResult)}
              disabled={!convertedResult}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-xs transition-colors cursor-pointer"
            >
              {copiedKey === "result" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制结果</span>
                </>
              )}
            </button>
          </div>

          <textarea
            rows={12}
            readOnly
            value={convertedResult}
            placeholder="结果将实时呈现在此处..."
            className="flex-1 w-full p-3.5 font-mono text-sm sm:text-base font-bold rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-indigo-950 dark:text-indigo-200 outline-none select-all resize-none leading-relaxed break-all tracking-widest"
          />

          <div className="text-[11px] text-slate-400 font-mono">
            字符数: {convertedResult.length}
          </div>
        </div>
      </div>

      {/* International Morse Code Cheat Sheet */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
          <Table className="w-4 h-4 text-indigo-500" />
          <span>国际标准摩尔斯电码对照速查表</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2 font-mono text-xs text-center">
          {Object.entries(MORSE_CODE_MAP)
            .filter(([k]) => k !== " ")
            .slice(0, 36)
            .map(([char, code]) => (
              <div
                key={char}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-0.5"
              >
                <div className="font-bold text-slate-900 dark:text-white">{char}</div>
                <div className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">
                  {code}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
