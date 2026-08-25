import ExifReader from "exifreader";

export interface ParsedExifData {
  hasExif: boolean;
  make?: string;
  model?: string;
  lensModel?: string;
  dateTime?: string;
  fNumber?: string;
  exposureTime?: string;
  iso?: string;
  focalLength?: string;
  software?: string;
  gps?: {
    latitude: number;
    longitude: number;
    altitude?: number;
    latRef?: string;
    lngRef?: string;
    mapUrl?: string;
  };
  rawTags: Record<string, string>;
}

/**
 * 纯前端本地解析图片 EXIF 与 GPS 元数据
 */
export async function parseImageExif(file: File | ArrayBuffer): Promise<ParsedExifData> {
  try {
    const tags = await ExifReader.load(file, { expanded: true });

    const rawTags: Record<string, string> = {};
    let make: string | undefined;
    let model: string | undefined;
    let lensModel: string | undefined;
    let dateTime: string | undefined;
    let fNumber: string | undefined;
    let exposureTime: string | undefined;
    let iso: string | undefined;
    let focalLength: string | undefined;
    let software: string | undefined;

    // 遍历基础 EXIF 标签
    if (tags.exif) {
      for (const [key, val] of Object.entries(tags.exif)) {
        rawTags[key] = String(val.description ?? val.value ?? "");
      }
      make = tags.exif.Make?.description;
      model = tags.exif.Model?.description;
      lensModel = tags.exif.LensModel?.description;
      dateTime = tags.exif.DateTimeOriginal?.description || tags.exif.DateTime?.description;
      fNumber = tags.exif.FNumber?.description;
      exposureTime = tags.exif.ExposureTime?.description;
      iso = tags.exif.ISOSpeedRatings?.description;
      focalLength = tags.exif.FocalLength?.description;
      software = tags.exif.Software?.description;
    }

    if (tags.file) {
      for (const [key, val] of Object.entries(tags.file)) {
        rawTags[`File:${key}`] = String(val.description ?? val.value ?? "");
      }
    }

    // 解析 GPS 坐标
    let gps: ParsedExifData["gps"] | undefined;
    if (tags.gps && tags.gps.Latitude !== undefined && tags.gps.Longitude !== undefined) {
      const lat = Number(tags.gps.Latitude);
      const lng = Number(tags.gps.Longitude);
      const alt = tags.gps.Altitude !== undefined ? Number(tags.gps.Altitude) : undefined;
      const latRef = tags.gps.LatitudeRef?.description;
      const lngRef = tags.gps.LongitudeRef?.description;

      const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;

      gps = {
        latitude: lat,
        longitude: lng,
        altitude: alt,
        latRef,
        lngRef,
        mapUrl,
      };
    }

    const hasExif = Object.keys(rawTags).length > 0;

    return {
      hasExif,
      make,
      model,
      lensModel,
      dateTime,
      fNumber,
      exposureTime,
      iso,
      focalLength,
      software,
      gps,
      rawTags,
    };
  } catch (err: any) {
    return {
      hasExif: false,
      rawTags: {},
    };
  }
}

/**
 * 清除所有 EXIF / GPS 隐私元数据并导出纯净图片
 */
export async function stripExifMetadata(
  imageElement: HTMLImageElement,
  format: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg",
  quality: number = 0.95
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 初始化失败");

  // 通过 Canvas 纯像素重绘彻底脱敏元数据
  ctx.drawImage(imageElement, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("图片脱敏处理失败"));
      },
      format,
      quality
    );
  });
}
