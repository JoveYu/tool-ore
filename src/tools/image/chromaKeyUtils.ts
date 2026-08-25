export interface ChromaKeyOptions {
  keyColor: { r: number; g: number; b: number }; // 待去除/替换的背景颜色
  targetColor: string; // 目标新背景色 (hex 或 "transparent")
  tolerance: number; // 容差 (1 ~ 100)
  smoothness: number; // 边缘羽化平滑 (0 ~ 30)
  spillReduction: number; // 边缘去色溢出 (0 ~ 100)
}

export interface PhotoCropPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  desc: string;
}

export const PHOTO_SIZE_PRESETS: PhotoCropPreset[] = [
  { id: "free", name: "保持原图尺寸", width: 0, height: 0, desc: "不裁剪尺寸" },
  { id: "1_inch", name: "标准一寸", width: 295, height: 413, desc: "25mm × 35mm (常用证件/简历)" },
  { id: "small_1_inch", name: "小一寸", width: 260, height: 378, desc: "22mm × 32mm (驾驶证/驾照)" },
  { id: "2_inch", name: "标准二寸", width: 413, height: 579, desc: "35mm × 49mm (护照/签证)" },
  { id: "small_2_inch", name: "小二寸", width: 413, height: 531, desc: "35mm × 45mm (部分国签/资格证)" },
];

export const TARGET_COLOR_PRESETS = [
  { name: "证件蓝", color: "#0099FF" },
  { name: "深海蓝", color: "#0047AB" },
  { name: "标准红", color: "#D32F2F" },
  { name: "纯正红", color: "#FF0000" },
  { name: "纯白色", color: "#FFFFFF" },
  { name: "商务浅灰", color: "#E2E8F0" },
  { name: "透明底", color: "transparent" },
];

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (hex === "transparent") return null;
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * 计算两个 RGB 颜色的欧氏色差距离
 */
export function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
  );
}

/**
 * 纯前端对 Canvas ImageData 执行色度抠图与背景替换
 */
export function processChromaKey(
  sourceCanvas: HTMLCanvasElement,
  options: ChromaKeyOptions
): string {
  if (typeof document === "undefined") return "";

  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = width;
  outputCanvas.height = height;

  const outCtx = outputCanvas.getContext("2d", { willReadFrequently: true });
  const srcCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!outCtx || !srcCtx) return "";

  const srcImgData = srcCtx.getImageData(0, 0, width, height);
  const srcData = srcImgData.data;

  const outImgData = outCtx.createImageData(width, height);
  const outData = outImgData.data;

  const targetRgb = hexToRgb(options.targetColor);
  const isTransparent = options.targetColor === "transparent" || !targetRgb;

  const { r: kr, g: kg, b: kb } = options.keyColor;
  // 转换容差与羽化区间
  const maxDistance = 441.67; // sqrt(255^2 * 3)
  const threshold = (options.tolerance / 100) * maxDistance;
  const feather = (options.smoothness / 100) * maxDistance;

  for (let i = 0; i < srcData.length; i += 4) {
    const sr = srcData[i];
    const sg = srcData[i + 1];
    const sb = srcData[i + 2];
    const sa = srcData[i + 3];

    const dist = colorDistance(sr, sg, sb, kr, kg, kb);

    if (dist < threshold) {
      // 属于背景色区域
      if (isTransparent) {
        outData[i] = 0;
        outData[i + 1] = 0;
        outData[i + 2] = 0;
        outData[i + 3] = 0;
      } else {
        outData[i] = targetRgb.r;
        outData[i + 1] = targetRgb.g;
        outData[i + 2] = targetRgb.b;
        outData[i + 3] = 255;
      }
    } else if (dist < threshold + feather && feather > 0) {
      // 羽化边缘混合区域
      const blend = (dist - threshold) / feather; // 0 (全背景) ~ 1 (全前景)

      // 溢色抑制 (去除头发边沿反光的背景底色残留)
      let finalR = sr;
      let finalG = sg;
      let finalB = sb;

      if (options.spillReduction > 0) {
        const spillRatio = (options.spillReduction / 100) * (1 - blend);
        finalR = Math.max(0, sr - (kr - (sg + sb) / 2) * spillRatio);
        finalG = Math.max(0, sg - (kg - (sr + sb) / 2) * spillRatio);
        finalB = Math.max(0, sb - (kb - (sr + sg) / 2) * spillRatio);
      }

      if (isTransparent) {
        outData[i] = finalR;
        outData[i + 1] = finalG;
        outData[i + 2] = finalB;
        outData[i + 3] = Math.round(sa * blend);
      } else {
        outData[i] = Math.round(finalR * blend + targetRgb.r * (1 - blend));
        outData[i + 1] = Math.round(finalG * blend + targetRgb.g * (1 - blend));
        outData[i + 2] = Math.round(finalB * blend + targetRgb.b * (1 - blend));
        outData[i + 3] = 255;
      }
    } else {
      // 人物/前景主体区域：100% 保持原始像素色彩与透明度，绝不修改前景颜色
      outData[i] = sr;
      outData[i + 1] = sg;
      outData[i + 2] = sb;
      outData[i + 3] = sa;
    }
  }

  outCtx.putImageData(outImgData, 0, 0);
  return outputCanvas.toDataURL("image/png");
}

/**
 * 生成 6 寸相纸 (1200 × 1800) 多张证件照冲印排版图
 */
export async function generatePhotoSheet(
  photoDataUrl: string,
  count: number = 8
): Promise<string> {
  if (typeof document === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = 1800;
  canvas.height = 1200;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // 纯白相纸底色
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const img = new Image();
  await new Promise<void>((res) => {
    img.onload = () => res();
    img.src = photoDataUrl;
  });

  const photoW = 295 * 1.2;
  const photoH = 413 * 1.2;
  const marginX = 80;
  const marginY = 80;
  const gapX = (canvas.width - marginX * 2 - photoW * 4) / 3;
  const gapY = (canvas.height - marginY * 2 - photoH * 2);

  let drawn = 0;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      if (drawn >= count) break;
      const x = marginX + col * (photoW + gapX);
      const y = marginY + row * (photoH + gapY);

      // 绘制单张照片
      ctx.drawImage(img, x, y, photoW, photoH);

      // 绘制微弱裁切虚线框
      ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x, y, photoW, photoH);

      drawn++;
    }
  }

  return canvas.toDataURL("image/jpeg", 0.95);
}
