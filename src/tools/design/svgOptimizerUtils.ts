export interface SvgOptimizeOptions {
  removeXmlDeclaration: boolean;
  removeDoctype: boolean;
  removeComments: boolean;
  removeMetadata: boolean;
  removeEditorNamespaces: boolean;
  removeEmptyContainers: boolean;
  reducePrecision: boolean;
  precision: number;
  minifyWhitespace: boolean;
}

export interface SvgOptimizeResult {
  isValid: boolean;
  error?: string;
  optimizedSvg: string;
  originalSize: number;
  optimizedSize: number;
  savedBytes: number;
  reductionPercentage: number;
  dataUriUtf8: string;
  dataUriBase64: string;
  reactComponentCode: string;
}

export const DEFAULT_SVG_OPTIONS: SvgOptimizeOptions = {
  removeXmlDeclaration: true,
  removeDoctype: true,
  removeComments: true,
  removeMetadata: true,
  removeEditorNamespaces: true,
  removeEmptyContainers: true,
  reducePrecision: true,
  precision: 2,
  minifyWhitespace: true,
};

/**
 * 转换 SVG 属性名至 React JSX 驼峰格式
 */
function svgToJsxAttributes(svgStr: string): string {
  const jsxAttrMap: Record<string, string> = {
    "stroke-width": "strokeWidth",
    "stroke-linecap": "strokeLinecap",
    "stroke-linejoin": "strokeLinejoin",
    "stroke-miterlimit": "strokeMiterlimit",
    "stroke-dasharray": "strokeDasharray",
    "stroke-dashoffset": "strokeDashoffset",
    "stroke-opacity": "strokeOpacity",
    "fill-rule": "fillRule",
    "fill-opacity": "fillOpacity",
    "clip-rule": "clipRule",
    "clip-path": "clipPath",
    "stop-color": "stopColor",
    "stop-opacity": "stopOpacity",
    "font-family": "fontFamily",
    "font-size": "fontSize",
    "font-weight": "fontWeight",
    "text-anchor": "textAnchor",
    "xlink:href": "xlinkHref",
    "xmlns:xlink": "xmlnsXlink",
    class: "className",
  };

  let result = svgStr;
  for (const [attr, jsxAttr] of Object.entries(jsxAttrMap)) {
    const reg = new RegExp(`\\b${attr}=`, "g");
    result = result.replace(reg, `${jsxAttr}=`);
  }
  return result;
}

/**
 * 纯前端 SVG 清洗与体积压缩算法
 */
export function optimizeSvg(
  svgString: string,
  options: SvgOptimizeOptions = DEFAULT_SVG_OPTIONS
): SvgOptimizeResult {
  const clean = svgString.trim();
  if (!clean) {
    return {
      isValid: false,
      error: "请输入或上传 SVG 代码",
      optimizedSvg: "",
      originalSize: 0,
      optimizedSize: 0,
      savedBytes: 0,
      reductionPercentage: 0,
      dataUriUtf8: "",
      dataUriBase64: "",
      reactComponentCode: "",
    };
  }

  // 校验是否为合法 SVG
  if (!clean.includes("<svg") || !clean.includes("</svg>")) {
    return {
      isValid: false,
      error: "输入内容未包含有效的 <svg> 根节点",
      optimizedSvg: "",
      originalSize: clean.length,
      optimizedSize: 0,
      savedBytes: 0,
      reductionPercentage: 0,
      dataUriUtf8: "",
      dataUriBase64: "",
      reactComponentCode: "",
    };
  }

  const originalSize = new Blob([clean]).size;
  let optimized = clean;

  // 1. 移除 XML 声明
  if (options.removeXmlDeclaration) {
    optimized = optimized.replace(/<\?xml[\s\S]*?\?>/gi, "");
  }

  // 2. 移除 DOCTYPE 声明
  if (options.removeDoctype) {
    optimized = optimized.replace(/<!DOCTYPE[\s\S]*?>/gi, "");
  }

  // 3. 移除 HTML/XML 注释
  if (options.removeComments) {
    optimized = optimized.replace(/<!--[\s\S]*?-->/g, "");
  }

  // 4. 移除元数据标签 (<metadata>, <title>, <desc>, <sodipodi:namedview>, etc.)
  if (options.removeMetadata) {
    optimized = optimized.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");
    optimized = optimized.replace(/<sodipodi:namedview[\s\S]*?\/>/gi, "");
    optimized = optimized.replace(/<sodipodi:namedview[\s\S]*?<\/sodipodi:namedview>/gi, "");
  }

  // 5. 移除编辑器专属属性与命名空间 (Inkscape, Sketch, Illustrator)
  if (options.removeEditorNamespaces) {
    optimized = optimized.replace(
      /\s*(?:xmlns:inkscape|xmlns:sodipodi|xmlns:sketch|xmlns:i|xmlns:graphical|inkscape:[a-z\-]+|sodipodi:[a-z\-]+|sketch:[a-z\-]+|i:[a-z\-]+)="[^"]*"/gi,
      ""
    );
    optimized = optimized.replace(/\s*version="1\.[01]"/gi, "");
    optimized = optimized.replace(/\s*xml:space="preserve"/gi, "");
  }

  // 6. 移除空容器标签
  if (options.removeEmptyContainers) {
    optimized = optimized.replace(/<g[^>]*>\s*<\/g>/gi, "");
    optimized = optimized.replace(/<defs[^>]*>\s*<\/defs>/gi, "");
  }

  // 7. 降低浮点坐标精度
  if (options.reducePrecision && options.precision >= 0) {
    const prec = options.precision;
    // 匹配路径和属性中的小数
    optimized = optimized.replace(/(\d+\.\d{3,})/g, (_, numStr) => {
      const num = parseFloat(numStr);
      return Number(num.toFixed(prec)).toString();
    });
  }

  // 8. 压缩多余空白
  if (options.minifyWhitespace) {
    optimized = optimized
      .replace(/>\s+</g, "><")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  const optimizedSize = new Blob([optimized]).size;
  const savedBytes = Math.max(0, originalSize - optimizedSize);
  const reductionPercentage =
    originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

  // 生成 DataURI
  const encodedSvg = encodeURIComponent(optimized)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  const dataUriUtf8 = `data:image/svg+xml;utf8,${encodedSvg}`;

  let dataUriBase64 = "";
  try {
    const bytes = new TextEncoder().encode(optimized);
    let bin = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      bin += String.fromCharCode(bytes[i]);
    }
    dataUriBase64 = `data:image/svg+xml;base64,${btoa(bin)}`;
  } catch {
    dataUriBase64 = dataUriUtf8;
  }

  // 生成 React Component 代码
  const jsxSvg = svgToJsxAttributes(optimized);
  const reactComponentCode = `import React from "react";\n\nexport function SvgIcon(props: React.SVGProps<SVGSVGElement>) {\n  return (\n    ${jsxSvg.replace(/<svg\b/, "<svg {...props}")}\n  );\n}\n\nexport default SvgIcon;`;

  return {
    isValid: true,
    optimizedSvg: optimized,
    originalSize,
    optimizedSize,
    savedBytes,
    reductionPercentage,
    dataUriUtf8,
    dataUriBase64,
    reactComponentCode,
  };
}
