"use client";

import { useEffect, useRef } from "react";

import { AppsRealtimeEvents } from "../../../shared/business/apps/apps-realtime.events";
import { IStoreChatUpdatedEvent } from "../../../shared/business/store-chat/store-chat.types";
import useSocketData from "./useSocketData";

// A screen that read or wrote says so, for the badges of the same tab to follow.
const LOCAL_EVENT: string = "store-chat:local-change";

export const announceStoreChatChange = (): void => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(LOCAL_EVENT));
  }
};

// Runs `onChange` the moment a store chat of this account changes: the server
// pushes it. It also runs when the tab becomes visible again (a hidden tab may
// have missed pushes) and when this tab itself read or wrote; the event is null
// for those.
export const useStoreChatRealtime = (
  onChange: (event: IStoreChatUpdatedEvent | null) => void,
): void => {
  const { socket } = useSocketData();

  // Always the latest function, without resubscribing on every render.
  const handler = useRef(onChange);

  useEffect(() => {
    handler.current = onChange;
  });

  useEffect(() => {
    const onVisible = (): void => {
      if (document.visibilityState === "visible") {
        handler.current(null);
      }
    };

    const onLocal = (): void => handler.current(null);

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener(LOCAL_EVENT, onLocal);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener(LOCAL_EVENT, onLocal);
    };
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const onUpdated = (event: IStoreChatUpdatedEvent): void => {
      handler.current(event ?? null);
    };

    socket.on(AppsRealtimeEvents.STORE_CHAT_UPDATED, onUpdated);

    return () => {
      socket.off(AppsRealtimeEvents.STORE_CHAT_UPDATED, onUpdated);
    };
  }, [socket]);
};
