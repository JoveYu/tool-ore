/**
 * 将阿拉伯数字金额转换为人民币大写汉字
 * 遵循《正确填写票据和结算凭证的基本规定》
 */
export function convertToChineseCurrency(amountInput: string | number): {
  result: string;
  error?: string;
  formattedAmount?: string;
} {
  if (amountInput === "" || amountInput === null || amountInput === undefined) {
    return { result: "" };
  }

  const rawStr = String(amountInput).trim().replace(/,/g, "");

  if (!rawStr) {
    return { result: "" };
  }

  // 校验合法数字
  if (!/^-?\d*(\.\d*)?$/.test(rawStr) || rawStr === "-" || rawStr === ".") {
    return { result: "", error: "请输入有效的数字金额" };
  }

  const isNegative = rawStr.startsWith("-");
  const cleanStr = isNegative ? rawStr.slice(1) : rawStr;

  const parts = cleanStr.split(".");
  let integerPart = parts[0].replace(/^0+/, "") || "0";
  const decimalPart = parts[1] || "";

  if (integerPart.length > 15) {
    return { result: "", error: "金额过大，最大支持千兆以内金额" };
  }

  const digits = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
  const units = ["", "拾", "佰", "仟"];
  const bigUnits = ["", "万", "亿", "兆"];

  let chineseStr = "";

  // 1. 处理整数部分
  if (integerPart === "0" && (!decimalPart || /^0+$/.test(decimalPart))) {
    return {
      result: "零元整",
      formattedAmount: "¥0.00",
    };
  }

  if (integerPart !== "0") {
    let zeroCount = 0;
    const len = integerPart.length;

    for (let i = 0; i < len; i++) {
      const num = parseInt(integerPart[i], 10);
      const pos = len - i - 1; // 距离个位的偏移
      const unitIndex = pos % 4; // 拾、佰、仟
      const bigUnitIndex = Math.floor(pos / 4); // 万、亿、兆

      if (num === 0) {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          chineseStr += digits[0];
          zeroCount = 0;
        }
        chineseStr += digits[num] + units[unitIndex];
      }

      // 当到达4位一组的分界（万、亿、兆）或整数末尾时
      if (unitIndex === 0 && bigUnitIndex > 0) {
        // 如果这4位不全是0，或者正好是亿位（避免亿和万连着处理时丢掉单位）
        const chunk = integerPart.slice(Math.max(0, i - 3), i + 1);
        if (chunk !== "0000" || bigUnitIndex % 2 === 0) {
          chineseStr += bigUnits[bigUnitIndex];
        }
        zeroCount = 0;
      }
    }

    chineseStr += "元";
  }

  // 2. 处理小数部分 (角、分、厘、毫)
  const decimalUnits = ["角", "分", "厘", "毫"];
  let decimalStr = "";
  const dLen = Math.min(decimalPart.length, 4);

  if (dLen === 0 || /^0+$/.test(decimalPart)) {
    if (integerPart !== "0") {
      chineseStr += "整";
    }
  } else {
    let hasLeadingZero = false;
    for (let i = 0; i < dLen; i++) {
      const num = parseInt(decimalPart[i], 10);
      if (num !== 0) {
        if (hasLeadingZero) {
          decimalStr += "零";
          hasLeadingZero = false;
        }
        decimalStr += digits[num] + decimalUnits[i];
      } else {
        if (integerPart !== "0" && i === 0) {
          hasLeadingZero = true;
        }
      }
    }
  }

  let finalResult = (isNegative ? "负" : "") + (chineseStr + decimalStr);
  if (!finalResult) {
    finalResult = "零元整";
  }

  // 格式化标准千分位展示
  const numVal = parseFloat(rawStr);
  const formattedAmount = isNaN(numVal)
    ? undefined
    : `¥ ${numVal.toLocaleString("zh-CN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      })}`;

  return {
    result: finalResult,
    formattedAmount,
  };
}
