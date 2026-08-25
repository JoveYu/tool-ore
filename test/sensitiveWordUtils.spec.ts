import { describe, it, expect } from "vitest";
import {
  detectSensitiveWords,
  getActiveDictionary,
} from "../src/tools/text/sensitiveWordUtils";

describe("Sensitive Word Filter Utilities", () => {
  it("detects advertising law violations and masks text", () => {
    const text = "本产品是全国第一名，效果绝无仅有，100%包治百病。";
    const res = detectSensitiveWords(text, {
      ad_law: true,
      spam_marketing: false,
      profanity: false,
    });

    expect(res.hasSensitiveWord).toBe(true);
    expect(res.matchedWords).toContain("第一名");
    expect(res.matchedWords).toContain("绝无仅有");
    expect(res.matchedWords).toContain("100%");
    expect(res.filteredText).not.toContain("第一名");
    expect(res.highlightedHtml).toContain("<mark");
  });

  it("detects marketing spam and custom keywords", () => {
    const text = "代开发票，请加微信了解，这是机密内部渠道。";
    const res = detectSensitiveWords(
      text,
      { ad_law: false, spam_marketing: true, profanity: false },
      ["内部渠道"]
    );

    expect(res.hasSensitiveWord).toBe(true);
    expect(res.matchedWords).toContain("代开发票");
    expect(res.matchedWords).toContain("加微信");
    expect(res.matchedWords).toContain("内部渠道");
  });

  it("handles clean texts without matches", () => {
    const text = "Tool-Ore 是一套轻量级纯前端本地在线工具。";
    const res = detectSensitiveWords(text);

    expect(res.hasSensitiveWord).toBe(false);
    expect(res.totalMatches).toBe(0);
    expect(res.matchedWords.length).toBe(0);
  });
});
