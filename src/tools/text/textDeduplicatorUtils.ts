export type SortOption =
  | "none"
  | "asc"
  | "desc"
  | "num_asc"
  | "num_desc"
  | "length_asc"
  | "length_desc"
  | "shuffle";

export type CaseOption =
  | "none"
  | "uppercase"
  | "lowercase"
  | "title_case"
  | "camel_case"
  | "snake_case"
  | "kebab_case"
  | "pascal_case";

export interface CleanOptions {
  deduplicate: boolean;
  caseSensitive: boolean;
  trimWhitespace: boolean;
  removeEmptyLines: boolean;
  removeHtmlTags: boolean;
  prefix: string;
  suffix: string;
  addLineNumbers: boolean;
  sort: SortOption;
  caseTransform: CaseOption;
}

export interface CleanResult {
  output: string;
  originalLinesCount: number;
  resultLinesCount: number;
  removedDuplicatesCount: number;
  emptyLinesRemovedCount: number;
}

/**
 * 驼峰 / 下划线 / 烤串等命名风格转换
 */
export function transformCase(str: string, targetCase: CaseOption): string {
  if (targetCase === "none" || !str.trim()) return str;

  if (targetCase === "uppercase") return str.toUpperCase();
  if (targetCase === "lowercase") return str.toLowerCase();

  // 分词逻辑 (支持中英文、下划线、短横线、驼峰)
  const words = str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_\-.]+/g, " ")
    .trim()
    .split(/\s+/);

  if (words.length === 0) return str;

  switch (targetCase) {
    case "title_case":
      return words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

    case "camel_case":
      return words
        .map((w, idx) =>
          idx === 0
            ? w.toLowerCase()
            : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        )
        .join("");

    case "pascal_case":
      return words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join("");

    case "snake_case":
      return words.map((w) => w.toLowerCase()).join("_");

    case "kebab_case":
      return words.map((w) => w.toLowerCase()).join("-");

    default:
      return str;
  }
}

/**
 * 文本清洗与去重主函数
 */
export function cleanAndDeduplicateText(
  text: string,
  options: CleanOptions
): CleanResult {
  if (!text) {
    return {
      output: "",
      originalLinesCount: 0,
      resultLinesCount: 0,
      removedDuplicatesCount: 0,
      emptyLinesRemovedCount: 0,
    };
  }

  const rawLines = text.split("\n");
  const originalLinesCount = rawLines.length;
  let lines = [...rawLines];

  let emptyLinesRemovedCount = 0;

  // 1. 去除首尾空白与空白行
  if (options.trimWhitespace) {
    lines = lines.map((l) => l.trim());
  }

  if (options.removeHtmlTags) {
    lines = lines.map((l) => l.replace(/<[^>]*>/g, ""));
  }

  if (options.removeEmptyLines) {
    const prevCount = lines.length;
    lines = lines.filter((l) => l.trim().length > 0);
    emptyLinesRemovedCount = prevCount - lines.length;
  }

  // 2. 去重
  let removedDuplicatesCount = 0;
  if (options.deduplicate) {
    const seen = new Set<string>();
    const uniqueLines: string[] = [];

    for (const line of lines) {
      const key = options.caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueLines.push(line);
      } else {
        removedDuplicatesCount++;
      }
    }

    lines = uniqueLines;
  }

  // 3. 排序
  if (options.sort !== "none") {
    if (options.sort === "asc") {
      lines.sort((a, b) => a.localeCompare(b, "zh-CN"));
    } else if (options.sort === "desc") {
      lines.sort((a, b) => b.localeCompare(a, "zh-CN"));
    } else if (options.sort === "num_asc") {
      lines.sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0));
    } else if (options.sort === "num_desc") {
      lines.sort((a, b) => (parseFloat(b) || 0) - (parseFloat(a) || 0));
    } else if (options.sort === "length_asc") {
      lines.sort((a, b) => a.length - b.length);
    } else if (options.sort === "length_desc") {
      lines.sort((a, b) => b.length - a.length);
    } else if (options.sort === "shuffle") {
      for (let i = lines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lines[i], lines[j]] = [lines[j], lines[i]];
      }
    }
  }

  // 4. 大小写 / 风格转换
  if (options.caseTransform !== "none") {
    lines = lines.map((l) => transformCase(l, options.caseTransform));
  }

  // 5. 前后缀与行号包装
  if (options.prefix || options.suffix || options.addLineNumbers) {
    lines = lines.map((line, idx) => {
      let resultLine = line;
      if (options.prefix) resultLine = `${options.prefix}${resultLine}`;
      if (options.suffix) resultLine = `${resultLine}${options.suffix}`;
      if (options.addLineNumbers) {
        const pad = String(idx + 1).padStart(String(lines.length).length, "0");
        resultLine = `${pad}. ${resultLine}`;
      }
      return resultLine;
    });
  }

  return {
    output: lines.join("\n"),
    originalLinesCount,
    resultLinesCount: lines.length,
    removedDuplicatesCount,
    emptyLinesRemovedCount,
  };
}
