import React, { useState, useMemo } from "react";
import {
  renderMarkdownToHtml,
  calculateMarkdownStats,
  generateFullHtmlDocument,
} from "./markdownUtils";
import {
  FileText,
  Copy,
  Check,
  RotateCcw,
  Download,
  Eye,
  Columns,
  Code,
  Bold,
  Italic,
  Heading,
  List,
  Quote,
  Table,
  CheckSquare,
  Link as LinkIcon,
} from "lucide-react";

export default function MarkdownEditor() {
  const sampleMarkdown = `# 🚀 Tool-Ore 在线工具箱

这是一个**轻量级、极速、零后端依赖**的纯前端在线工具集合。

---

## 核心特性

- ⚡ **本地计算**：所有数据处理均在浏览器客户端本地完成，隐私安全零泄露
- 🎨 **现代设计**：深度适配明暗主题切换，界面纯净优雅
- 🛠️ **全能工具链**：覆盖密码学加解密、前端开发排错、图像处理与文本清洗

---

## 常用代码示例

\`\`\`typescript
import { parseJwt } from "./jwtUtils";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const result = parseJwt(token);
console.log(result.payloadObj);
\`\`\`

---

## 数据汇总表格

| 工具分类 | 包含功能 | 运行平台 |
| :--- | :--- | :--- |
| **开发工具** | 时间戳、URL参数、JWT、Cron、UUID | 纯前端 Web / WASM |
| **加密工具** | AES / SM4、RSA / SM2、Hash散列 | Web Crypto API |
| **图片工具** | 图片压缩、格式转换、二维码、条形码 | HTML5 Canvas |

> 📌 **提示**：可直接在左侧编辑 Markdown 文本，右侧将实时渲染排版预览。
`;

  const [markdown, setMarkdown] = useState<string>(sampleMarkdown);
  const [viewMode, setViewMode] = useState<"split" | "edit" | "preview">("split");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const renderedHtml = useMemo(() => renderMarkdownToHtml(markdown), [markdown]);
  const stats = useMemo(() => calculateMarkdownStats(markdown), [markdown]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleInsertText = (prefix: string, suffix: string = "") => {
    setMarkdown((prev) => `${prev}\n${prefix}${suffix}`);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `document_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    const fullHtml = generateFullHtmlDocument("Markdown 文档导出", renderedHtml);
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `document_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Markdown 实时预览与导出
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                GFM 语法支持、双栏同步实时渲染排版、字数统计与一键导出 HTML / Markdown
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium self-start sm:self-center">
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "split"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              双栏对照
            </button>
            <button
              onClick={() => setViewMode("edit")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "edit"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              纯编辑
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "preview"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              纯预览
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Preview Workspace */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        {/* Quick Formatting Toolbar */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => handleInsertText("### 标题三\n")}
              className="p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="插入标题"
            >
              <Heading className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleInsertText("**加粗文本**")}
              className="p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="加粗"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleInsertText("*斜体文本*")}
              className="p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="斜体"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleInsertText("- 无序列表项\n")}
              className="p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="无序列表"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleInsertText("- [ ] 待办任务项\n")}
              className="p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="任务清单"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleInsertText("> 引用说明文字\n")}
              className="p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="引用区块"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleInsertText("```typescript\nconsole.log('hello');\n```\n")}
              className="p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="代码块"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleInsertText("| 列 1 | 列 2 |\n| :--- | :--- |\n| 数据 A | 数据 B |\n")}
              className="p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="插入表格"
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleInsertText("[链接文字](https://example.com)")}
              className="p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="插入链接"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Export and Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMd}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出 .md</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>导出 .html</span>
            </button>

            <button
              onClick={() => handleCopy("html", renderedHtml)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors cursor-pointer shadow-xs"
            >
              {copiedKey === "html" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>已复制 HTML</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制 HTML</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dual Split Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800 min-h-[520px]">
          {/* Left: Editor */}
          {(viewMode === "split" || viewMode === "edit") && (
            <div className={`p-4 flex flex-col ${viewMode === "edit" ? "lg:col-span-2" : ""}`}>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 pb-2">
                <span>MARKDOWN 源代码编辑</span>
                <button
                  onClick={() => setMarkdown("")}
                  className="text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  清空
                </button>
              </div>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="在此输入 Markdown 格式文本..."
                className="flex-1 w-full p-3.5 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                rows={22}
              />
            </div>
          )}

          {/* Right: Rendered HTML Preview */}
          {(viewMode === "split" || viewMode === "preview") && (
            <div className={`p-4 flex flex-col ${viewMode === "preview" ? "lg:col-span-2" : ""}`}>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 pb-2 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-500" />
                <span>实时渲染排版预览</span>
              </div>

              <div
                className="flex-1 w-full p-6 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-700/80 overflow-y-auto max-h-[600px] prose dark:prose-invert prose-indigo prose-sm max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </div>
          )}
        </div>

        {/* Footer Statistics */}
        <div className="p-3 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            <span>总字数: {stats.words}</span>
            <span>总字符数: {stats.characters}</span>
            <span>行数: {stats.lines}</span>
          </div>

          <div>
            <span>预计阅读时长: ~{stats.readingTimeMinutes} 分钟</span>
          </div>
        </div>
      </div>
    </div>
  );
}
