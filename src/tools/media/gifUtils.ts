import { GIFEncoder, quantize, applyPalette } from "gifenc";

export interface VideoToGifOptions {
  startTime: number; // 秒
  endTime: number; // 秒
  fps: number; // 5 ~ 25
  width: number; // 目标宽度 px
  quality: number; // 1 ~ 30 (低代表高质量)
}

/**
 * 纯本地通过 Canvas 与 gifenc 将视频片段转换为 GIF 动图
 */
export async function convertVideoToGif(
  videoElement: HTMLVideoElement,
  options: VideoToGifOptions,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const { startTime, endTime, fps, width } = options;

  // 1. 计算缩放后的尺寸
  const naturalWidth = videoElement.videoWidth || 640;
  const naturalHeight = videoElement.videoHeight || 480;
  const targetWidth = Math.min(naturalWidth, width);
  const targetHeight = Math.round((naturalHeight / naturalWidth) * targetWidth);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("无法初始化 Canvas");

  const duration = Math.max(0.1, endTime - startTime);
  const totalFrames = Math.max(1, Math.round(duration * fps));
  const frameInterval = 1 / fps;
  const delay = Math.round(1000 / fps);

  // 初始化 GIFEncoder
  const gif = GIFEncoder();

  // 逐帧 Seek 抽取画面
  for (let f = 0; f < totalFrames; f++) {
    const currentTime = startTime + f * frameInterval;
    await seekVideoTo(videoElement, currentTime);

    ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);
    const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);

    // 颜色量化与调色板生成
    const palette = quantize(imgData.data, 256);
    const index = applyPalette(imgData.data, palette);

    // 写入当前帧
    gif.writeFrame(index, targetWidth, targetHeight, {
      palette,
      delay,
    });

    if (onProgress) {
      onProgress(Math.round(((f + 1) / totalFrames) * 100));
    }
  }

  gif.finish();
  const buffer = gif.bytes();
  return new Blob([buffer], { type: "image/gif" });
}

function seekVideoTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = Math.min(video.duration || time, Math.max(0, time));
  });
}
