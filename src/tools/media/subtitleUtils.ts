export type SubtitleFormat = "srt" | "vtt" | "lrc" | "ass";

export interface SubtitleCue {
  id: number;
  startTime: number; // 毫秒
  endTime: number; // 毫秒
  text: string;
}

export const SAMPLE_SUBTITLE_SRT = `1
00:00:01,500 --> 00:00:04,200
欢迎来到 Tool-Ore 纯前端在线工具箱
Welcome to Tool-Ore Online Tools

2
00:00:04,800 --> 00:00:08,500
零后端部署，所有计算均在浏览器本地毫秒级完成
Zero-backend, all computations run locally in your browser

3
00:00:09,100 --> 00:00:13,000
保护敏感数据安全，极速流畅，安全可靠
Protect sensitive data with offline local privacy and speed`;

/**
 * 毫秒转 SRT 格式时间戳 (00:00:01,500)
 */
export function msToSrtTime(ms: number): string {
  const safeMs = Math.max(0, ms);
  const hours = Math.floor(safeMs / 3600000);
  const minutes = Math.floor((safeMs % 3600000) / 60000);
  const seconds = Math.floor((safeMs % 60000) / 1000);
  const millis = Math.floor(safeMs % 1000);

  const pad = (n: number, len = 2) => n.toString().padStart(len, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(millis, 3)}`;
}

/**
 * 毫秒转 VTT 格式时间戳 (00:00:01.500)
 */
export function msToVttTime(ms: number): string {
  return msToSrtTime(ms).replace(",", ".");
}

/**
 * 毫秒转 LRC 歌词时间戳 ([01:23.45])
 */
export function msToLrcTime(ms: number): string {
  const safeMs = Math.max(0, ms);
  const minutes = Math.floor(safeMs / 60000);
  const seconds = Math.floor((safeMs % 60000) / 1000);
  const centis = Math.floor((safeMs % 1000) / 10);

  const pad = (n: number, len = 2) => n.toString().padStart(len, "0");
  return `[${pad(minutes)}:${pad(seconds)}.${pad(centis)}]`;
}

/**
 * 毫秒转 ASS 格式时间戳 (0:00:01.50)
 */
export function msToAssTime(ms: number): string {
  const safeMs = Math.max(0, ms);
  const hours = Math.floor(safeMs / 3600000);
  const minutes = Math.floor((safeMs % 3600000) / 60000);
  const seconds = Math.floor((safeMs % 60000) / 1000);
  const centis = Math.floor((safeMs % 1000) / 10);

  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${hours}:${pad(minutes)}:${pad(seconds)}.${pad(centis)}`;
}

/**
 * 解析 SRT/VTT/LRC 时间戳字符串为毫秒
 */
export function parseTimeToMs(timeStr: string): number {
  const clean = timeStr.trim().replace("[", "").replace("]", "").replace(",", ".");

  // LRC 格式: 01:23.45 或 01:23.456
  if (/^\d{1,2}:\d{2}\.\d+$/.test(clean)) {
    const [minStr, secStr] = clean.split(":");
    const mins = parseInt(minStr, 10);
    const secs = parseFloat(secStr);
    return Math.round(mins * 60000 + secs * 1000);
  }

  // SRT / VTT 格式: 00:01:23.456 或 01:23.456
  const parts = clean.split(":");
  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]);
    return Math.round(hours * 3600000 + minutes * 60000 + seconds * 1000);
  } else if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1]);
    return Math.round(minutes * 60000 + seconds * 1000);
  }

  return 0;
}

/**
 * 清除字幕中的 HTML 标签与 ASS 控制字符
 */
export function stripSubtitleTags(text: string): string {
  return text
    .replace(/<[^>]+>/g, "") // 清除 HTML 标签如 <i>, <b>, <font>
    .replace(/\{[^}]+\}/g, "") // 清除 ASS 特效代码如 {\an8}, {\pos(x,y)}
    .trim();
}

/**
 * 自动解析任意输入格式字幕为标准 Cue 列表
 */
