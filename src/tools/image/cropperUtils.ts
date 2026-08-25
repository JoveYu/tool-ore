export type AspectRatioType = "free" | "1:1" | "4:3" | "16:9" | "3:4" | "9:16";

export type ShapeType = "rect" | "rounded" | "circle";

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropOptions {
  cropArea: CropArea;
  shape: ShapeType;
  borderRadius: number; // px
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  outputFormat: "image/png" | "image/jpeg" | "image/webp";
  quality: number; // 0.1 ~ 1.0
}

/**
 * 依据比例与图片尺寸计算居中默认裁剪区域
 */
export function getDefaultCropArea(
  imgWidth: number,
  imgHeight: number,
  aspectRatio: AspectRatioType
): CropArea {
  if (aspectRatio === "free") {
    return {
      x: 0,
      y: 0,
      width: imgWidth,
      height: imgHeight,
    };
  }

  let ratioNum = 1;
  if (aspectRatio === "1:1") ratioNum = 1;
  else if (aspectRatio === "4:3") ratioNum = 4 / 3;
  else if (aspectRatio === "16:9") ratioNum = 16 / 9;
  else if (aspectRatio === "3:4") ratioNum = 3 / 4;
  else if (aspectRatio === "9:16") ratioNum = 9 / 16;

  let width = imgWidth;
  let height = width / ratioNum;

  if (height > imgHeight) {
    height = imgHeight;
    width = height * ratioNum;
  }

  const x = Math.round((imgWidth - width) / 2);
  const y = Math.round((imgHeight - height) / 2);

  return {
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * 本地 Canvas 执行裁剪、旋转、翻转与圆角处理
 */
export async function cropImageToBlob(
  imageElement: HTMLImageElement,
  options: CropOptions
): Promise<Blob> {
  const { cropArea, shape, borderRadius, rotation, flipH, flipV, outputFormat, quality } =
    options;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法初始化 Canvas 绘图上下文");

  canvas.width = cropArea.width;
  canvas.height = cropArea.height;

  // 1. 裁剪形状与路径
  if (shape === "circle") {
    ctx.beginPath();
    const centerX = cropArea.width / 2;
    const centerY = cropArea.height / 2;
    const radius = Math.min(centerX, centerY);
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();
  } else if (shape === "rounded" && borderRadius > 0) {
    ctx.beginPath();
    const r = Math.min(borderRadius, cropArea.width / 2, cropArea.height / 2);
    const w = cropArea.width;
    const h = cropArea.height;
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.quadraticCurveTo(w, 0, w, r);
    ctx.lineTo(w, h - r);
    ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(r, h);
    ctx.quadraticCurveTo(0, h, 0, h - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.clip();
  }

  // 2. 变换（旋转与镜像）
  ctx.save();
  ctx.translate(cropArea.width / 2, cropArea.height / 2);

  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }
  if (flipH || flipV) {
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  }

  ctx.drawImage(
    imageElement,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    -cropArea.width / 2,
    -cropArea.height / 2,
    cropArea.width,
    cropArea.height
  );
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("图片生成 Blob 失败"));
      },
      outputFormat,
      quality
    );
  });
}

/**
 * 3x3 九宫格切图计算
 */
export async function sliceNineGrid(
  imageElement: HTMLImageElement,
  outputFormat: "image/png" | "image/jpeg" = "image/jpeg"
): Promise<{ index: number; dataUrl: string }[]> {
  const minSide = Math.min(imageElement.naturalWidth, imageElement.naturalHeight);
  const startX = (imageElement.naturalWidth - minSide) / 2;
  const startY = (imageElement.naturalHeight - minSide) / 2;
  const pieceSize = Math.floor(minSide / 3);

  const results: { index: number; dataUrl: string }[] = [];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const canvas = document.createElement("canvas");
      canvas.width = pieceSize;
      canvas.height = pieceSize;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(
          imageElement,
          startX + col * pieceSize,
          startY + row * pieceSize,
          pieceSize,
          pieceSize,
          0,
          0,
          pieceSize,
          pieceSize
        );
        const dataUrl = canvas.toDataURL(outputFormat, 0.92);
        results.push({
          index: row * 3 + col + 1,
          dataUrl,
        });
      }
    }
  }

  return results;
}
