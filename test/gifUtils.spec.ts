import { describe, it, expect } from "vitest";
import { VideoToGifOptions } from "../src/tools/media/gifUtils";

describe("Video to GIF Utilities", () => {
  it("validates video to gif options interface", () => {
    const opts: VideoToGifOptions = {
      startTime: 0,
      endTime: 3.5,
      fps: 10,
      width: 480,
      quality: 10,
    };
    expect(opts.fps).toBe(10);
    expect(opts.width).toBe(480);
  });
});
