import * as Diff from "diff";

export interface DiffOptions {
  diffMode: "lines" | "words" | "chars";
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
}

export interface DiffChange {
  value: string;
  added?: boolean;
  removed?: boolean;
  count?: number;
}

export interface DiffSummary {
  addedCount: number;
  removedCount: number;
  unchangedCount: number;
  changes: DiffChange[];
}

export function computeDiff(
  oldText: string,
  newText: string,
  options: DiffOptions
): DiffSummary {
  let changes: DiffChange[] = [];

  const diffOpts = {
    ignoreCase: options.ignoreCase,
    ignoreWhitespace: options.ignoreWhitespace,
  };

  if (options.diffMode === "lines") {
    changes = Diff.diffLines(oldText, newText, diffOpts);
  } else if (options.diffMode === "words") {
    changes = Diff.diffWords(oldText, newText, diffOpts);
  } else {
    changes = Diff.diffChars(oldText, newText, diffOpts);
  }

  let addedCount = 0;
  let removedCount = 0;
  let unchangedCount = 0;

  for (const c of changes) {
    if (c.added) {
      addedCount += c.count || 1;
    } else if (c.removed) {
      removedCount += c.count || 1;
    } else {
      unchangedCount += c.count || 1;
    }
  }

  return {
    addedCount,
    removedCount,
    unchangedCount,
    changes,
  };
}

export interface SideBySideChunk {
  type: "normal" | "added" | "removed";
  text: string;
}

export interface SideBySideLine {
  oldLineNumber?: number;
  oldChunks?: SideBySideChunk[];
  oldType?: "removed" | "empty" | "normal" | "modified";
  newLineNumber?: number;
  newChunks?: SideBySideChunk[];
  newType?: "added" | "empty" | "normal" | "modified";
}

/**
 * 将整行文本内部进行词/字符级 Diff 并包装成细粒度 Chunks
 */
function computeInlineChunks(
  oldLine: string,
  newLine: string,
  granularity: "lines" | "words" | "chars",
  ignoreCase?: boolean,
  ignoreWhitespace?: boolean
): { oldChunks: SideBySideChunk[]; newChunks: SideBySideChunk[] } {
  if (granularity === "lines") {
    return {
      oldChunks: [{ type: "removed", text: oldLine }],
      newChunks: [{ type: "added", text: newLine }],
    };
  }

  const diffOpts = { ignoreCase, ignoreWhitespace };
  const diffFn =
    granularity === "words" ? Diff.diffWords : Diff.diffChars;
  const changes = diffFn(oldLine, newLine, diffOpts);

  const oldChunks: SideBySideChunk[] = [];
  const newChunks: SideBySideChunk[] = [];

  for (const part of changes) {
    if (part.added) {
      newChunks.push({ type: "added", text: part.value });
    } else if (part.removed) {
      oldChunks.push({ type: "removed", text: part.value });
    } else {
      oldChunks.push({ type: "normal", text: part.value });
      newChunks.push({ type: "normal", text: part.value });
    }
  }

  return { oldChunks, newChunks };
}

export function computeSideBySideLines(
  oldText: string,
  newText: string,
  options?: {
    diffMode?: "lines" | "words" | "chars";
    ignoreCase?: boolean;
    ignoreWhitespace?: boolean;
  }
): SideBySideLine[] {
  const granularity = options?.diffMode || "lines";
  const diffOpts = {
    ignoreCase: options?.ignoreCase,
  };

  const lineChanges = Diff.diffLines(oldText, newText, diffOpts);

  const lines: SideBySideLine[] = [];
  let oldLineNum = 1;
  let newLineNum = 1;

  for (let i = 0; i < lineChanges.length; i++) {
    const current = lineChanges[i];
    const next = lineChanges[i + 1];

    if (current.removed && next && next.added) {
      // 一对修改块 (行替换)
      const oldSubLines = current.value.replace(/\n$/, "").split("\n");
      const newSubLines = next.value.replace(/\n$/, "").split("\n");
      const maxLen = Math.max(oldSubLines.length, newSubLines.length);

      for (let j = 0; j < maxLen; j++) {
        const oldLine = oldSubLines[j];
        const newLine = newSubLines[j];

        if (oldLine !== undefined && newLine !== undefined) {
          // 双侧均有修改行，计算行内高亮 (Word/Char-level inline highlight)
          const { oldChunks, newChunks } = computeInlineChunks(
            oldLine,
            newLine,
            granularity,
            options?.ignoreCase,
            options?.ignoreWhitespace
          );

          lines.push({
            oldLineNumber: oldLineNum++,
            oldChunks,
            oldType: "modified",
            newLineNumber: newLineNum++,
            newChunks,
            newType: "modified",
          });
        } else if (oldLine !== undefined) {
          lines.push({
            oldLineNumber: oldLineNum++,
            oldChunks: [{ type: "removed", text: oldLine }],
            oldType: "removed",
            newLineNumber: undefined,
            newChunks: undefined,
            newType: "empty",
          });
        } else if (newLine !== undefined) {
          lines.push({
            oldLineNumber: undefined,
            oldChunks: undefined,
            oldType: "empty",
            newLineNumber: newLineNum++,
            newChunks: [{ type: "added", text: newLine }],
            newType: "added",
          });
        }
      }
      i++; // 跳过已配对处理的 next
    } else if (current.removed) {
      const subLines = current.value.replace(/\n$/, "").split("\n");
      for (const line of subLines) {
        lines.push({
          oldLineNumber: oldLineNum++,
          oldChunks: [{ type: "removed", text: line }],
          oldType: "removed",
          newLineNumber: undefined,
          newChunks: undefined,
          newType: "empty",
        });
      }
    } else if (current.added) {
      const subLines = current.value.replace(/\n$/, "").split("\n");
      for (const line of subLines) {
        lines.push({
          oldLineNumber: undefined,
          oldChunks: undefined,
          oldType: "empty",
          newLineNumber: newLineNum++,
          newChunks: [{ type: "added", text: line }],
          newType: "added",
        });
      }
    } else {
      const subLines = current.value.replace(/\n$/, "").split("\n");
      for (const line of subLines) {
        lines.push({
          oldLineNumber: oldLineNum++,
          oldChunks: [{ type: "normal", text: line }],
          oldType: "normal",
          newLineNumber: newLineNum++,
          newChunks: [{ type: "normal", text: line }],
          newType: "normal",
        });
      }
    }
  }

  return lines;
}
