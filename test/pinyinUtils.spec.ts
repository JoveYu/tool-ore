import { describe, it, expect } from "vitest";
import {
  convertToPinyin,
  convertToTraditional,
  convertToSimplified,
} from "../src/tools/text/pinyinUtils";

describe("Pinyin and Simplified/Traditional Converter Utilities", () => {
  it("converts Chinese text to pinyin with symbols", () => {
    const text = "中国在线工具";
    const res = convertToPinyin(text, {
      toneType: "symbol",
      separator: " ",
      uppercase: false,
    });
    expect(res).toBe("zhōng guó zài xiàn gōng jù");
  });

  it("converts Chinese text to first letters and uppercase", () => {
    const text = "你好世界";
    const res = convertToPinyin(text, {
      toneType: "first_letter",
      separator: "",
      uppercase: true,
    });
    expect(res).toBe("NHSJ");
  });

  it("generates ruby HTML format for pinyin annotations", () => {
    const text = "你好";
    const res = convertToPinyin(text, {
      toneType: "ruby_html",
      separator: " ",
      uppercase: false,
    });
    expect(res).toContain("<ruby>你<rt>nǐ</rt></ruby>");
    expect(res).toContain("<ruby>好<rt>hǎo</rt></ruby>");
  });

  it("converts between simplified and traditional Chinese accurately", () => {
    const simp = "中国语言与文字转换开发";
    const trad = convertToTraditional(simp);
    expect(trad).toBe("中國語言與文字轉換開發");

    const backSimp = convertToSimplified(trad);
    expect(backSimp).toBe(simp);
  });
});
