export type WatermarkMode = "tile" | "single";

export type SinglePosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface WatermarkOptions {
  mode: WatermarkMode;
  text: string;
  fontSize: number;
  color: string;
  opacity: number; // 0.1 ~ 1.0
  rotate: number; // -90 ~ 90
  gapX: number; // for tiled mode
  gapY: number; // for tiled mode
  position: SinglePosition;
  margin: number;
  outputFormat: "image/png" | "image/jpeg" | "image/webp";
  quality: number;
}

export const WATERMARK_PRESETS = [
  "仅供办理业务使用，复印无效",
  "仅供实名认证使用 · 他用无效",
  "内部机密资料 · 严禁外传",
  "样张 SAMPLE · 仅供审阅",
  "版权所有 © 未经授权禁止商用",
];

/**
 * 本地 Canvas 绘制并合成水印
 */
export async function applyWatermark(
  imageElement: HTMLImageElement,
  options: WatermarkOptions
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法初始化 Canvas");

  const width = imageElement.naturalWidth;
  const height = imageElement.naturalHeight;

  canvas.width = width;
  canvas.height = height;

  // 1. 绘制底层原始图像
  ctx.drawImage(imageElement, 0, 0, width, height);

  if (!options.text.trim()) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("生成失败"))),
        options.outputFormat,
        options.quality
      );
    });
  }

  // 2. 配置文字样式
  ctx.save();
  ctx.globalAlpha = options.opacity;
  ctx.fillStyle = options.color;
  ctx.font = `bold ${options.fontSize}px sans-serif`;
  ctx.textBaseline = "middle";

  if (options.mode === "tile") {
    // 全屏平铺水印
    const metrics = ctx.measureText(options.text);
    const textWidth = metrics.width;
    const stepX = textWidth + options.gapX;
    const stepY = options.fontSize + options.gapY;

    // 旋转平移绘制网格
    for (let x = -width; x < width * 2; x += stepX) {
      for (let y = -height; y < height * 2; y += stepY) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((options.rotate * Math.PI) / 180);
        ctx.fillText(options.text, 0, 0);
        ctx.restore();
      }
    }
  } else {
    // 单处指定锚点位置水印
    const metrics = ctx.measureText(options.text);
    const textWidth = metrics.width;
    const textHeight = options.fontSize;
    const margin = options.margin;

    let posX = margin;
    let posY = margin + textHeight / 2;

    switch (options.position) {
      case "top-left":
        posX = margin;
        posY = margin + textHeight / 2;
        break;
      case "top-center":
        posX = (width - textWidth) / 2;
        posY = margin + textHeight / 2;
        break;
      case "top-right":
        posX = width - textWidth - margin;
        posY = margin + textHeight / 2;
        break;
      case "center-left":
        posX = margin;
        posY = height / 2;
        break;
      case "center":
        posX = (width - textWidth) / 2;
        posY = height / 2;
        break;
      case "center-right":
        posX = width - textWidth - margin;
        posY = height / 2;
        break;
      case "bottom-left":
        posX = margin;
        posY = height - margin - textHeight / 2;
        break;
      case "bottom-center":
        posX = (width - textWidth) / 2;
        posY = height - margin - textHeight / 2;
        break;
      case "bottom-right":
        posX = width - textWidth - margin;
        posY = height - margin - textHeight / 2;
        break;
    }

    ctx.save();
    ctx.translate(posX + textWidth / 2, posY);
    ctx.rotate((options.rotate * Math.PI) / 180);
    ctx.fillText(options.text, -textWidth / 2, 0);
    ctx.restore();
  }

  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("图片生成 Blob 失败"));
      },
      options.outputFormat,
      options.quality
    );
  });
}
