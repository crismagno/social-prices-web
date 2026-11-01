"use client";

import { useEffect, useRef } from "react";

// The channels show "typing…" for a few seconds only, so while the user keeps
// writing the signal is renewed, but never more often than this.
const RENEW_MS: number = 4000;

// Tells the person at the other end that the user is writing, while `text` has
// something in it. `send` is best effort: a failure is never worth a message.
export const useTypingSignal = (
  text: string,
  isEnabled: boolean,
  send: () => Promise<unknown>,
): void => {
  const lastSentAt = useRef<number>(0);

  // Always the latest function, without sending again on every render.
  const sender = useRef(send);

  useEffect(() => {
    sender.current = send;
  });

  useEffect(() => {
    if (!isEnabled || !text.trim()) {
      // Nothing written: the next keystroke signals at once.
      lastSentAt.current = 0;

      return;
    }

    const now: number = Date.now();

    if (now - lastSentAt.current < RENEW_MS) {
      return;
    }

    lastSentAt.current = now;

    sender.current().catch(() => undefined);
  }, [text, isEnabled]);
};
