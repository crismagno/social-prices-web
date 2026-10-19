import { Mp3Encoder } from "@breezystack/lamejs";

const BITRATE_KBPS: number = 64;
const FRAME_SIZE: number = 1152;

// Browsers record WebM or MP4, which Telegram does not take as a voice message;
// MP3 it does. A voice is mono, so this stays small.
export const encodeMp3 = async (recording: Blob): Promise<Blob> => {
  const context: AudioContext = new AudioContext();

  try {
    const decoded: AudioBuffer = await context.decodeAudioData(
      await recording.arrayBuffer(),
    );

    const samples: Float32Array = decoded.getChannelData(0);

    const pcm: Int16Array = new Int16Array(samples.length);

    for (let i = 0; i < samples.length; i++) {
      const sample: number = Math.max(-1, Math.min(1, samples[i]));

      pcm[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }

    const encoder: Mp3Encoder = new Mp3Encoder(
      1,
      decoded.sampleRate,
      BITRATE_KBPS,
    );

    const parts: Uint8Array[] = [];

    for (let i = 0; i < pcm.length; i += FRAME_SIZE) {
      const chunk: Uint8Array = encoder.encodeBuffer(
        pcm.subarray(i, i + FRAME_SIZE),
      );

      if (chunk.length) {
        parts.push(chunk);
      }
    }

    parts.push(encoder.flush());

    return new Blob(parts as BlobPart[], { type: "audio/mpeg" });
  } finally {
    await context.close();
  }
};
