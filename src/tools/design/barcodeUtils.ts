import JsBarcode from "jsbarcode";

export type BarcodeFormat =
  | "CODE128"
  | "EAN13"
  | "EAN8"
  | "UPC"
  | "CODE39"
  | "ITF14"
  | "MSI"
  | "pharmacode";

export interface BarcodeGenerateOptions {
  format: BarcodeFormat;
  width?: number; // 单条条码宽度 (1 ~ 4)
  height?: number; // 条码高度 (px)
  displayValue?: boolean; // 是否在底部显示文本
  fontSize?: number;
  margin?: number;
  background?: string;
  lineColor?: string;
}

/**
 * 纯前端 Canvas 生成条形码 DataURL
 */
export function generateBarcode(
  text: string,
  options: BarcodeGenerateOptions
): string {
  if (!text.trim()) return "";

  const canvas = document.createElement("canvas");
  try {
    JsBarcode(canvas, text.trim(), {
      format: options.format || "CODE128",
      width: options.width ?? 2,
      height: options.height ?? 80,
      displayValue: options.displayValue ?? true,
      fontSize: options.fontSize ?? 16,
      margin: options.margin ?? 10,
      background: options.background || "#FFFFFF",
      lineColor: options.lineColor || "#000000",
    });

    return canvas.toDataURL("image/png");
  } catch (err: any) {
    throw new Error(err?.message || "条形码生成失败，请检查输入内容是否符合该格式规则");
  }
}

/**
 * 动态加载 ZXing 解码引擎并纯前端解析上传图片中的条形码
 */
export async function decodeBarcodeFromFile(file: File): Promise<{
  text?: string;
  format?: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve({ error: "读取文件失败" });
    reader.onload = async (e) => {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/library");
        const imageUrl = e.target?.result as string;
        const codeReader = new BrowserMultiFormatReader();
        const result = await codeReader.decodeFromImageUrl(imageUrl);

        if (result && result.getText()) {
          resolve({
            text: result.getText(),
            format: result.getBarcodeFormat()?.toString() || "1D Barcode",
          });
        } else {
          resolve({ error: "未在此图片中识别到有效的条形码" });
        }
      } catch (err: any) {
        resolve({ error: "未能识别条形码，请确保图片清晰且包含标准条形码" });
      }
    };
    reader.readAsDataURL(file);
  });
}
