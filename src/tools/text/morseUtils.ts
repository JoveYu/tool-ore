export const MORSE_CODE_MAP: Record<string, string> = {
  // Letters
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",

  // Numbers
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",

  // Punctuation
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
  " ": "/",
};

const REVERSE_MORSE_MAP: Record<string, string> = {};
for (const [char, code] of Object.entries(MORSE_CODE_MAP)) {
  REVERSE_MORSE_MAP[code] = char;
}

/**
 * 文本编码为摩斯电码
 */
export function encodeToMorse(text: string): string {
  const clean = text.trim();
  if (!clean) return "";

  const words = clean.toUpperCase().split(/\s+/);
  const encodedWords = words.map((word) => {
    const chars = word.split("");
    const encodedChars = chars.map((ch) => MORSE_CODE_MAP[ch] || ch);
    return encodedChars.join(" ");
  });

  return encodedWords.join(" / ");
}

/**
 * 摩斯电码解码为普通文本
 */
export function decodeFromMorse(morse: string): string {
  const clean = morse.trim();
  if (!clean) return "";

  // 分词（按 / 或多空格拆分）
  const words = clean.split(/\s*\/\s*|\s{3,}/);
  const decodedWords = words.map((word) => {
    const symbols = word.trim().split(/\s+/);
    const decodedChars = symbols.map((sym) => REVERSE_MORSE_MAP[sym] || sym);
    return decodedChars.join("");
  });

  return decodedWords.join(" ");
}

/**
 * 使用 Web Audio API 播放摩斯电码音频序列
 */
export class MorseAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private stopFlag: boolean = false;

  public async play(
    morse: string,
    wpm: number = 20,
    frequency: number = 700,
    onProgress?: (charIndex: number) => void
  ): Promise<void> {
    if (typeof window === "undefined") return;

    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }

    if (this.audioCtx.state === "suspended") {
      await this.audioCtx.resume();
    }

    this.isPlaying = true;
    this.stopFlag = false;

    // 标准 PARIS 算法：1 个点单位（Dit）时长 = 1200 / WPM (ms)
    const dotDuration = (1200 / wpm) / 1000; // 秒
    const dashDuration = dotDuration * 3;
    const interElementGap = dotDuration;
    const interLetterGap = dotDuration * 3;
    const interWordGap = dotDuration * 7;

    const sleep = (s: number) =>
      new Promise((resolve) => setTimeout(resolve, s * 1000));

    const playTone = (duration: number) => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

      // 平滑淡入淡出防止爆音
      gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, this.audioCtx.currentTime + 0.005);
      gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + duration - 0.005);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    };

    for (let i = 0; i < morse.length; i++) {
      if (this.stopFlag) break;
      if (onProgress) onProgress(i);

      const symbol = morse[i];

      if (symbol === ".") {
        playTone(dotDuration);
        await sleep(dotDuration + interElementGap);
      } else if (symbol === "-") {
        playTone(dashDuration);
        await sleep(dashDuration + interElementGap);
      } else if (symbol === " ") {
        await sleep(interLetterGap);
      } else if (symbol === "/") {
        await sleep(interWordGap);
      }
    }

    this.isPlaying = false;
  }

  public stop(): void {
    this.stopFlag = true;
    this.isPlaying = false;
  }
}
