"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AppsRealtimeEvents } from "../../../shared/business/apps/apps-realtime.events";
import { IStoreChatUpdatedEvent } from "../../../shared/business/store-chat/store-chat.types";
import useSocketData from "./useSocketData";

// The other side renews its signal every few seconds while it writes; with no
// renewal for this long it has stopped.
const VISIBLE_MS: number = 6000;

// Whether the other side of a store chat is writing right now. `isAbout` says
// which conversations this screen cares about. `clear` hides it at once: a
// message that arrived is the end of the writing.
export const useStoreChatTyping = (
  isAbout: (event: IStoreChatUpdatedEvent) => boolean,
): { isTyping: boolean; clear: () => void } => {
  const { socket } = useSocketData();

  const [isTyping, setIsTyping] = useState<boolean>(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Always the latest function, without resubscribing on every render.
  const matcher = useRef(isAbout);

  useEffect(() => {
    matcher.current = isAbout;
  });

  const clear = useCallback((): void => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    setIsTyping(false);
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const onTyping = (event: IStoreChatUpdatedEvent): void => {
      if (!event || !matcher.current(event)) {
        return;
      }

      setIsTyping(true);

      if (timer.current) {
        clearTimeout(timer.current);
      }

      timer.current = setTimeout(clear, VISIBLE_MS);
    };

    socket.on(AppsRealtimeEvents.STORE_CHAT_TYPING, onTyping);

    return () => {
      socket.off(AppsRealtimeEvents.STORE_CHAT_TYPING, onTyping);

      clear();
    };
  }, [socket, clear]);

  return { isTyping, clear };
};

// The same signal for a list of conversations: which of them have the other
// side writing right now. `keyOf` names the row an event belongs to (the
// conversation in the stores' list, the store in the customer's). A row stops
// when its signal is not renewed, or as soon as something changes in that
// conversation: the message that was being written arrived.
export const useStoreChatTypingKeys = (
  keyOf: (event: IStoreChatUpdatedEvent) => string,
): Set<string> => {
  const { socket } = useSocketData();

  const [typingKeys, setTypingKeys] = useState<Set<string>>(new Set());

  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Always the latest function, without resubscribing on every render.
  const namer = useRef(keyOf);

  useEffect(() => {
    namer.current = keyOf;
  });

  useEffect(() => {
    if (!socket) {
      return;
    }

    const pending: Map<string, ReturnType<typeof setTimeout>> = timers.current;

    const stop = (key: string): void => {
      const timer = pending.get(key);

      if (timer) {
        clearTimeout(timer);
        pending.delete(key);
      }

      setTypingKeys((current: Set<string>) => {
        if (!current.has(key)) {
          return current;
        }

        const next: Set<string> = new Set(current);

        next.delete(key);

        return next;
      });
    };

    const onTyping = (event: IStoreChatUpdatedEvent): void => {
      if (!event) {
        return;
      }

      const key: string = namer.current(event);

      const timer = pending.get(key);

      if (timer) {
        clearTimeout(timer);
      }

      pending.set(
        key,
        setTimeout(() => stop(key), VISIBLE_MS),
      );

      setTypingKeys((current: Set<string>) =>
        current.has(key) ? current : new Set(current).add(key),
      );
    };

    const onUpdated = (event: IStoreChatUpdatedEvent): void => {
      if (event) {
        stop(namer.current(event));
      }
    };

    socket.on(AppsRealtimeEvents.STORE_CHAT_TYPING, onTyping);
    socket.on(AppsRealtimeEvents.STORE_CHAT_UPDATED, onUpdated);

    return () => {
      socket.off(AppsRealtimeEvents.STORE_CHAT_TYPING, onTyping);
      socket.off(AppsRealtimeEvents.STORE_CHAT_UPDATED, onUpdated);

      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();

      setTypingKeys(new Set());
    };
  }, [socket]);

  return typingKeys;
};
