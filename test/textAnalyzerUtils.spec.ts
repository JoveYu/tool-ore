import { describe, it, expect } from "vitest";
import {
  analyzeTextStats,
  formatPanguText,
  fullWidthToHalfWidth,
  halfWidthToFullWidthPunctuation,
} from "../src/tools/text/textAnalyzerUtils";

describe("Text Analyzer Utilities", () => {
  it("accurately calculates text statistics", () => {
    const text = "你好 World 123！\n第二行。";
    const stats = analyzeTextStats(text);

    expect(stats.chineseCharacters).toBe(5); // 你、好、第、二、行
    expect(stats.englishWords).toBe(2); // World, 123
    expect(stats.linesCount).toBe(2);
    expect(stats.charactersWithSpaces).toBe(text.length);
    expect(stats.punctuationCount).toBeGreaterThanOrEqual(2);
  });

  it("formats Pangu spacing correctly", () => {
    const raw = "在2026年在线工具箱提供了超多Pure Frontend纯前端工具！";
    const formatted = formatPanguText(raw);

    expect(formatted).toContain("在 2026 年在线工具箱提供了超多 Pure Frontend 纯前端工具！");
  });

  it("converts full-width to half-width characters", () => {
    const full = "Ｈｅｌｌｏ，１２３！";
    const half = fullWidthToHalfWidth(full);
    expect(half).toBe("Hello,123!");
  });

  it("converts half-width punctuation to Chinese full-width", () => {
    const half = "你好,世界.测试!完成?";
    const full = halfWidthToFullWidthPunctuation(half);
    expect(full).toBe("你好，世界。测试！完成？");
  });
});
