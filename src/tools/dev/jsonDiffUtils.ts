export type DiffType = "added" | "removed" | "changed" | "unchanged";

export interface JsonDiffEntry {
  path: string; // e.g. "user.profile.age" 或 "items[2].id"
  type: DiffType;
  oldValue?: any;
  newValue?: any;
  oldType?: string;
  newType?: string;
}

export interface JsonDiffSummary {
  addedCount: number;
  removedCount: number;
  changedCount: number;
  totalDiffs: number;
  isIdentical: boolean;
}

export interface JsonDiffResult {
  isValid: boolean;
  error?: string;
  summary: JsonDiffSummary;
  diffs: JsonDiffEntry[];
  formattedLeft: string;
  formattedRight: string;
}

export interface JsonDiffOptions {
  ignoreKeyOrder: boolean;
  ignoreArrayOrder?: boolean;
}

export const SAMPLE_JSON_LEFT = `{
  "id": "1001",
  "name": "张伟",
  "status": "active",
  "age": 28,
  "department": "技术研发部",
  "roles": ["developer", "admin"],
  "meta": {
    "loginCount": 42,
    "lastLoginIp": "192.168.1.100"
  },
  "deprecatedField": "old_data"
}`;

export const SAMPLE_JSON_RIGHT = `{
  "id": "1001",
  "name": "张伟",
  "status": "pending_approval",
  "age": 29,
  "department": "技术研发部",
  "roles": ["developer", "reviewer", "admin"],
  "meta": {
    "loginCount": 43,
    "lastLoginIp": "192.168.1.105",
    "theme": "dark"
  },
  "email": "zhangwei@example.com"
}`;

function getType(val: any): string {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  return typeof val;
}

/**
 * 递归深度比较两个 JSON 数据并生成扁平差异条目
 */
export function compareJsonRecursive(
  left: any,
  right: any,
  currentPath: string = "",
  options: JsonDiffOptions = { ignoreKeyOrder: true }
): JsonDiffEntry[] {
  const diffs: JsonDiffEntry[] = [];

  const leftType = getType(left);
  const rightType = getType(right);

  // 1. 类型不匹配，直接标记为 changed
  if (leftType !== rightType) {
    diffs.push({
      path: currentPath || "$",
      type: "changed",
      oldValue: left,
      newValue: right,
      oldType: leftType,
      newType: rightType,
    });
    return diffs;
  }

  // 2. 均为对象 Object
  if (leftType === "object") {
    const leftKeys = Object.keys(left || {});
    const rightKeys = Object.keys(right || {});
    const allKeys = Array.from(new Set([...leftKeys, ...rightKeys]));

    if (options.ignoreKeyOrder) {
      allKeys.sort();
    }

    for (const key of allKeys) {
      const nextPath = currentPath ? `${currentPath}.${key}` : key;
      const hasLeft = Object.prototype.hasOwnProperty.call(left, key);
      const hasRight = Object.prototype.hasOwnProperty.call(right, key);

      if (hasLeft && !hasRight) {
        diffs.push({
          path: nextPath,
          type: "removed",
          oldValue: left[key],
          oldType: getType(left[key]),
        });
      } else if (!hasLeft && hasRight) {
        diffs.push({
          path: nextPath,
          type: "added",
          newValue: right[key],
          newType: getType(right[key]),
        });
      } else {
        const subDiffs = compareJsonRecursive(left[key], right[key], nextPath, options);
        diffs.push(...subDiffs);
      }
    }
    return diffs;
  }

  // 3. 均为数组 Array
  if (leftType === "array") {
    const maxLen = Math.max(left.length, right.length);
    for (let i = 0; i < maxLen; i++) {
      const nextPath = `${currentPath}[${i}]`;
      const hasLeft = i < left.length;
      const hasRight = i < right.length;

      if (hasLeft && !hasRight) {
        diffs.push({
          path: nextPath,
          type: "removed",
          oldValue: left[i],
          oldType: getType(left[i]),
        });
      } else if (!hasLeft && hasRight) {
        diffs.push({
          path: nextPath,
          type: "added",
          newValue: right[i],
          newType: getType(right[i]),
        });
      } else {
        const subDiffs = compareJsonRecursive(left[i], right[i], nextPath, options);
        diffs.push(...subDiffs);
      }
    }
    return diffs;
  }

  // 4. 基本类型 Primitive Values (string, number, boolean, null)
  if (left !== right) {
    diffs.push({
      path: currentPath || "$",
      type: "changed",
      oldValue: left,
      newValue: right,
      oldType: leftType,
      newType: rightType,
    });
  }

  return diffs;
}

/**
 * 执行两个 JSON 字符串的结构化语义比对
 */
export function computeJsonDiff(
  leftStr: string,
  rightStr: string,
  options: JsonDiffOptions = { ignoreKeyOrder: true }
): JsonDiffResult {
  if (!leftStr.trim() && !rightStr.trim()) {
    return {
      isValid: true,
      summary: { addedCount: 0, removedCount: 0, changedCount: 0, totalDiffs: 0, isIdentical: true },
      diffs: [],
      formattedLeft: "",
      formattedRight: "",
    };
  }

  let leftObj: any;
  let rightObj: any;

  try {
    leftObj = JSON.parse(leftStr || "{}");
  } catch (err: any) {
    return {
      isValid: false,
      error: `左侧原始 JSON 语法错误: ${err?.message}`,
      summary: { addedCount: 0, removedCount: 0, changedCount: 0, totalDiffs: 0, isIdentical: false },
      diffs: [],
      formattedLeft: leftStr,
      formattedRight: rightStr,
    };
  }

  try {
    rightObj = JSON.parse(rightStr || "{}");
  } catch (err: any) {
    return {
      isValid: false,
      error: `右侧对比 JSON 语法错误: ${err?.message}`,
      summary: { addedCount: 0, removedCount: 0, changedCount: 0, totalDiffs: 0, isIdentical: false },
      diffs: [],
      formattedLeft: leftStr,
      formattedRight: rightStr,
    };
  }

  const diffs = compareJsonRecursive(leftObj, rightObj, "", options);

  const addedCount = diffs.filter((d) => d.type === "added").length;
  const removedCount = diffs.filter((d) => d.type === "removed").length;
  const changedCount = diffs.filter((d) => d.type === "changed").length;
  const totalDiffs = addedCount + removedCount + changedCount;

  return {
    isValid: true,
    summary: {
      addedCount,
      removedCount,
      changedCount,
      totalDiffs,
      isIdentical: totalDiffs === 0,
    },
    diffs,
    formattedLeft: JSON.stringify(leftObj, null, 2),
    formattedRight: JSON.stringify(rightObj, null, 2),
  };
}

/**
 * 格式化输出值用于表格或展示
 */
export function formatValueForDisplay(val: any): string {
  if (val === undefined) return "";
  if (typeof val === "string") return `"${val}"`;
  if (typeof val === "object" && val !== null) {
    return JSON.stringify(val);
  }
  return String(val);
}
