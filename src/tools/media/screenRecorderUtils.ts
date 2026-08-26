export interface RecordingOptions {
  includeMic: boolean;
  includeSystemAudio: boolean;
  resolution: "1080p" | "720p" | "original";
  frameRate: 30 | 60;
  videoBitsPerSecond?: number;
}

export interface RecordingInfo {
  durationMs: number;
  blobUrl: string;
  blobSize: number;
  mimeType: string;
}

/**
 * 格式化毫秒为标准时间字符串 (HH:mm:ss 或 mm:ss)
 */
export function formatRecordingTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, "0");
  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
}

/**
 * 检查当前浏览器是否支持屏幕录制 API
 */
export function isScreenRecordingSupported(): boolean {
  if (typeof navigator === "undefined" || !navigator.mediaDevices) {
    return false;
  }
  return (
    typeof navigator.mediaDevices.getDisplayMedia === "function" &&
    typeof MediaRecorder !== "undefined"
  );
}

/**
 * 获取浏览器支持的最佳视频录制 MIME 类型
 */
export function getSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") {
    return "video/webm";
  }

  const candidateTypes = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=h264,opus",
    "video/mp4;codecs=avc1,mp4a.40.2",
    "video/webm",
    "video/mp4",
  ];

  for (const type of candidateTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return "video/webm";
}

/**
 * 格式化字节大小显示
 */
export function formatVideoFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
