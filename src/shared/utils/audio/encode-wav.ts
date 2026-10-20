// Messenger plays WAV, and a browser recording (WebM or MP4) it does not take.
// A voice needs little: 16 kHz mono keeps two minutes under 4 MB.
const SAMPLE_RATE: number = 16000;

const writeText = (view: DataView, offset: number, text: string): void => {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
};

export const encodeWav = async (recording: Blob): Promise<Blob> => {
  const context: AudioContext = new AudioContext();

  try {
    const decoded: AudioBuffer = await context.decodeAudioData(
      await recording.arrayBuffer(),
    );

    const source: Float32Array = decoded.getChannelData(0);

    // Linear resampling: plenty for speech.
    const length: number = Math.floor(
      (source.length * SAMPLE_RATE) / decoded.sampleRate,
    );

    const buffer: ArrayBuffer = new ArrayBuffer(44 + length * 2);
    const view: DataView = new DataView(buffer);

    writeText(view, 0, "RIFF");
    view.setUint32(4, 36 + length * 2, true);
    writeText(view, 8, "WAVE");
    writeText(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, SAMPLE_RATE, true);
    view.setUint32(28, SAMPLE_RATE * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeText(view, 36, "data");
    view.setUint32(40, length * 2, true);

    const ratio: number = decoded.sampleRate / SAMPLE_RATE;

    for (let i = 0; i < length; i++) {
      const position: number = i * ratio;
      const index: number = Math.floor(position);
      const next: number = Math.min(index + 1, source.length - 1);
      const sample: number =
        source[index] + (source[next] - source[index]) * (position - index);
      const clamped: number = Math.max(-1, Math.min(1, sample));

      view.setInt16(
        44 + i * 2,
        clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff,
        true,
      );
    }

    return new Blob([buffer], { type: "audio/wav" });
  } finally {
    await context.close();
  }
};
