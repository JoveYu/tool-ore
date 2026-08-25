export interface RailroadNode {
  type: "literal" | "charset" | "any" | "anchor" | "group" | "choice" | "repeat";
  label: string;
  subNodes?: RailroadNode[];
  quantifier?: string;
  isOptional?: boolean;
}

/**
 * 轻量递归解析正则表达式为铁路图 AST 节点树
 */
export function parseRegexToRailroadAst(pattern: string): RailroadNode {
  const clean = pattern.trim();
  if (!clean) {
    return { type: "literal", label: "(空)" };
  }

  // 顶层 Choice 并联分支检测 (未被括号包裹的 |)
  const choices: string[] = [];
  let depth = 0;
  let inCharClass = false;
  let lastIdx = 0;

  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (c === "\\") {
      i++;
      continue;
    }
    if (c === "[" && !inCharClass) inCharClass = true;
    else if (c === "]" && inCharClass) inCharClass = false;
    else if (c === "(" && !inCharClass) depth++;
    else if (c === ")" && !inCharClass) depth = Math.max(0, depth - 1);
    else if (c === "|" && depth === 0 && !inCharClass) {
      choices.push(clean.slice(lastIdx, i));
      lastIdx = i + 1;
    }
  }
  choices.push(clean.slice(lastIdx));

  if (choices.length > 1) {
    return {
      type: "choice",
      label: "分支选择",
      subNodes: choices.map((choice) => parseRegexToRailroadAst(choice)),
    };
  }

  // 串联序列节点解析
  const sequence: RailroadNode[] = [];
  let i = 0;

  while (i < clean.length) {
    const char = clean[i];

    if (char === "\\") {
      // 转义字符
      if (i + 1 < clean.length) {
        const next = clean[i + 1];
        let label = `\\${next}`;
        if (next === "d") label = "数字 (0-9)";
        else if (next === "w") label = "单字字符 (a-z, 0-9, _)";
        else if (next === "s") label = "空白字符 (空格/Tab/换行)";
        else if (next === "D") label = "非数字字符";
        else if (next === "W") label = "非单字字符";
        else if (next === "S") label = "非空白字符";
        else if (next === "b") label = "单词边界 (\\b)";

        let node: RailroadNode = { type: "charset", label };
        i += 2;

        // 检查后置量词 (*, +, ?, {n,m})
        const quant = extractQuantifier(clean, i);
        if (quant) {
          node.quantifier = quant.text;
          node.isOptional = quant.isOptional;
          i = quant.nextIndex;
        }
        sequence.push(node);
        continue;
      }
    }

    if (char === ".") {
      let node: RailroadNode = { type: "any", label: "任意字符 (除了换行)" };
      i++;
      const quant = extractQuantifier(clean, i);
      if (quant) {
        node.quantifier = quant.text;
        node.isOptional = quant.isOptional;
        i = quant.nextIndex;
      }
      sequence.push(node);
      continue;
    }

    if (char === "^") {
      sequence.push({ type: "anchor", label: "行首 (^)" });
      i++;
      continue;
    }

    if (char === "$") {
      sequence.push({ type: "anchor", label: "行尾 ($)" });
      i++;
      continue;
    }

    if (char === "[") {
      // 字符集 [a-z0-9]
      const closeIdx = clean.indexOf("]", i);
      if (closeIdx > -1) {
        const charSetContent = clean.slice(i + 1, closeIdx);
        const isNegated = charSetContent.startsWith("^");
        const displayLabel = isNegated
          ? `除 [${charSetContent.slice(1)}] 外的任意字符`
          : `[${charSetContent}] 字符之一`;

        let node: RailroadNode = { type: "charset", label: displayLabel };
        i = closeIdx + 1;

        const quant = extractQuantifier(clean, i);
        if (quant) {
          node.quantifier = quant.text;
          node.isOptional = quant.isOptional;
          i = quant.nextIndex;
        }
        sequence.push(node);
        continue;
      }
    }

    if (char === "(") {
      // 括号组
      let groupDepth = 1;
      let groupEnd = -1;
      for (let g = i + 1; g < clean.length; g++) {
        if (clean[g] === "\\" && g + 1 < clean.length) {
          g++;
          continue;
        }
        if (clean[g] === "(") groupDepth++;
        else if (clean[g] === ")") {
          groupDepth--;
          if (groupDepth === 0) {
            groupEnd = g;
            break;
          }
        }
      }

      if (groupEnd > -1) {
        const groupContent = clean.slice(i + 1, groupEnd);
        const isNonCapturing = groupContent.startsWith("?:");
        const parsedSub = parseRegexToRailroadAst(
          isNonCapturing ? groupContent.slice(2) : groupContent
        );

        let node: RailroadNode = {
          type: "group",
          label: isNonCapturing ? "非捕获组" : "捕获组",
          subNodes: [parsedSub],
        };
        i = groupEnd + 1;

        const quant = extractQuantifier(clean, i);
        if (quant) {
          node.quantifier = quant.text;
          node.isOptional = quant.isOptional;
          i = quant.nextIndex;
        }
        sequence.push(node);
        continue;
      }
    }

    // 普通字面量字符 (合并连续字面量)
    let literalChars = char;
    i++;
    while (i < clean.length && !/[\\.^$\[\]()|*+?{]/.test(clean[i])) {
      literalChars += clean[i];
      i++;
    }

    // 检查后置量词
    const quant = extractQuantifier(clean, i);
    let node: RailroadNode;
    if (quant) {
      // 量词仅作用于最后一个字符
      if (literalChars.length > 1) {
        sequence.push({
          type: "literal",
          label: `"${literalChars.slice(0, -1)}"`,
        });
        node = {
          type: "literal",
          label: `"${literalChars.slice(-1)}"`,
          quantifier: quant.text,
          isOptional: quant.isOptional,
        };
      } else {
        node = {
          type: "literal",
          label: `"${literalChars}"`,
          quantifier: quant.text,
          isOptional: quant.isOptional,
        };
      }
      i = quant.nextIndex;
    } else {
      node = {
        type: "literal",
        label: `"${literalChars}"`,
      };
    }

    sequence.push(node);
  }

  return {
    type: "group",
    label: "序列",
    subNodes: sequence,
  };
}

function extractQuantifier(
  str: string,
  startIndex: number
): { text: string; isOptional: boolean; nextIndex: number } | null {
  if (startIndex >= str.length) return null;
  const c = str[startIndex];

  if (c === "*") {
    return { text: "0 次或多次 (*)", isOptional: true, nextIndex: startIndex + 1 };
  }
  if (c === "+") {
    return { text: "至少 1 次 (+)", isOptional: false, nextIndex: startIndex + 1 };
  }
  if (c === "?") {
    return { text: "可选 0 或 1 次 (?)", isOptional: true, nextIndex: startIndex + 1 };
  }
  if (c === "{") {
    const end = str.indexOf("}", startIndex);
    if (end > -1) {
      const qStr = str.slice(startIndex, end + 1);
      return { text: `重复 ${qStr}`, isOptional: qStr.includes("0,"), nextIndex: end + 1 };
    }
  }

  return null;
}
