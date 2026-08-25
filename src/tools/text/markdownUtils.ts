import { marked } from "marked";

export interface MarkdownStats {
  characters: number;
  words: number;
  lines: number;
  readingTimeMinutes: number;
}

/**
 * 将 Markdown 解析为安全 HTML 字符串
 */
export function renderMarkdownToHtml(markdown: string): string {
  if (!markdown.trim()) return "";

  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  return marked.parse(markdown) as string;
}

/**
 * 统计 Markdown 文本数据
 */
export function calculateMarkdownStats(markdown: string): MarkdownStats {
  const clean = markdown.trim();
  if (!clean) {
    return { characters: 0, words: 0, lines: 0, readingTimeMinutes: 0 };
  }

  const lines = markdown.split("\n").length;
  const characters = markdown.length;

  // 匹配单词与汉字
  const cjk = (markdown.match(/[\u4e00-\u9fa5]/g) || []).length;
  const nonCjkWords = (
    markdown.replace(/[\u4e00-\u9fa5]/g, " ").match(/[a-zA-Z0-9_\-]+/g) || []
  ).length;
  const words = cjk + nonCjkWords;

  // 阅读速度估算：约 300 字/分钟
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 300));

  return {
    characters,
    words,
    lines,
    readingTimeMinutes,
  };
}

/**
 * 生成独立的完整 HTML 页面用于下载导出
 */
export function generateFullHtmlDocument(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || "Markdown 导出文档"}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.7;
      color: #1e293b;
      background: #ffffff;
      max-width: 860px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1, h2, h3, h4, h5, h6 { color: #0f172a; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 700; }
    h1 { font-size: 2.2em; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3em; }
    h2 { font-size: 1.6em; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; }
    p, ul, ol { margin-bottom: 1em; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; background: #f1f5f9; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; color: #4f46e5; }
    pre { background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 0.9em; }
    pre code { background: transparent; color: inherit; padding: 0; }
    blockquote { border-left: 4px solid #6366f1; padding-left: 16px; color: #64748b; margin: 1em 0; background: #f8fafc; padding: 12px 16px; border-radius: 0 8px 8px 0; }
    table { width: 100%; border-collapse: collapse; margin: 1.5em 0; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
    img { max-width: 100%; border-radius: 8px; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 2em 0; }
    a { color: #4f46e5; text-decoration: underline; }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}
