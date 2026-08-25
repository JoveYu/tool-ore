export interface PlaceholderOptions {
  width: number;
  height: number;
  bgColor: string;
  textColor: string;
  customText: string;
  fontSize: number;
  showDiagonalLines: boolean;
  showBorder: boolean;
  format: "image/png" | "image/jpeg" | "image/webp" | "image/svg+xml";
}

export const PLACEHOLDER_SIZE_PRESETS = [
  { name: "800 × 600 (标准 4:3)", width: 800, height: 600 },
  { name: "1920 × 1080 (1080P 高清)", width: 1920, height: 1080 },
  { name: "1200 × 630 (社交分享封面)", width: 1200, height: 630 },
  { name: "400 × 400 (正方形头像)", width: 400, height: 400 },
  { name: "1080 × 1920 (手机全屏竖屏)", width: 1080, height: 1920 },
  { name: "300 × 250 (中等矩形卡片)", width: 300, height: 250 },
  { name: "728 × 90 (横幅通栏)", width: 728, height: 90 },
];

/**
 * 本地 Canvas 绘制生成占位图 Blob
 */
export async function renderPlaceholderToBlob(options: PlaceholderOptions): Promise<Blob> {
  const { width, height, bgColor, textColor, customText, fontSize, showDiagonalLines, showBorder, format } =
    options;

  if (format === "image/svg+xml") {
    const textStr = customText.trim() || `${width} × ${height}`;
    const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  ${showBorder ? `<rect x="2" y="2" width="${width - 4}" height="${height - 4}" fill="none" stroke="${textColor}" stroke-width="2" opacity="0.3"/>` : ""}
  ${showDiagonalLines ? `<line x1="0" y1="0" x2="${width}" y2="${height}" stroke="${textColor}" stroke-width="1.5" opacity="0.2"/><line x1="${width}" y1="0" x2="0" y2="${height}" stroke="${textColor}" stroke-width="1.5" opacity="0.2"/>` : ""}
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="${fontSize}px" fill="${textColor}">${textStr}</text>
</svg>`;
    return new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法初始化 Canvas 上下文");

  // 1. 填充背景
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // 2. 对角线
  if (showDiagonalLines) {
    ctx.strokeStyle = textColor;
    ctx.lineWidth = Math.max(1, Math.min(width, height) / 400);
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, height);
    ctx.moveTo(width, 0);
    ctx.lineTo(0, height);
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }

  // 3. 边框
  if (showBorder) {
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.3;
    ctx.strokeRect(2, 2, width - 4, height - 4);
    ctx.globalAlpha = 1.0;
  }

  // 4. 文字
  const textStr = customText.trim() || `${width} × ${height}`;
  ctx.fillStyle = textColor;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(textStr, width / 2, height / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("占位图生成失败"))),
      format,
      0.92
    );
  });
}
