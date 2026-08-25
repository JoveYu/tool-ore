import React, { useState, useMemo } from "react";
import {
  UNIT_CATEGORIES,
  UnitCategory,
  convertAllUnits,
  formatUnitNumber,
} from "./unitUtils";
import {
  Scale,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRightLeft,
  Search,
} from "lucide-react";

export default function UnitConverter() {
  const [selectedCategory, setSelectedCategory] = useState<UnitCategory>("data");
  const [sourceUnitId, setSourceUnitId] = useState<string>("MB");
  const [sourceValue, setSourceValue] = useState<string>("1024");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const currentCategoryConfig = useMemo(
    () => UNIT_CATEGORIES.find((c) => c.id === selectedCategory) || UNIT_CATEGORIES[0],
    [selectedCategory]
  );

  // 切换分类时更新默认单位
  const handleCategoryChange = (catId: UnitCategory) => {
    setSelectedCategory(catId);
    const cat = UNIT_CATEGORIES.find((c) => c.id === catId);
    if (cat && cat.units.length > 0) {
      setSourceUnitId(cat.units[0].id);
      setSourceValue("1");
    }
  };

  const convertedValues = useMemo(() => {
    const num = parseFloat(sourceValue);
    if (isNaN(num)) return {};
    return convertAllUnits(selectedCategory, sourceUnitId, num);
  }, [selectedCategory, sourceUnitId, sourceValue]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // 点击表格行设为输入源
  const handleRowClick = (unitId: string, val: number) => {
    setSourceUnitId(unitId);
    setSourceValue(formatUnitNumber(val));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              常用物理与数据单位换算
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              数据存储 (1024/1000)、长度、面积、重量质量、温度温标、时间、速度与压力实时全量联动换算
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          选择度量物理分类
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {UNIT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-2 rounded-xl border font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            输入数值与基准单位
          </label>
          <button
            onClick={() => setSourceValue("0")}
            className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置数值
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="number"
            value={sourceValue}
            onChange={(e) => setSourceValue(e.target.value)}
            placeholder="输入数值..."
            className="flex-1 px-4 py-3 text-lg sm:text-xl font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />

          <select
            value={sourceUnitId}
            onChange={(e) => setSourceUnitId(e.target.value)}
            className="px-4 py-3 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
          >
            {currentCategoryConfig.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} [{u.symbol}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* All Units Live Real-time Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <span>{currentCategoryConfig.name} - 各单位实时换算结果</span>
          <span className="text-[11px] text-slate-400 font-normal font-sans">
            点击任意行可设为基准输入
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 uppercase bg-slate-50/30 dark:bg-slate-800/10">
                <th className="py-3 px-6 font-semibold w-1/4">单位名称</th>
                <th className="py-3 px-4 font-semibold w-24">符号</th>
                <th className="py-3 px-6 font-semibold">换算数值</th>
                <th className="py-3 px-6 font-semibold w-20 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {currentCategoryConfig.units.map((unit) => {
                const val = convertedValues[unit.id] ?? 0;
                const formatted = formatUnitNumber(val);
                const isSelected = unit.id === sourceUnitId;

                return (
                  <tr
                    key={unit.id}
                    onClick={() => handleRowClick(unit.id, val)}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                      isSelected ? "bg-indigo-50/50 dark:bg-indigo-950/20" : ""
                    }`}
                  >
                    <td className="py-3 px-6 font-medium text-slate-800 dark:text-slate-200 font-sans">
                      {unit.name}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-bold">{unit.symbol}</td>
                    <td className="py-3 px-6 font-bold text-indigo-600 dark:text-indigo-400 select-all text-sm sm:text-base">
                      {formatted}
                    </td>
                    <td className="py-3 px-6 text-right font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(unit.id, formatted);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        {copiedKey === unit.id ? (
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
