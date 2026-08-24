export type ImageFormat = "image/png" | "image/jpeg" | "image/webp" | "image/bmp" | "image/svg+xml";

export interface ConvertItem {
  id: string;
  file: File;
  previewUrl: string;
  originalSize: number;
  originalFormat: string;
  targetFormat: ImageFormat;
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedSize?: number;
  status: "pending" | "processing" | "success" | "error";
  error?: string;
}

export function getFileExt(format: ImageFormat): string {
  switch (format) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/bmp":
      return "bmp";
    case "image/svg+xml":
      return "svg";
    default:
      return "png";
  }
}

export async function convertSingleImage(
  file: File,
  targetFormat: ImageFormat,
  quality: number = 0.92
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onerror = () => reject(new Error("读取文件失败"));
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target?.result as string;
      img.onerror = () => reject(new Error("解析图片失败"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("无法创建画板"));
          return;
        }

        // Fill white background for JPEG when converting from transparent image
        if (targetFormat === "image/jpeg") {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, img.width, img.height);
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("格式转换失败"));
              return;
            }
            const dataUrl = canvas.toDataURL(targetFormat, quality);
            resolve({ blob, dataUrl });
          },
          targetFormat,
          quality
        );
      };
    };
  });
}
