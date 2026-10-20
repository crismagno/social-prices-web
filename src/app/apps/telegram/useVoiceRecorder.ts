"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { encodeMp3 } from "../../../shared/utils/audio/encode-mp3";
import { encodeWav } from "../../../shared/utils/audio/encode-wav";

// Telegram shows a voice message with its length; a minute is plenty for a reply.
export const MAX_RECORDING_SECONDS: number = 120;

export type RecorderState = "idle" | "recording" | "encoding";

interface IVoiceRecorder {
  state: RecorderState;
  seconds: number;
  start: () => Promise<void>;
  // Resolves the recording as an MP3 file, or null when nothing was recorded.
  finish: () => Promise<File | null>;
  cancel: () => void;
}

export type RecordingFormat = "mp3" | "wav";

// Records the microphone and hands the result back as a file of the format the
// app that sends it accepts: Telegram takes MP3, Messenger plays WAV.
export function useVoiceRecorder(
  onError: (error: unknown) => void,
  format: RecordingFormat = "mp3",
): IVoiceRecorder {
  const [state, setState] = useState<RecorderState>("idle");

  const [seconds, setSeconds] = useState<number>(0);

  const recorderRef = useRef<MediaRecorder | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const chunksRef = useRef<Blob[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const release = useCallback((): void => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stopping the tracks is what turns the browser's "recording" light off.
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
  }, []);

  useEffect(() => release, [release]);

  const start = useCallback(async (): Promise<void> => {
    try {
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder: MediaRecorder = new MediaRecorder(stream);

      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event: BlobEvent): void => {
        if (event.data.size) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.start();

      setSeconds(0);
      setState("recording");

      timerRef.current = setInterval(
        () => setSeconds((value) => value + 1),
        1000,
      );
    } catch (error: unknown) {
      release();
      setState("idle");
      onError(error);
    }
  }, [onError, release]);

  const cancel = useCallback((): void => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.onstop = null;
      recorderRef.current.stop();
    }

    release();
    setState("idle");
  }, [release]);

  const finish = useCallback(async (): Promise<File | null> => {
    const recorder: MediaRecorder | null = recorderRef.current;

    if (!recorder || recorder.state !== "recording") {
      return null;
    }

    setState("encoding");

    const stopped: Promise<Blob> = new Promise((resolve) => {
      recorder.onstop = () =>
        resolve(new Blob(chunksRef.current, { type: recorder.mimeType }));
    });

    recorder.stop();

    try {
      const recording: Blob = await stopped;

      release();

      if (!recording.size) {
        return null;
      }

      if (format === "wav") {
        return new File([await encodeWav(recording)], "voice.wav", {
          type: "audio/wav",
        });
      }

      return new File([await encodeMp3(recording)], "voice.mp3", {
        type: "audio/mpeg",
      });
    } catch (error: unknown) {
      onError(error);

      return null;
    } finally {
      release();
      setState("idle");
    }
  }, [onError, release, format]);

  return { state, seconds, start, finish, cancel };
}
