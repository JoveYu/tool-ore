import { describe, it, expect } from "vitest";
import { AudioTrimOptions } from "../src/tools/media/audioUtils";

describe("Audio Cutter Utilities", () => {
  it("validates audio trim options interface", () => {
    const opts: AudioTrimOptions = {
      startTime: 5.0,
      endTime: 15.0,
      fadeInDuration: 1.0,
      fadeOutDuration: 1.0,
      volume: 1.0,
    };
    expect(opts.startTime).toBe(5.0);
    expect(opts.endTime).toBe(15.0);
  });
});
