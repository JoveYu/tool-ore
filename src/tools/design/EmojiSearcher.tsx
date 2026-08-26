import React, { useState, useMemo, useEffect } from "react";
import {
  ALL_EMOJIS,
  EMOJI_CATEGORIES,
  searchFullEmojis,
  EmojiItem,
} from "./fullEmojiUtils";
import {
  Smile,
  Search,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Heart,
  Hand,
  CheckCircle2,
} from "lucide-react";

export default function EmojiSearcher() {
  const [searchQuery, setSearchQuery] = useState<string>("开心");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedChar, setCopiedChar] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState<number>(120);

  const [recentEmojis, setRecentEmojis] = useState<string[]>(() => {
    return ["😀", "🚀", "🔥", "✨", "❤️", "👍", "🎉", "💡", "😂", "🥰", "👏", "💯"];
  });

  const filteredEmojis = useMemo(() => {
    return searchFullEmojis(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  // 重置分页限制
  useEffect(() => {
    setDisplayLimit(120);
  }, [searchQuery, selectedCategory]);

  const visibleEmojis = useMemo(() => {
    return filteredEmojis.slice(0, displayLimit);
  }, [filteredEmojis, displayLimit]);

  const handleCopy = async (emoji: EmojiItem) => {
    await navigator.clipboard.writeText(emoji.char);
    setCopiedChar(emoji.char);
    setTimeout(() => setCopiedChar(null), 1500);

    // 记录到最近使用
    setRecentEmojis((prev) => [emoji.char, ...prev.filter((c) => c !== emoji.char)].slice(0, 18));
  };

  const handleClear = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Smile className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Emoji 表情检索
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              内置 Unicode 完整全量 Emoji 数据库（1800+ 表情），支持中英文关键词极速模糊检索与一键点击复制
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar & Category Filter Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="输入中文 (如: 开心、笑哭、爱心、大火、点赞)、英文 (如: fire, happy, smile) 或直接粘贴 Emoji..."
            className="w-full pl-11 pr-10 py-3.5 text-sm sm:text-base rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            全部表情 ({ALL_EMOJIS.length})
          </button>

          {EMOJI_CATEGORIES.map((cat) => {
            const count = ALL_EMOJIS.filter((e) => e.category === cat.id).length;
            if (count === 0) return null;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Recently Used Palette */}
      {recentEmojis.length > 0 && !searchQuery && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>常用与最近复制</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {recentEmojis.map((char) => (
              <button
                key={char}
                onClick={async () => {
                  await navigator.clipboard.writeText(char);
                  setCopiedChar(char);
                  setTimeout(() => setCopiedChar(null), 1500);
                }}
                className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:bg-indigo-50 hover:scale-110 hover:border-indigo-400 dark:hover:bg-indigo-950/40 transition-all flex items-center justify-center text-2xl cursor-pointer shadow-2xs relative"
                title="点击复制"
              >
                <span>{char}</span>
                {copiedChar === char && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emoji Grid Results */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            表情列表 (已检索到 {filteredEmojis.length} 个)
          </div>
          <span className="text-[11px] text-slate-400">点击任意卡片即可直接复制</span>
        </div>

        {filteredEmojis.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
              🤔
            </div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              未找到与“{searchQuery}”相关的表情
            </div>
            <p className="text-xs text-slate-400">
              尝试输入相近的中文词汇（如“开心”、“笑”、“火”、“星星”）或英文关键词 (如 “cat”, “happy”, “heart”)
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
              {visibleEmojis.map((emoji, idx) => {
                const isCopied = copiedChar === emoji.char;

                return (
                  <button
                    key={`${emoji.char}-${idx}`}
                    onClick={() => handleCopy(emoji)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer relative group ${
                      isCopied
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm"
                        : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md hover:scale-105"
                    }`}
                    title={`点击复制: ${emoji.name}`}
                  >
                    <span className="text-2xl sm:text-3xl select-none group-hover:scale-115 transition-transform">
                      {emoji.char}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full font-sans">
                      {emoji.name}
                    </span>

                    {isCopied && (
                      <span className="absolute top-1 right-1 inline-flex items-center gap-0.5 px-1 py-0.2 rounded-full bg-emerald-500 text-white text-[8px] font-bold">
                        <Check className="w-2 h-2" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Load More Button */}
            {visibleEmojis.length < filteredEmojis.length && (
              <div className="pt-4 text-center">
                <button
                  onClick={() => setDisplayLimit((prev) => prev + 120)}
                  className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  加载更多表情 (剩余 {filteredEmojis.length - visibleEmojis.length} 个)...
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
