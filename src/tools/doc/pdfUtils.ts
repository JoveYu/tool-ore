import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

export interface PageRangeOptions {
  totalCount: number;
  rangeString: string; // e.g. "1-3, 5, 8-10"
}

/**
 * 解析用户输入的页码字符串为 0-based 页码索引数组
 * 例如: "1-3, 5" -> [0, 1, 2, 4]
 */
export function parsePageRange(rangeStr: string, totalPages: number): number[] {
  if (!rangeStr.trim()) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const indices = new Set<number>();
  const parts = rangeStr.split(/[,，\s]+/);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(totalPages, Math.max(start, end));
        for (let p = min; p <= max; p++) {
          indices.add(p - 1);
        }
      }
    } else {
      const pageNum = parseInt(trimmed, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        indices.add(pageNum - 1);
      }
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}

/**
 * 读取 PDF 文件的元数据（页数、尺寸等）
 */
export async function getPdfInfo(data: ArrayBuffer): Promise<{
  pageCount: number;
  pages: { pageIndex: number; width: number; height: number }[];
}> {
  const doc = await PDFDocument.load(data, { ignoreEncryption: true });
  const pageCount = doc.getPageCount();
  const pages = doc.getPages().map((page, idx) => {
    const { width, height } = page.getSize();
    return { pageIndex: idx, width, height };
  });

  return { pageCount, pages };
}

/**
 * 合并多个 PDF 文件为一个完整的 PDF
 */
export async function mergePdfFiles(pdfBuffers: ArrayBuffer[]): Promise<Uint8Array> {
  if (pdfBuffers.length === 0) {
    throw new Error("请至少选择一个 PDF 文件进行合并");
  }

  const mergedDoc = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pageIndices = doc.getPageIndices();
    const copiedPages = await mergedDoc.copyPages(doc, pageIndices);
    for (const page of copiedPages) {
      mergedDoc.addPage(page);
    }
  }

  return await mergedDoc.save();
}

/**
 * 提取指定页码范围并保存为新 PDF
 */
export async function splitOrExtractPdf(
  pdfBuffer: ArrayBuffer,
  pageIndices: number[]
): Promise<Uint8Array> {
  if (pageIndices.length === 0) {
    throw new Error("请至少选择或指定一个待提取的页面");
  }

  const srcDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
  for (const page of copiedPages) {
    newDoc.addPage(page);
  }

  return await newDoc.save();
}

/**
 * 旋转 PDF 中的全部或指定页面
 */
export async function rotatePdfPages(
  pdfBuffer: ArrayBuffer,
  rotationDegrees: number, // e.g. 90, 180, 270
  pageIndices?: number[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const targetIndices =
    pageIndices && pageIndices.length > 0 ? pageIndices : doc.getPageIndices();

  for (const idx of targetIndices) {
    const page = doc.getPage(idx);
    const currentAngle = page.getRotation().angle;
    page.setRotation(degrees((currentAngle + rotationDegrees) % 360));
  }

  return await doc.save();
}

export type ImagePageFit = "fit" | "a4_portrait" | "a4_landscape";

export interface ImageToPdfItem {
  dataUrl: string;
  type: string; // image/png, image/jpeg, etc.
  width: number;
  height: number;
}

/**
 * 将多张图片合并生成为 PDF
 */
export async function imagesToPdf(
  images: ImageToPdfItem[],
  options: {
    pageFit: ImagePageFit;
    margin: number;
  }
): Promise<Uint8Array> {
  if (images.length === 0) {
    throw new Error("请至少选择一张图片");
  }

  const doc = await PDFDocument.create();
  const A4_WIDTH = 595.28;
  const A4_HEIGHT = 841.89;

  for (const imgItem of images) {
    // 转换为二进制数据
    const base64Data = imgItem.dataUrl.split(",")[1];
    const byteCharacters = atob(base64Data);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }

    let embeddedImage;
    if (imgItem.type.includes("png")) {
      embeddedImage = await doc.embedPng(byteArray);
    } else {
      // 默认尝试当作 JPG 嵌入
      embeddedImage = await doc.embedJpg(byteArray);
    }

    let pageWidth = imgItem.width;
    let pageHeight = imgItem.height;

    if (options.pageFit === "a4_portrait") {
      pageWidth = A4_WIDTH;
      pageHeight = A4_HEIGHT;
    } else if (options.pageFit === "a4_landscape") {
      pageWidth = A4_HEIGHT;
      pageHeight = A4_WIDTH;
    }

    const margin = options.margin;
    const availWidth = Math.max(10, pageWidth - margin * 2);
    const availHeight = Math.max(10, pageHeight - margin * 2);

    // 计算居中与缩放
    const scale = Math.min(availWidth / imgItem.width, availHeight / imgItem.height, 1);
    const drawWidth = imgItem.width * scale;
    const drawHeight = imgItem.height * scale;

    const x = margin + (availWidth - drawWidth) / 2;
    const y = margin + (availHeight - drawHeight) / 2;

    const page = doc.addPage([pageWidth, pageHeight]);
    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  return await doc.save();
}

export interface WatermarkOptions {
  text: string;
  size?: number;
  opacity?: number;
  angle?: number;
  mode?: "single" | "tile";
  color?: string; // hex
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

/**
 * 为 PDF 每一页添加文字水印
 */
export async function addWatermarkToPdf(
  pdfBuffer: ArrayBuffer,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const text = options.text.trim();
  if (!text) {
    throw new Error("水印文字不能为空");
  }

  const doc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();

  const fontSize = options.size || 36;
  const opacity = Math.max(0.05, Math.min(1, options.opacity ?? 0.25));
  const angle = options.angle ?? 30;
  const { r, g, b } = hexToRgb(options.color || "#000000");

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    if (options.mode === "tile") {
      // 平铺水印
      const stepX = Math.max(textWidth + 80, 200);
      const stepY = Math.max(textHeight + 100, 160);

      for (let x = -width; x < width * 2; x += stepX) {
        for (let y = -height; y < height * 2; y += stepY) {
          page.drawText(text, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(r, g, b),
            opacity,
            rotate: degrees(angle),
          });
        }
      }
    } else {
      // 居中单处水印
      page.drawText(text, {
        x: (width - textWidth) / 2,
        y: (height - textHeight) / 2,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity,
        rotate: degrees(angle),
      });
    }
  }

  return await doc.save();
}
