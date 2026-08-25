import React, { useState, useEffect, useMemo } from "react";
import {
  parseTimestampInput,
  formatStandardDate,
  getTimeZoneList,
  LANGUAGE_SNIPPETS,
} from "./timestampUtils";
import {
  Clock,
  Copy,
  Check,
  RotateCcw,
  Globe2,
  Code2,
  Calendar,
  Play,
  Pause,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default function TimestampConverter() {
  // 当前实时时间
  const [now, setNow] = useState<Date>(new Date());
  const [isTicking, setIsTicking] = useState<boolean>(true);

  // 复制反馈状态
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 面板 1：时间戳 -> 日期时间
  const [tsInput, setTsInput] = useState<string>("");
  const [unitMode, setUnitMode] = useState<"auto" | "s" | "ms">("auto");

  // 面板 2：日期时间 -> 时间戳
  const [dateInput, setDateInput] = useState<string>("");

  // 实时跳动定时器
  useEffect(() => {
    if (!isTicking) return;
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [isTicking]);

  // 初始化设置默认输入为当前时间
  useEffect(() => {
    const currentSec = Math.floor(Date.now() / 1000).toString();
    setTsInput(currentSec);
    setDateInput(formatStandardDate(new Date()));
  }, []);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // 解析时间戳输入
  const parsedFromTs = useMemo(() => {
    if (!tsInput.trim()) return null;
    return parseTimestampInput(tsInput, unitMode);
  }, [tsInput, unitMode]);

  // 解析日期输入
  const parsedFromDate = useMemo(() => {
    if (!dateInput.trim()) return null;
    return parseTimestampInput(dateInput, "auto");
  }, [dateInput]);

  // 当前激活的时间对象（优先取时间戳解析，其次取当前时间）
  const activeDate = useMemo(() => {
    if (parsedFromTs && parsedFromTs.isValid && parsedFromTs.date) {
      return parsedFromTs.date;
    }
    return now;
  }, [parsedFromTs, now]);

  const timezoneList = useMemo(() => getTimeZoneList(activeDate), [activeDate]);

  const currentSec = Math.floor(now.getTime() / 1000);
  const currentMs = now.getTime();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              时间戳与时区转换
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Unix 秒与毫秒时间戳转换、本地与 UTC 标准时间互转、全球主要时区实时对照
            </p>
          </div>
        </div>
      </div>

      {/* Live Real-time Clock Dashboard */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <span className="relative flex h-2.5 w-2.5">
              {isTicking && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isTicking ? "bg-emerald-500" : "bg-amber-500"
                }`}
              ></span>
            </span>
            <span>当前实时时间</span>
          </div>

          <button
            onClick={() => setIsTicking(!isTicking)}
            className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isTicking ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-500" />
                <span>暂停跳动</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-500" />
                <span>恢复跳动</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Current Sec */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5">
            <div className="text-xs text-slate-500 dark:text-slate-400">秒时间戳 (10位)</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400 select-all">
                {currentSec}
              </span>
              <button
                onClick={() => handleCopy("cur_sec", currentSec.toString())}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                title="复制秒时间戳"
              >
                {copiedKey === "cur_sec" ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Current Ms */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5">
            <div className="text-xs text-slate-500 dark:text-slate-400">毫秒时间戳 (13位)</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 select-all">
                {currentMs}
              </span>
              <button
                onClick={() => handleCopy("cur_ms", currentMs.toString())}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                title="复制毫秒时间戳"
              >
                {copiedKey === "cur_ms" ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Current Formatted */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5">
            <div className="text-xs text-slate-500 dark:text-slate-400">标准本地时间</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 select-all">
                {formatStandardDate(now)}
              </span>
              <button
                onClick={() => handleCopy("cur_fmt", formatStandardDate(now))}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                title="复制本地标准时间"
              >
                {copiedKey === "cur_fmt" ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two-way Interactive Converters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Timestamp -> Date */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>时间戳转标准日期</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTsInput(Math.floor(Date.now() / 1000).toString())}
                className="text-xs px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                设为当前秒
              </button>
              <button
                onClick={() => setTsInput("")}
                className="text-xs text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                title="清空输入"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Unit selection */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">单位推断:</span>
            {[
              { id: "auto", label: "自动识别" },
              { id: "s", label: "秒 (s)" },
              { id: "ms", label: "毫秒 (ms)" },
            ].map((u) => (
              <button
                key={u.id}
                onClick={() => setUnitMode(u.id as any)}
                className={`px-2.5 py-1 rounded-lg border font-medium cursor-pointer transition-all ${
                  unitMode === u.id
                    ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={tsInput}
            onChange={(e) => setTsInput(e.target.value)}
            placeholder="输入时间戳 (如: 1700000000)..."
            className="w-full px-4 py-2.5 font-mono text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />

          {parsedFromTs && !parsedFromTs.isValid && (
            <div className="flex items-center gap-1.5 text-xs text-rose-500">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parsedFromTs.error}</span>
            </div>
          )}

          {parsedFromTs && parsedFromTs.isValid && (
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500">标准时间</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100 select-all">
                    {parsedFromTs.localString}
                  </span>
                  <button
                    onClick={() => handleCopy("ts_local", parsedFromTs.localString || "")}
                    className="text-slate-400 hover:text-indigo-600"
                  >
                    {copiedKey === "ts_local" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500">相对时间</span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                  {parsedFromTs.relativeString}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500">ISO 8601</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 select-all">
                    {parsedFromTs.isoString}
                  </span>
                  <button
                    onClick={() => handleCopy("ts_iso", parsedFromTs.isoString || "")}
                    className="text-slate-400 hover:text-indigo-600"
                  >
                    {copiedKey === "ts_iso" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500">UTC 标准时间</span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 select-all">
                  {parsedFromTs.utcString}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Panel 2: Date -> Timestamp */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>标准日期转时间戳</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setDateInput(formatStandardDate(new Date()))}
                className="text-xs px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                设为当前时间
              </button>
              <button
                onClick={() => setDateInput("")}
                className="text-xs text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                title="清空输入"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            支持格式：YYYY-MM-DD HH:mm:ss、ISO 字符串或标准时间表示
          </div>

          <input
            type="text"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            placeholder="例如: 2026-08-25 12:00:00"
            className="w-full px-4 py-2.5 font-mono text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />

          {parsedFromDate && !parsedFromDate.isValid && (
            <div className="flex items-center gap-1.5 text-xs text-rose-500">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parsedFromDate.error}</span>
            </div>
          )}

          {parsedFromDate && parsedFromDate.isValid && (
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500">秒时间戳 (10位)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 select-all">
                    {parsedFromDate.seconds}
                  </span>
                  <button
                    onClick={() => handleCopy("dt_sec", parsedFromDate.seconds?.toString() || "")}
                    className="text-slate-400 hover:text-indigo-600"
                  >
                    {copiedKey === "dt_sec" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500">毫秒时间戳 (13位)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-100 select-all">
                    {parsedFromDate.milliseconds}
                  </span>
                  <button
                    onClick={() =>
                      handleCopy("dt_ms", parsedFromDate.milliseconds?.toString() || "")
                    }
                    className="text-slate-400 hover:text-indigo-600"
                  >
                    {copiedKey === "dt_ms" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500">相对时间</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {parsedFromDate.relativeString}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500">ISO 8601</span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 select-all">
                  {parsedFromDate.isoString}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Timezones Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Globe2 className="w-4 h-4 text-indigo-500" />
            <span>全球主要时区实时对照</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            基准时间: {formatStandardDate(activeDate)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 uppercase bg-slate-50/30 dark:bg-slate-800/10">
                <th className="py-3 px-6 font-semibold">地区 / 时区名称</th>
                <th className="py-3 px-4 font-semibold">偏移量</th>
                <th className="py-3 px-6 font-semibold">对应时间</th>
                <th className="py-3 px-6 font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {timezoneList.map((tz) => (
                <tr
                  key={tz.timeZone}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-6 font-medium text-slate-800 dark:text-slate-200">
                    {tz.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                    {tz.offset}
                  </td>
                  <td className="py-3 px-6 font-mono font-bold text-indigo-600 dark:text-indigo-400 select-all">
                    {tz.formatted}
                  </td>
                  <td className="py-3 px-6 text-right">
                    <button
                      onClick={() => handleCopy(`tz_${tz.timeZone}`, tz.formatted)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      {copiedKey === `tz_${tz.timeZone}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">
                            已复制
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span className="text-[11px]">复制</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Snippets Cheatsheet */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <Code2 className="w-4 h-4 text-indigo-500" />
          <span>各编程语言获取时间戳代码速查</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LANGUAGE_SNIPPETS.map((snip, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">{snip.lang}</span>
                <button
                  onClick={() => handleCopy(`snip_${idx}`, snip.code)}
                  className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                  title="复制代码片段"
                >
                  {copiedKey === `snip_${idx}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[11px]">复制</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-indigo-900 dark:text-indigo-200 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-100 dark:border-slate-800">
                {snip.code}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
