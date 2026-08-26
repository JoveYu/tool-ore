import { describe, it, expect } from "vitest";
import {
  formatRecordingTime,
  formatVideoFileSize,
  getSupportedMimeType,
  isScreenRecordingSupported,
} from "../src/tools/media/screenRecorderUtils";

describe("Screen Recorder Utilities", () => {
  it("formats recording seconds into MM:SS and HH:MM:SS", () => {
    expect(formatRecordingTime(5)).toBe("00:05");
    expect(formatRecordingTime(65)).toBe("01:05");
    expect(formatRecordingTime(3665)).toBe("01:01:05");
  });

  it("formats video file sizes accurately", () => {
    expect(formatVideoFileSize(800)).toBe("800 B");
    expect(formatVideoFileSize(1024 * 500)).toBe("500.0 KB");
    expect(formatVideoFileSize(1024 * 1024 * 25.6)).toBe("25.60 MB");
  });

  it("handles environment safely for MIME types and API support check", () => {
    expect(typeof getSupportedMimeType()).toBe("string");
    expect(typeof isScreenRecordingSupported()).toBe("boolean");
  });
});
