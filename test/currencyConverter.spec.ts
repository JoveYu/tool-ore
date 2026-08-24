import { describe, it, expect } from "vitest";
import { convertToChineseCurrency } from "../src/tools/text/currencyConverter";

describe("Currency to Chinese Conversion", () => {
  it("converts simple integers", () => {
    expect(convertToChineseCurrency("100").result).toBe("壹佰元整");
    expect(convertToChineseCurrency("1000").result).toBe("壹仟元整");
    expect(convertToChineseCurrency("10000").result).toBe("壹万元整");
    expect(convertToChineseCurrency("100000000").result).toBe("壹亿元整");
  });

  it("converts numbers with decimals", () => {
    expect(convertToChineseCurrency("1024.50").result).toBe("壹仟零贰拾肆元伍角");
    expect(convertToChineseCurrency("123.45").result).toBe("壹佰贰拾叁元肆角伍分");
    expect(convertToChineseCurrency("0.58").result).toBe("伍角捌分");
    expect(convertToChineseCurrency("0.05").result).toBe("伍分");
  });

  it("handles continuous zeros correctly", () => {
    expect(convertToChineseCurrency("100050.20").result).toBe("壹拾万零伍拾元贰角");
    expect(convertToChineseCurrency("100000001").result).toBe("壹亿零壹元整");
  });

  it("handles zero and negative values", () => {
    expect(convertToChineseCurrency("0").result).toBe("零元整");
    expect(convertToChineseCurrency("-12.5").result).toBe("负壹拾贰元伍角");
  });

  it("validates invalid inputs", () => {
    expect(convertToChineseCurrency("abc").error).toBeDefined();
  });
});
