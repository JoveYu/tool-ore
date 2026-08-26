import { describe, it, expect } from "vitest";
import {
  parseSubtitle,
  parseTimeToMs,
  msToSrtTime,
  msToVttTime,
  msToLrcTime,
  msToAssTime,
  stripSubtitleTags,
  adjustSubtitleTimeline,
  exportToSrt,
  exportToVtt,
  exportToLrc,
  SAMPLE_SUBTITLE_SRT,
} from "../src/tools/media/subtitleUtils";

describe("Subtitle Utilities", () => {
  it("converts timestamps between formats accurately", () => {
    const ms = 125500; // 2 min, 5 sec, 500 ms
    expect(msToSrtTime(ms)).toBe("00:02:05,500");
    expect(msToVttTime(ms)).toBe("00:02:05.500");
    expect(msToLrcTime(ms)).toBe("[02:05.50]");
    expect(msToAssTime(ms)).toBe("0:02:05.50");

    expect(parseTimeToMs("00:02:05,500")).toBe(125500);
    expect(parseTimeToMs("[02:05.50]")).toBe(125500);
  });

  it("strips HTML and ASS format tags cleanly", () => {
    const raw = "<i><b>Hello</b></i> {\\an8}World{\\pos(10,20)}!";
    expect(stripSubtitleTags(raw)).toBe("Hello World!");
  });

  it("parses sample SRT into structured cues", () => {
    const cues = parseSubtitle(SAMPLE_SUBTITLE_SRT);
    expect(cues.length).toBe(3);
    expect(cues[0].startTime).toBe(1500);
    expect(cues[0].endTime).toBe(4200);
    expect(cues[0].text).toContain("Tool-Ore");
  });

  it("shifts and scales subtitle timeline accurately", () => {
    const cues = parseSubtitle(SAMPLE_SUBTITLE_SRT);
    // Add 1000ms offset
    const adjusted = adjustSubtitleTimeline(cues, {
      offsetMs: 1000,
      speedRatio: 1.0,
      cleanTags: true,
    });

    expect(adjusted[0].startTime).toBe(2500);
    expect(adjusted[0].endTime).toBe(5200);
  });

  it("exports cues to VTT and LRC formats", () => {
    const cues = parseSubtitle(SAMPLE_SUBTITLE_SRT);
    const vtt = exportToVtt(cues);
    expect(vtt).toContain("WEBVTT");
    expect(vtt).toContain("00:00:01.500 --> 00:00:04.200");

    const lrc = exportToLrc(cues);
    expect(lrc).toContain("[00:01.50]");
  });
});
