export interface SvgPathTransformOptions {
  translateX: number;
  translateY: number;
  scaleX: number;
  scaleY: number;
  flipH: boolean;
  flipV: boolean;
  precision: number;
  toAbsolute: boolean;
}

export interface PathBBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * 粗略解析提取 Path 中的所有坐标点并计算边界包围盒 BBox
 */
export function calculatePathBBox(d: string): PathBBox {
  const numbers = d.match(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g);
  if (!numbers || numbers.length < 2) {
    return { minX: 0, minY: 0, maxX: 100, maxY: 100, width: 100, height: 100 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < numbers.length - 1; i += 2) {
    const x = parseFloat(numbers[i]);
    const y = parseFloat(numbers[i + 1]);
    if (!isNaN(x) && !isNaN(y)) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  if (minX === Infinity) {
    return { minX: 0, minY: 0, maxX: 100, maxY: 100, width: 100, height: 100 };
  }

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);

  return { minX, minY, maxX, maxY, width, height };
}

/**
 * 对 SVG 路径 d 字符串执行几何变换
 */
export function transformSvgPath(
  d: string,
  options: SvgPathTransformOptions
): { isValid: boolean; transformedPath: string; bbox: PathBBox; error?: string } {
  const clean = d.trim();
  if (!clean) {
    return {
      isValid: true,
      transformedPath: "",
      bbox: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 },
    };
  }

  try {
    const initialBBox = calculatePathBBox(clean);
    const centerX = initialBBox.minX + initialBBox.width / 2;
    const centerY = initialBBox.minY + initialBBox.height / 2;

    const roundNum = (n: number) => {
      const p = options.precision;
      if (p < 0) return n.toString();
      return Number(n.toFixed(p)).toString();
    };

    // 词法拆分命令与参数
    const commandRegex = /([a-df-z])|([-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?)/gi;
    let match: RegExpExecArray | null;

    let result = "";
    let currentCommand = "";
    let coordIndex = 0; // 0 为 X, 1 为 Y

    while ((match = commandRegex.exec(clean)) !== null) {
      const token = match[0];

      if (/^[a-df-z]$/i.test(token)) {
        currentCommand = token;
        coordIndex = 0;
        result += ` ${token}`;
      } else {
        const val = parseFloat(token);
        if (isNaN(val)) {
          result += ` ${token}`;
          continue;
        }

        let transformed = val;
        const isUpper = currentCommand === currentCommand.toUpperCase();

        if (isUpper || currentCommand.toUpperCase() === "H" || currentCommand.toUpperCase() === "V") {
          // 绝对坐标变换
          if (coordIndex % 2 === 0) {
            // X 轴
            if (options.flipH) {
              transformed = centerX - (transformed - centerX);
            }
            transformed = (transformed - centerX) * options.scaleX + centerX + options.translateX;
          } else {
            // Y 轴
            if (options.flipV) {
              transformed = centerY - (transformed - centerY);
            }
            transformed = (transformed - centerY) * options.scaleY + centerY + options.translateY;
          }
        } else {
          // 相对坐标变换
          if (coordIndex % 2 === 0) {
            transformed = (options.flipH ? -transformed : transformed) * options.scaleX;
          } else {
            transformed = (options.flipV ? -transformed : transformed) * options.scaleY;
          }
        }

        result += ` ${roundNum(transformed)}`;
        coordIndex++;
      }
    }

    const finalPath = result.replace(/\s+/g, " ").trim();
    const newBBox = calculatePathBBox(finalPath);

    return {
      isValid: true,
      transformedPath: finalPath,
      bbox: newBBox,
    };
  } catch (err: any) {
    return {
      isValid: false,
      transformedPath: clean,
      bbox: { minX: 0, minY: 0, maxX: 100, maxY: 100, width: 100, height: 100 },
      error: `路径变换失败: ${err?.message || "格式有误"}`,
    };
  }
}