export function parseSubtitle(rawText: string): SubtitleCue[] {
  if (!rawText.trim()) return [];

  const text = rawText.trim();
  const cues: SubtitleCue[] = [];

  // 1. 判断是否为 LRC 歌词格式 ([00:12.34]歌词内容)
  if (/^\[\d{1,2}:\d{2}\.\d+\]/m.test(text)) {
    const lines = text.split(/\r?\n/);
    const rawLrcItems: { time: number; text: string }[] = [];

    for (const line of lines) {
      const match = line.match(/^\[(\d{1,2}:\d{2}\.\d+)\](.*)$/);
      if (match) {
        const ms = parseTimeToMs(match[1]);
        const content = match[2].trim();
        if (content) {
          rawLrcItems.push({ time: ms, text: content });
        }
      }
    }

    rawLrcItems.sort((a, b) => a.time - b.time);

    // 为歌词构造开始与结束时间
    rawLrcItems.forEach((item, idx) => {
      const nextTime = rawLrcItems[idx + 1] ? rawLrcItems[idx + 1].time : item.time + 3500;
      cues.push({
        id: idx + 1,
        startTime: item.time,
        endTime: Math.max(item.time + 1000, nextTime),
        text: item.text,
      });
    });

    return cues;
  }

  // 2. 解析 SRT / VTT 格式
  // 标准分块模式：按两个或多个换行符分割
  const blocks = text.split(/\r?\n\r?\n+/);

  for (const block of blocks) {
    const lines = block.trim().split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // 寻找包含 --> 的时间轴行
    const timeLineIdx = lines.findIndex((l) => l.includes("-->"));
    if (timeLineIdx === -1) continue;

    const timeLine = lines[timeLineIdx];
    const [startStr, endStr] = timeLine.split("-->");
    if (!startStr || !endStr) continue;

    const startTime = parseTimeToMs(startStr.trim().split(" ")[0]);
    const endTime = parseTimeToMs(endStr.trim().split(" ")[0]);

    // 提取字幕文本行
    const textLines = lines.slice(timeLineIdx + 1);
    const content = textLines.join("\n");

    if (content.trim()) {
      cues.push({
        id: cues.length + 1,
        startTime,
        endTime: Math.max(startTime + 200, endTime),
        text: content,
      });
    }
  }

  return cues;
}

/**
 * 对字幕时间轴进行平移偏移与缩放调校
 */
export function adjustSubtitleTimeline(
  cues: SubtitleCue[],
  options: {
    offsetMs: number; // 毫秒平移偏移量 (+1500 或 -800)
    speedRatio: number; // 速度缩放比 (默认 1.0)
    cleanTags: boolean; // 是否清除样式标签
  }
): SubtitleCue[] {
  const { offsetMs = 0, speedRatio = 1.0, cleanTags = false } = options;

  return cues.map((cue, idx) => {
    let start = Math.max(0, Math.round(cue.startTime * speedRatio + offsetMs));
    let end = Math.max(start + 100, Math.round(cue.endTime * speedRatio + offsetMs));
    let content = cue.text;

    if (cleanTags) {
      content = stripSubtitleTags(content);
    }

    return {
      id: idx + 1,
      startTime: start,
      endTime: end,
      text: content,
    };
  });
}

/**
 * 转换为 SRT 格式
 */
export function exportToSrt(cues: SubtitleCue[]): string {
  return cues
    .map((cue, idx) => {
      const start = msToSrtTime(cue.startTime);
      const end = msToSrtTime(cue.endTime);
      return `${idx + 1}\n${start} --> ${end}\n${cue.text}`;
    })
    .join("\n\n");
}

/**
 * 转换为 VTT 格式 (WebVTT)
 */
export function exportToVtt(cues: SubtitleCue[]): string {
  const header = "WEBVTT\n\n";
  const body = cues
    .map((cue, idx) => {
      const start = msToVttTime(cue.startTime);
      const end = msToVttTime(cue.endTime);
      return `${idx + 1}\n${start} --> ${end}\n${cue.text}`;
    })
    .join("\n\n");
  return header + body;
}

/**
 * 转换为 LRC 歌词格式
 */
export function exportToLrc(cues: SubtitleCue[]): string {
  return cues
    .map((cue) => {
      const timeStr = msToLrcTime(cue.startTime);
      // LRC 歌词单行处理
      const singleLineText = cue.text.replace(/\r?\n/g, " ");
      return `${timeStr}${singleLineText}`;
    })
    .join("\n");
}

/**
 * 转换为 ASS 基础格式
 */
export function exportToAss(cues: SubtitleCue[], title: string = "Subtitles"): string {
  const header = `[Script Info]
Title: ${title}
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: None

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;

  const events = cues
    .map((cue) => {
      const start = msToAssTime(cue.startTime);
      const end = msToAssTime(cue.endTime);
      const assText = cue.text.replace(/\r?\n/g, "\\N");
      return `Dialogue: 0,${start},${end},Default,,0,0,0,,${assText}`;
    })
    .join("\n");

  return header + events;
}
