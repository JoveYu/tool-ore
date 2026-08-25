import { describe, it, expect } from "vitest";
import {
  renderMarkdownToHtml,
  calculateMarkdownStats,
  generateFullHtmlDocument,
} from "../src/tools/text/markdownUtils";

describe("Markdown Editor Utilities", () => {
  it("renders GFM markdown to HTML correctly", () => {
    const md = "# 标题一\n\n- 列表项 1\n- 列表项 2\n\n`code snippet`";
    const html = renderMarkdownToHtml(md);

    expect(html).toContain("<h1>标题一</h1>");
    expect(html).toContain("<li>列表项 1</li>");
    expect(html).toContain("<code>code snippet</code>");
  });

  it("calculates words and stats accurately", () => {
    const md = "# Tool-Ore 在线工具集合\n\n这是一个高效实用的纯前端本地计算工具箱。";
    const stats = calculateMarkdownStats(md);

    expect(stats.lines).toBe(3);
    expect(stats.characters).toBeGreaterThan(20);
    expect(stats.words).toBeGreaterThan(10);
    expect(stats.readingTimeMinutes).toBe(1);
  });

  it("generates standalone HTML document wrapper", () => {
    const doc = generateFullHtmlDocument("测试文档", "<p>Hello World</p>");
    expect(doc).toContain("<!DOCTYPE html>");
    expect(doc).toContain("<title>测试文档</title>");
    expect(doc).toContain("<p>Hello World</p>");
  });
});
