"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import {
  announceStoreChatChange,
  useStoreChatRealtime,
} from "../../../data/context/socket/useStoreChatRealtime";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import {
  IStoreChatMessage,
  IStoreChatStoreCard,
  IStoreChatUpdatedEvent,
} from "../../../shared/business/store-chat/store-chat.types";

const POLL_MS: number = 8000;

// What the API gives per page.
const PAGE_SIZE: number = 50;

// Oldest first, each message once.
const merge = (
  current: IStoreChatMessage[],
  page: IStoreChatMessage[],
): IStoreChatMessage[] => {
  const byId: Map<string, IStoreChatMessage> = new Map();

  [...current, ...page].forEach((message: IStoreChatMessage) =>
    byId.set(message._id, message),
  );

  return Array.from(byId.values()).sort(
    (a: IStoreChatMessage, b: IStoreChatMessage) =>
      new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime() ||
      a._id.localeCompare(b._id),
  );
};

// The thread with one store. `store` is null when the store can no longer be
// talked to (or never existed): its history, if any, still shows.
export const useCustomerThread = (
  storeId: string,
): {
  store: IStoreChatStoreCard | null;
  messages: IStoreChatMessage[];
  isLoading: boolean;
  hasOlder: boolean;
  isLoadingOlder: boolean;
  isSending: boolean;
  loadOlder: () => Promise<void>;
  send: (text: string) => Promise<boolean>;
} => {
  const [store, setStore] = useState<IStoreChatStoreCard | null>(null);

  const [messages, setMessages] = useState<IStoreChatMessage[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [hasOlder, setHasOlder] = useState<boolean>(false);

  const [isLoadingOlder, setIsLoadingOlder] = useState<boolean>(false);

  const [isSending, setIsSending] = useState<boolean>(false);

  // A slow answer for a store the customer already left must not land here.
  const current = useRef<string>(storeId);

  const messagesRef = useRef<IStoreChatMessage[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Reading is told to the server once per batch of the store's new messages.
  const markRead = useCallback(async (): Promise<void> => {
    try {
      await serviceMethodsInstance.storeChatServiceMethods.markRead(storeId);

      announceStoreChatChange();
    } catch {
      // The badge just stays a little longer.
    }
  }, [storeId]);

  const fetchLatest = useCallback(
    async (silent: boolean): Promise<void> => {
      try {
        const page: IStoreChatMessage[] =
          await serviceMethodsInstance.storeChatServiceMethods.listMessages(
            storeId,
          );

        if (current.current !== storeId) {
          return;
        }

        const known: Set<string> = new Set(
          messagesRef.current.map((message: IStoreChatMessage) => message._id),
        );

        const hasNewFromStore: boolean = page.some(
          (message: IStoreChatMessage) =>
            !message.fromMe && !known.has(message._id),
        );

        setMessages((existing) => merge(existing, page));

        if (!silent) {
          setHasOlder(page.length >= PAGE_SIZE);
        }

        if (hasNewFromStore) {
          markRead();
        }
      } catch (error: any) {
        // A store that is gone and left no history is told by `store` being null.
        if (!silent && error?.response?.status !== 404) {
          handleClientError(error);
        }
      }
    },
    [storeId, markRead],
  );

  useEffect(() => {
    current.current = storeId;

    setStore(null);
    setMessages([]);
    setHasOlder(false);
    setIsLoading(true);

    const load = async (): Promise<void> => {
      const card: IStoreChatStoreCard | null =
        await serviceMethodsInstance.storeChatServiceMethods
          .findStore(storeId)
          .catch(() => null);

      if (current.current !== storeId) {
        return;
      }

      setStore(card);

      await fetchLatest(false);

      if (current.current === storeId) {
        setIsLoading(false);
      }
    };

    load();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchLatest(true);
      }
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [storeId, fetchLatest]);

  useStoreChatRealtime((event: IStoreChatUpdatedEvent | null) => {
    if (!event || event.storeId === storeId) {
      fetchLatest(true);
    }
  });

  const loadOlder = useCallback(async (): Promise<void> => {
    const oldest: IStoreChatMessage | undefined = messagesRef.current[0];

    if (!oldest) {
      return;
    }

    try {
      setIsLoadingOlder(true);

      const page: IStoreChatMessage[] =
        await serviceMethodsInstance.storeChatServiceMethods.listMessages(
          storeId,
          oldest._id,
        );

      if (current.current !== storeId) {
        return;
      }

      setMessages((existing) => merge(existing, page));
      setHasOlder(page.length >= PAGE_SIZE);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [storeId]);

  // True when it was sent. A refusal is thrown for the screen to explain.
  const send = useCallback(
    async (text: string): Promise<boolean> => {
      const body: string = text.trim();

      if (!body) {
        return false;
      }

      try {
        setIsSending(true);

        const sent: IStoreChatMessage =
          await serviceMethodsInstance.storeChatServiceMethods.send(
            storeId,
            body,
          );

        if (current.current === storeId) {
          setMessages((existing) => merge(existing, [sent]));
        }

        announceStoreChatChange();

        return true;
      } finally {
        setIsSending(false);
      }
    },
    [storeId],
  );

  return {
    store,
    messages,
    isLoading,
    hasOlder,
    isLoadingOlder,
    isSending,
    loadOlder,
    send,
  };
};
