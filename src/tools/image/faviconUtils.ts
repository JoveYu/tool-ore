export interface FaviconSizeOption {
  size: number;
  label: string;
  recommendedFor: string;
  selected: boolean;
}

export const FAVICON_STANDARD_SIZES: FaviconSizeOption[] = [
  { size: 16, label: "16 × 16", recommendedFor: "浏览器标签页小图标", selected: true },
  { size: 32, label: "32 × 32", recommendedFor: "Retina 高清标签页标准", selected: true },
  { size: 48, label: "48 × 48", recommendedFor: "Windows 任务栏与快捷方式", selected: true },
  { size: 64, label: "64 × 64", recommendedFor: "高分屏快捷方式", selected: false },
  { size: 128, label: "128 × 128", recommendedFor: "Chrome 网上应用店", selected: false },
  { size: 180, label: "180 × 180", recommendedFor: "Apple Touch iOS 主屏幕", selected: true },
  { size: 192, label: "192 × 192", recommendedFor: "Android PWA 应用图标", selected: false },
  { size: 512, label: "512 × 512", recommendedFor: "PWA 启动封面大图", selected: false },
];

/**
 * 离屏 Canvas 生成指定尺寸的 PNG Blob 与 DataURL
 */
export async function resizeImageToPng(
  imageElement: HTMLImageElement,
  size: number
): Promise<{ blob: Blob; dataUrl: string; buffer: ArrayBuffer }> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法初始化 Canvas");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(imageElement, 0, 0, size, size);

  const dataUrl = canvas.toDataURL("image/png");

  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (blob) {
        const buffer = await blob.arrayBuffer();
        resolve({ blob, dataUrl, buffer });
      } else {
        reject(new Error("生成失败"));
      }
    }, "image/png");
  });
}

/**
 * 将多张 PNG 二进制流打包合成符合 Windows 标准的 .ico 二进制容器
 */
export function buildMultiSizeIco(images: { size: number; buffer: ArrayBuffer }[]): Blob {
  const count = images.length;
  // ICO 头部: 6 字节 (2 bytes Reserved(0) + 2 bytes Type(1) + 2 bytes ImageCount)
  // 每个目录项: 16 字节
  const headerSize = 6;
  const directorySize = 16 * count;
  let offset = headerSize + directorySize;

  const totalSize = offset + images.reduce((acc, img) => acc + img.buffer.byteLength, 0);
  const icoBuffer = new Uint8Array(totalSize);
  const view = new DataView(icoBuffer.buffer);

  // 1. 写 ICO Header
  view.setUint16(0, 0, true); // Reserved = 0
  view.setUint16(2, 1, true); // Type: 1 = ICO, 2 = CUR
  view.setUint16(4, count, true); // Number of images

  // 2. 写 Directory Entries
  let dirOffset = 6;
  for (let i = 0; i < count; i++) {
    const img = images[i];
    const byteLength = img.buffer.byteLength;

    const width = img.size >= 256 ? 0 : img.size;
    const height = img.size >= 256 ? 0 : img.size;

    view.setUint8(dirOffset, width); // Width
    view.setUint8(dirOffset + 1, height); // Height
    view.setUint8(dirOffset + 2, 0); // Palette color count (0 if >= 8bpp)
    view.setUint8(dirOffset + 3, 0); // Reserved (0)
    view.setUint16(dirOffset + 4, 1, true); // Color planes (1)
    view.setUint16(dirOffset + 6, 32, true); // Bits per pixel (32-bit RGBA)
    view.setUint32(dirOffset + 8, byteLength, true); // Size of image data
    view.setUint32(dirOffset + 12, offset, true); // Offset of image data

    // 复制图片 PNG 数据流至目标 offset
    icoBuffer.set(new Uint8Array(img.buffer), offset);

    offset += byteLength;
    dirOffset += 16;
  }

  return new Blob([icoBuffer], { type: "image/x-icon" });
}

/**
 * 生成 HTML head 标签代码
 */
export function generateFaviconHtmlTags(): string {
  return `<!-- 标准浏览器与搜索引擎 Favicon -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">

<!-- Apple iOS 设备主屏幕图标 -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Android 与 PWA 清单引用 -->
<link rel="manifest" href="/site.webmanifest">`;
}
