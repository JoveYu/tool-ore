export interface AudioTrimOptions {
  startTime: number; // 秒
  endTime: number; // 秒
  fadeInDuration: number; // 秒
  fadeOutDuration: number; // 秒
  volume: number; // 0.1 ~ 2.0
}

export interface DecodedAudioInfo {
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  audioBuffer: AudioBuffer;
}

/**
 * 将 Web Audio API 的 AudioBuffer 编码并生成标准 WAV 格式二进制 Blob
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const outBuffer = new ArrayBuffer(length);
  const view = new DataView(outBuffer);
  const channels: Float32Array[] = [];
  let offset = 0;
  let pos = 0;

  function writeString(str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(pos++, str.charCodeAt(i));
    }
  }

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  // 写 WAV 头部
  writeString("RIFF");
  setUint32(length - 8);
  writeString("WAVE");
  writeString("fmt ");
  setUint32(16); // subchunk1size (16 for PCM)
  setUint16(1); // audio format (1 is PCM)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // byte rate
  setUint16(numOfChan * 2); // block align
  setUint16(16); // bits per sample
  writeString("data");
  setUint32(length - pos - 4);

  // 提取各声道 PCM 数据
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([outBuffer], { type: "audio/wav" });
}

/**
 * 在客户端 Canvas 绘制波形图
 */
export function drawWaveform(
  canvas: HTMLCanvasElement,
  audioBuffer: AudioBuffer,
  highlightRange?: { startPercent: number; endPercent: number }
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const data = audioBuffer.getChannelData(0);
  const step = Math.ceil(data.length / width);
  const amp = height / 2;

  ctx.clearRect(0, 0, width, height);

  // 1. 绘制背景高亮区域
  if (highlightRange) {
    const startX = highlightRange.startPercent * width;
    const endX = highlightRange.endPercent * width;
    ctx.fillStyle = "rgba(99, 102, 241, 0.15)";
    ctx.fillRect(startX, 0, endX - startX, height);
  }

  // 2. 绘制波形柱
  ctx.fillStyle = "#6366F1";

  for (let i = 0; i < width; i++) {
    let min = 1.0;
    let max = -1.0;
    for (let j = 0; j < step; j++) {
      const datum = data[i * step + j];
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }
    const barHeight = Math.max(2, (max - min) * amp);
    ctx.fillRect(i, amp - barHeight / 2, 1, barHeight);
  }
}

/**
 * 裁剪 AudioBuffer 并应用淡入淡出与音量调节
 */
export function trimAudioBuffer(
  audioCtx: AudioContext,
  sourceBuffer: AudioBuffer,
  options: AudioTrimOptions
): AudioBuffer {
  const sampleRate = sourceBuffer.sampleRate;
  const startSample = Math.floor(Math.max(0, options.startTime) * sampleRate);
  const endSample = Math.min(
    sourceBuffer.length,
    Math.floor(Math.max(options.startTime + 0.1, options.endTime) * sampleRate)
  );
  const trimLength = endSample - startSample;

  const trimmedBuffer = audioCtx.createBuffer(
    sourceBuffer.numberOfChannels,
    trimLength,
    sampleRate
  );

  const fadeInSamples = Math.floor(options.fadeInDuration * sampleRate);
  const fadeOutSamples = Math.floor(options.fadeOutDuration * sampleRate);

  for (let ch = 0; ch < sourceBuffer.numberOfChannels; ch++) {
    const srcData = sourceBuffer.getChannelData(ch);
    const dstData = trimmedBuffer.getChannelData(ch);

    for (let i = 0; i < trimLength; i++) {
      let sample = srcData[startSample + i] * options.volume;

      // 淡入
      if (i < fadeInSamples) {
        sample *= i / fadeInSamples;
      }

      // 淡出
      if (i > trimLength - fadeOutSamples) {
        sample *= (trimLength - i) / fadeOutSamples;
      }

      dstData[i] = sample;
    }
  }

  return trimmedBuffer;
}
