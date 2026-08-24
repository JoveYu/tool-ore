import QRCode from "qrcode";
import jsQR from "jsqr";

export interface QRCodeOptions {
  width: number;
  margin: number;
  colorDark: string;
  colorLight: string;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
  logoUrl?: string;
  logoSizeRatio?: number; // 0.15 ~ 0.3
}

/**
 * 纯前端 Canvas 生成高质量二维码，支持中心嵌入自定义 Logo
 */
export async function generateQrCode(
  text: string,
  options: QRCodeOptions
): Promise<string> {
  if (!text.trim()) return "";

  const canvas = document.createElement("canvas");
  const size = options.width || 400;
  canvas.width = size;
  canvas.height = size;

  // 1. 绘制基础二维码
  await QRCode.toCanvas(canvas, text, {
    width: size,
    margin: options.margin ?? 2,
    color: {
      dark: options.colorDark || "#000000",
      light: options.colorLight || "#FFFFFF",
    },
    errorCorrectionLevel: options.logoUrl ? "H" : options.errorCorrectionLevel || "M",
  });

  // 2. 如果包含 Logo，绘制到中心
  if (options.logoUrl) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      await new Promise<void>((resolve) => {
        const logo = new window.Image();
        logo.crossOrigin = "anonymous";
        logo.src = options.logoUrl!;
        logo.onload = () => {
          const ratio = options.logoSizeRatio || 0.22;
          const logoWidth = size * ratio;
          const logoHeight = (logoWidth * logo.height) / logo.width;
          const x = (size - logoWidth) / 2;
          const y = (size - logoHeight) / 2;

          // 绘制 Logo 背后白色圆角背景，防止二维码杂点干扰识别
          const pad = 6;
          ctx.fillStyle = options.colorLight || "#FFFFFF";
          ctx.beginPath();
          ctx.roundRect(x - pad, y - pad, logoWidth + pad * 2, logoHeight + pad * 2, 8);
          ctx.fill();

          ctx.drawImage(logo, x, y, logoWidth, logoHeight);
          resolve();
        };
        logo.onerror = () => resolve(); // Logo 加载失败也正常返回二维码
      });
    }
  }

  return canvas.toDataURL("image/png");
}

/**
 * 从上传的图片文件中纯前端解码解析二维码内容
 */
export async function decodeQrCodeFromFile(file: File): Promise<{
  text?: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve({ error: "读取文件失败" });
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target?.result as string;
      img.onerror = () => resolve({ error: "解析图片失败" });
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve({ error: "无法创建绘图上下文" });
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          resolve({ text: code.data });
        } else {
          resolve({ error: "未在此图片中识别到有效的二维码" });
        }
      };
    };
    reader.readAsDataURL(file);
  });
}
