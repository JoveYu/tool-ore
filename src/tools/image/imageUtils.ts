export interface CompressOptions {
  quality?: number; // 0.1 ~ 1.0 (for manual quality mode)
  targetMaxSizeBytes?: number; // Target max size in bytes (e.g. 500KB = 500 * 1024)
  maxWidthOrHeight?: number;
  format?: "image/jpeg" | "image/webp" | "image/png";
}

export interface CompressResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  actualQuality?: number;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * 辅助函数：根据给定 canvas 和参数将图片导出为 Blob 和 DataURL
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality: number
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas toBlob failed"));
          return;
        }
        const dataUrl = canvas.toDataURL(format, quality);
        resolve({ blob, dataUrl });
      },
      format,
      quality
    );
  });
}

export async function compressImage(
  file: File,
  options: CompressOptions
): Promise<CompressResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = () => reject(new Error("读取图片失败"));
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target?.result as string;
      img.onerror = () => reject(new Error("解析图片失败"));
      img.onload = async () => {
        let width = img.width;
        let height = img.height;
        let maxDim = options.maxWidthOrHeight;

        if (maxDim && (width > maxDim || height > maxDim)) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("无法创建 Canvas 绘图上下文"));
          return;
        }

        // If target format is JPEG, draw white background for transparent PNGs
        const outputFormat =
          options.format || (file.type === "image/png" ? "image/png" : "image/jpeg");

        if (outputFormat === "image/jpeg") {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        const originalSize = file.size;

        // 如果用户指定了期望的最大文件大小 targetMaxSizeBytes
        if (options.targetMaxSizeBytes && options.targetMaxSizeBytes > 0) {
          const targetBytes = options.targetMaxSizeBytes;

          // 二分查找最佳质量 (0.05 ~ 0.98)
          let minQ = 0.05;
          let maxQ = 0.98;
          let bestResult: { blob: Blob; dataUrl: string; q: number } | null = null;

          // 最多迭代 7 次二分逼近
          for (let iter = 0; iter < 7; iter++) {
            const midQ = (minQ + maxQ) / 2;
            const res = await canvasToBlob(canvas, outputFormat, midQ);

            if (res.blob.size <= targetBytes) {
              bestResult = { ...res, q: midQ };
              // 尝试获取更高的质量
              minQ = midQ;
            } else {
              // 超过了目标大小，需要降低质量
              maxQ = midQ;
            }
          }

          // 如果即便在最低质量下也仍然超过目标大小，则进一步缩减分辨率
          if (!bestResult) {
            let scaleCanvas = canvas;
            let curWidth = width;
            let curHeight = height;

            while (curWidth > 200 && curHeight > 200) {
              curWidth = Math.round(curWidth * 0.75);
              curHeight = Math.round(curHeight * 0.75);

              const tempCanvas = document.createElement("canvas");
              tempCanvas.width = curWidth;
              tempCanvas.height = curHeight;
              const tCtx = tempCanvas.getContext("2d");
              if (!tCtx) break;

              if (outputFormat === "image/jpeg") {
                tCtx.fillStyle = "#FFFFFF";
                tCtx.fillRect(0, 0, curWidth, curHeight);
              }
              tCtx.drawImage(img, 0, 0, curWidth, curHeight);

              const res = await canvasToBlob(tempCanvas, outputFormat, 0.6);
              if (res.blob.size <= targetBytes) {
                bestResult = { ...res, q: 0.6 };
                width = curWidth;
                height = curHeight;
                break;
              }
            }
          }

          // 兜底返回二分或缩放后的最优结果
          if (!bestResult) {
            bestResult = await canvasToBlob(canvas, outputFormat, 0.1);
          }

          const compressedSize = bestResult.blob.size;
          const compressionRatio = Math.round(
            ((originalSize - compressedSize) / originalSize) * 100
          );

          resolve({
            blob: bestResult.blob,
            dataUrl: bestResult.dataUrl,
            width,
            height,
            originalSize,
            compressedSize,
            compressionRatio,
            actualQuality: Math.round(bestResult.q * 100),
          });
          return;
        }

        // 常规质量模式
        const quality = options.quality ?? 0.8;
        try {
          const { blob, dataUrl } = await canvasToBlob(canvas, outputFormat, quality);
          const compressedSize = blob.size;
          const compressionRatio = Math.round(
            ((originalSize - compressedSize) / originalSize) * 100
          );

          resolve({
            blob,
            dataUrl,
            width,
            height,
            originalSize,
            compressedSize,
            compressionRatio,
            actualQuality: Math.round(quality * 100),
          });
        } catch (err) {
          reject(err);
        }
      };
    };
  });
}
