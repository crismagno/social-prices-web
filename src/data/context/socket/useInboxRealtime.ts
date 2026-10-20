"use client";

import { useEffect, useRef } from "react";

import AppsEnum from "../../../shared/business/apps/apps.enum";
import {
  AppsRealtimeEvents,
  IInboxUpdatedEvent,
} from "../../../shared/business/apps/apps-realtime.events";
import useSocketData from "./useSocketData";

// Runs `onChange` the moment something changes in the inbox of `app`: the server
// pushes it, so a new message shows without waiting for the next refresh. It also
// runs when the tab becomes visible again, since a hidden tab pauses its timers
// and may have missed pushes. `chatKey` is null for that last case.
export const useInboxRealtime = (
  app: AppsEnum.App,
  onChange: (chatKey: string | null) => void,
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

    document.addEventListener("visibilitychange", onVisible);

    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const onUpdated = (event: IInboxUpdatedEvent): void => {
      if (event?.app === app) {
        handler.current(event.chatKey ?? null);
      }
    };

    socket.on(AppsRealtimeEvents.INBOX_UPDATED, onUpdated);

    return () => {
      socket.off(AppsRealtimeEvents.INBOX_UPDATED, onUpdated);
    };
  }, [socket, app]);
};
