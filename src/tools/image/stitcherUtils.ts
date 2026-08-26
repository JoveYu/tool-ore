export type StitchDirection = "vertical" | "horizontal" | "grid";

export interface StitchImageItem {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
  size: number;
}

export interface StitchOptions {
  direction: StitchDirection;
  gridCols?: number; // 网格拼图列数 (2, 3, 4)
  gap: number; // 图片间距 (px)
  padding: number; // 画布外边距 (px)
  backgroundColor: string; // 画布背景色 (hex 或 "transparent")
  borderRadius: number; // 单张图片圆角 (px)
  maxWidth?: number; // 竖向拼图统一宽度 (0 表示自适应最大宽)
  outputFormat?: "image/png" | "image/jpeg";
  quality?: number;
}

/**
 * 纯前端 Canvas 执行多图拼接算法
 */
export async function stitchImagesToDataUrl(
  items: StitchImageItem[],
  options: StitchOptions
): Promise<string> {
  if (typeof document === "undefined" || items.length === 0) return "";

  // 1. 预加载所有图片 Image 实例
  const loadedImages = await Promise.all(
    items.map(
      (item) =>
        new Promise<{ img: HTMLImageElement; item: StitchImageItem }>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve({ img, item });
          img.onerror = reject;
          img.src = item.dataUrl;
        })
    )
  );

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "";

  const {
    direction,
    gap = 0,
    padding = 0,
    backgroundColor = "#FFFFFF",
    borderRadius = 0,
    gridCols = 2,
    maxWidth = 0,
  } = options;

  let totalCanvasWidth = 0;
  let totalCanvasHeight = 0;

  // ── A. 垂直长图 (Vertical Stitch) ──
  if (direction === "vertical") {
    const targetWidth = maxWidth > 0 ? maxWidth : Math.max(...items.map((i) => i.width), 300);
    totalCanvasWidth = targetWidth + padding * 2;

    // 计算每张图按宽度缩放后的高度总和
    const scaledHeights = loadedImages.map(({ item }) => {
      const scale = targetWidth / item.width;
      return item.height * scale;
    });

    const sumHeights = scaledHeights.reduce((acc, h) => acc + h, 0);
    const totalGaps = Math.max(0, items.length - 1) * gap;
    totalCanvasHeight = Math.round(sumHeights + totalGaps + padding * 2);

    canvas.width = totalCanvasWidth;
    canvas.height = totalCanvasHeight;

    // 绘制背景
    if (backgroundColor !== "transparent") {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    let currentY = padding;
    loadedImages.forEach(({ img, item }, idx) => {
      const drawH = scaledHeights[idx];
      const drawW = targetWidth;
      const drawX = padding;

      drawRoundedImage(ctx, img, drawX, currentY, drawW, drawH, borderRadius);
      currentY += drawH + gap;
    });
  }
  // ── B. 水平长图 (Horizontal Stitch) ──
  else if (direction === "horizontal") {
    const targetHeight = Math.max(...items.map((i) => i.height), 300);
    totalCanvasHeight = targetHeight + padding * 2;

    const scaledWidths = loadedImages.map(({ item }) => {
      const scale = targetHeight / item.height;
      return item.width * scale;
    });

    const sumWidths = scaledWidths.reduce((acc, w) => acc + w, 0);
    const totalGaps = Math.max(0, items.length - 1) * gap;
    totalCanvasWidth = Math.round(sumWidths + totalGaps + padding * 2);

    canvas.width = totalCanvasWidth;
    canvas.height = totalCanvasHeight;

    if (backgroundColor !== "transparent") {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    let currentX = padding;
    loadedImages.forEach(({ img }, idx) => {
      const drawW = scaledWidths[idx];
      const drawH = targetHeight;
      const drawY = padding;

      drawRoundedImage(ctx, img, currentX, drawY, drawW, drawH, borderRadius);
      currentX += drawW + gap;
    });
  }
  // ── C. 网格矩阵拼图 (Grid Matrix) ──
  else {
    const cols = Math.min(Math.max(1, gridCols), items.length);
    const rows = Math.ceil(items.length / cols);
    const cellWidth = Math.max(200, Math.round((maxWidth || 1000) / cols));
    const cellHeight = Math.round(cellWidth * 0.75); // 默认 4:3 单元格

    totalCanvasWidth = cols * cellWidth + (cols - 1) * gap + padding * 2;
    totalCanvasHeight = rows * cellHeight + (rows - 1) * gap + padding * 2;

    canvas.width = totalCanvasWidth;
    canvas.height = totalCanvasHeight;

    if (backgroundColor !== "transparent") {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    loadedImages.forEach(({ img, item }, idx) => {
      const colIdx = idx % cols;
      const rowIdx = Math.floor(idx / cols);

      const drawX = padding + colIdx * (cellWidth + gap);
      const drawY = padding + rowIdx * (cellHeight + gap);

      // 居中裁剪缩放适配单元格
      const cellAspect = cellWidth / cellHeight;
      const imgAspect = item.width / item.height;
      let sx = 0;
      let sy = 0;
      let sw = item.width;
      let sh = item.height;

      if (imgAspect > cellAspect) {
        sw = item.height * cellAspect;
        sx = (item.width - sw) / 2;
      } else {
        sh = item.width / cellAspect;
        sy = (item.height - sh) / 2;
      }

      ctx.save();
      if (borderRadius > 0) {
        ctx.beginPath();
        ctx.roundRect(drawX, drawY, cellWidth, cellHeight, borderRadius);
        ctx.clip();
      }
      ctx.drawImage(img, sx, sy, sw, sh, drawX, drawY, cellWidth, cellHeight);
      ctx.restore();
    });
  }

  const format = options.outputFormat || (options.backgroundColor === "transparent" ? "image/png" : "image/jpeg");
  const quality = options.quality ?? 0.92;
  return canvas.toDataURL(format, quality);
}

function drawRoundedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.save();
  if (radius > 0) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.clip();
  }
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, x, y, w, h);
  ctx.restore();
}
