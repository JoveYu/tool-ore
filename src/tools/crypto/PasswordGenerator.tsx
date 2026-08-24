import React, { useState, useEffect, useMemo } from "react";
import {
  generatePasswords,
  evaluatePasswordStrength,
  PasswordOptions,
  PasswordStrength,
} from "./passwordUtils";
import {
  KeyRound,
  Shield,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function PasswordGenerator() {
  const [length, setLength] = useState<number>(16);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeSimilar, setExcludeSimilar] = useState<boolean>(false);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);

  const [quantity, setQuantity] = useState<number>(5);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  const options: PasswordOptions = useMemo(
    () => ({
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
      excludeSimilar,
      excludeAmbiguous,
      quantity,
    }),
    [
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
      excludeSimilar,
      excludeAmbiguous,
      quantity,
    ]
  );

  const handleGenerate = () => {
    const list = generatePasswords(options);
    setPasswords(list);
  };

  useEffect(() => {
    handleGenerate();
  }, [options]);

  const mainPassword = passwords[0] || "";
  const strength: PasswordStrength = useMemo(
    () => evaluatePasswordStrength(mainPassword),
    [mainPassword]
  );

  const handleCopySingle = async (idx: number, pwd: string) => {
    await navigator.clipboard.writeText(pwd);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const handleCopyAll = async () => {
    if (passwords.length === 0) return;
    await navigator.clipboard.writeText(passwords.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              随机密码生成器
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              基于浏览器底层加密安全随机数（Crypto API）生成强密码，支持批量生成与破解耗时估算
            </p>
          </div>
        </div>
      </div>

      {/* Main Feature / Featured Password Display */}
      {mainPassword && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              当前生成主密码
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                安全强度:
              </span>
              <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                {strength.label}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                (暴力破解预估需 {strength.crackTimeEstimate})
              </span>
            </div>
          </div>

          {/* Strength Bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex gap-1">
            {[0, 1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-full rounded-full transition-all ${
                  step <= strength.score ? strength.color : "bg-slate-200 dark:bg-slate-700/50"
                }`}
              />
            ))}
          </div>

          {/* Featured Display Bar */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 gap-3">
            <div className="font-mono text-lg sm:text-xl font-bold tracking-wider text-indigo-600 dark:text-indigo-400 break-all select-all flex-1">
              {mainPassword}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleGenerate}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                title="重新生成"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleCopySingle(0, mainPassword)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer text-xs"
              >
                {copiedIdx === 0 ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>复制密码</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Configurations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Settings (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <span>密码生成参数</span>
          </div>

          {/* Length Slider */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                密码长度 (Length)
              </label>
              <span className="font-mono font-bold text-base text-indigo-600 dark:text-indigo-400">
                {length} 位
              </span>
            </div>
            <input
              type="range"
              min="6"
              max="64"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>6位</span>
              <span>16位 (推荐)</span>
              <span>32位</span>
              <span>64位</span>
            </div>
          </div>

          {/* Character Rules */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              包含字符集
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: "upper",
                  label: "大写字母 (A-Z)",
                  desc: "ABCDEF...",
                  checked: includeUppercase,
                  toggle: () => setIncludeUppercase(!includeUppercase),
                },
                {
                  id: "lower",
                  label: "小写字母 (a-z)",
                  desc: "abcdef...",
                  checked: includeLowercase,
                  toggle: () => setIncludeLowercase(!includeLowercase),
                },
                {
                  id: "numbers",
                  label: "数字 (0-9)",
                  desc: "0123456789",
                  checked: includeNumbers,
                  toggle: () => setIncludeNumbers(!includeNumbers),
                },
                {
                  id: "symbols",
                  label: "特殊符号 (!@#$...)",
                  desc: "!@#$%^&*()_+-=",
                  checked: includeSymbols,
                  toggle: () => setIncludeSymbols(!includeSymbols),
                },
              ].map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    item.checked
                      ? "bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-400 text-indigo-900 dark:text-indigo-200"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={item.toggle}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Exclusion Options */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              高级过滤选项
            </label>
            <div className="flex flex-wrap gap-4 text-xs">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={excludeSimilar}
                  onChange={(e) => setExcludeSimilar(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>排除易混淆字符 (如: i, l, 1, L, o, 0, O)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={excludeAmbiguous}
                  onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>排除复杂标点 (如: {'{}[]()/\'"`~,;:.<>'})</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Batch Generation List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>批量生成 ({quantity} 条)</span>
              </div>

              <div className="flex items-center gap-1.5">
                {[5, 10, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuantity(num)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors ${
                      quantity === num
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Password List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[290px] overflow-y-auto font-mono text-xs pr-1">
              {passwords.map((pwd, idx) => (
                <div
                  key={idx}
                  className="py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-1.5 rounded-lg transition-colors group"
                >
                  <span className="truncate select-all text-slate-800 dark:text-slate-200">
                    {pwd}
                  </span>
                  <button
                    onClick={() => handleCopySingle(idx, pwd)}
                    className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer shrink-0"
                    title="复制单个"
                  >
                    {copiedIdx === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleCopyAll}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">已复制全部密码</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>一键复制全部密码</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
