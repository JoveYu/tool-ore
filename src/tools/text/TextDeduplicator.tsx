import React, { useState, useMemo } from "react";
import {
  cleanAndDeduplicateText,
  CleanOptions,
  SortOption,
  CaseOption,
} from "./textDeduplicatorUtils";
import {
  ListFilter,
  Copy,
  Check,
  RotateCcw,
  Download,
  Sliders,
  Sparkles,
  ArrowRightLeft,
  Filter,
} from "lucide-react";

export default function TextDeduplicator() {
  const sampleText = `apple
banana
orange
apple
Banana
  pear  
<p>grape</p>
banana
watermelon

orange
100
20
5`;

  const [inputContent, setInputContent] = useState<string>(sampleText);
  const [deduplicate, setDeduplicate] = useState<boolean>(true);
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [trimWhitespace, setTrimWhitespace] = useState<boolean>(true);
  const [removeEmptyLines, setRemoveEmptyLines] = useState<boolean>(true);
  const [removeHtmlTags, setRemoveHtmlTags] = useState<boolean>(true);
  const [prefix, setPrefix] = useState<string>("");
  const [suffix, setSuffix] = useState<string>("");
  const [addLineNumbers, setAddLineNumbers] = useState<boolean>(false);
  const [sort, setSort] = useState<SortOption>("none");
  const [caseTransform, setCaseTransform] = useState<CaseOption>("none");

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const cleanOptions: CleanOptions = useMemo(
    () => ({
      deduplicate,
      caseSensitive,
      trimWhitespace,
      removeEmptyLines,
      removeHtmlTags,
      prefix,
      suffix,
      addLineNumbers,
      sort,
      caseTransform,
    }),
    [
      deduplicate,
      caseSensitive,
      trimWhitespace,
      removeEmptyLines,
      removeHtmlTags,
      prefix,
      suffix,
      addLineNumbers,
      sort,
      caseTransform,
    ]
  );

  const cleanResult = useMemo(
    () => cleanAndDeduplicateText(inputContent, cleanOptions),
    [inputContent, cleanOptions]
  );

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownload = () => {
    if (!cleanResult.output) return;
    const blob = new Blob([cleanResult.output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cleaned_text_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reductionRate = useMemo(() => {
    if (cleanResult.originalLinesCount === 0) return 0;
    const reduced = cleanResult.originalLinesCount - cleanResult.resultLinesCount;
    return Math.max(0, Math.round((reduced / cleanResult.originalLinesCount) * 100));
  }, [cleanResult]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <ListFilter className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              文本去重与清洗转换
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              按行去重、空白与 HTML 标签过滤、多模式排序、前后缀添加与驼峰/下划线命名转换
            </p>
          </div>
        </div>
      </div>

      {/* Summary Statistics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">原始总行数</span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1 block">
            {cleanResult.originalLinesCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">清洗后行数</span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
            {cleanResult.resultLinesCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">剔除重复行</span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-rose-500 mt-1 block">
            {cleanResult.removedDuplicatesCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">去重缩减率</span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-500 mt-1 block">
            {reductionRate}%
          </span>
        </div>
      </div>

      {/* Control Configuration Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-indigo-500" />
          <span>清洗与转换设置</span>
        </div>

        {/* Checkbox Toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <input
              type="checkbox"
              checked={deduplicate}
              onChange={(e) => setDeduplicate(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">按行去重</span>
          </label>

          <label
            className={`flex items-center gap-2 cursor-pointer select-none p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 ${
              !deduplicate ? "opacity-40" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={caseSensitive}
              disabled={!deduplicate}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">区分大小写</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <input
              type="checkbox"
              checked={trimWhitespace}
              onChange={(e) => setTrimWhitespace(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">去除首尾空格</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <input
              type="checkbox"
              checked={removeEmptyLines}
              onChange={(e) => setRemoveEmptyLines(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">删除空白行</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <input
              type="checkbox"
              checked={removeHtmlTags}
              onChange={(e) => setRemoveHtmlTags(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">剥离 HTML 标签</span>
          </label>
        </div>

        {/* Dropdowns & Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Sorting */}
          <div className="space-y-1.5">
            <label className="font-medium text-slate-700 dark:text-slate-300">文本排序方式</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="none">保持原始顺序</option>
              <option value="asc">A-Z 字典升序</option>
              <option value="desc">Z-A 字典降序</option>
              <option value="num_asc">数值升序 (小到大)</option>
              <option value="num_desc">数值降序 (大到小)</option>
              <option value="length_asc">文本长度 (短到长)</option>
              <option value="length_desc">文本长度 (长到短)</option>
              <option value="shuffle">随机打乱乱序</option>
            </select>
          </div>

          {/* Case & Naming Style */}
          <div className="space-y-1.5">
            <label className="font-medium text-slate-700 dark:text-slate-300">命名风格转换</label>
            <select
              value={caseTransform}
              onChange={(e) => setCaseTransform(e.target.value as CaseOption)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="none">保持原样大小写</option>
              <option value="uppercase">全部大写 (UPPERCASE)</option>
              <option value="lowercase">全部小写 (lowercase)</option>
              <option value="title_case">首字母大写 (Title Case)</option>
              <option value="camel_case">小驼峰 (camelCase)</option>
              <option value="pascal_case">大驼峰 (PascalCase)</option>
              <option value="snake_case">下划线 (snake_case)</option>
              <option value="kebab_case">短横线 (kebab-case)</option>
            </select>
          </div>

          {/* Prefix */}
          <div className="space-y-1.5">
            <label className="font-medium text-slate-700 dark:text-slate-300">添加行前缀</label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="例如: - , item_..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-mono"
            />
          </div>

          {/* Suffix */}
          <div className="space-y-1.5">
            <label className="font-medium text-slate-700 dark:text-slate-300">添加行后缀</label>
            <input
              type="text"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              placeholder="例如: , , ;..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-mono"
            />
          </div>
        </div>

        {/* Add line numbers */}
        <div className="pt-1 flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={addLineNumbers}
              onChange={(e) => setAddLineNumbers(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              自动在行首添加序号 (01. , 02. ...)
            </span>
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInputContent(sampleText)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              载入测试样例
            </button>
            <button
              onClick={() => setInputContent("")}
              className="text-xs text-slate-400 hover:text-rose-500 cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              清空
            </button>
          </div>
        </div>
      </div>

      {/* Dual Pane Layout: Source & Result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Text Input */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              原始文本输入
            </label>

            <span className="text-[11px] text-slate-400 font-mono">
              {inputContent.length} 字符 · {cleanResult.originalLinesCount} 行
            </span>
          </div>

          <textarea
            rows={14}
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder="请在此输入或粘贴多行文本..."
            className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Cleaned Result Output */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              清洗与去重结果
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={!cleanResult.output}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
                title="下载文件"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载</span>
              </button>

              <button
                onClick={() => handleCopy("result", cleanResult.output)}
                disabled={!cleanResult.output}
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
          </div>

          <textarea
            rows={14}
            readOnly
            value={cleanResult.output}
            placeholder="清洗与去重后的文本将实时展示在此处..."
            className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none select-all resize-none leading-relaxed"
          />

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>字符数: {cleanResult.output.length}</span>
            <span>当前有效行数: {cleanResult.resultLinesCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
