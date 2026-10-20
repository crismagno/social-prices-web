"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { useInboxRealtime } from "../../../data/context/socket/useInboxRealtime";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import AppsEnum from "../../../shared/business/apps/apps.enum";
import { IInstagramMessage } from "../../../shared/business/apps/instagram/instagram.types";
import { mergeMessages } from "./instagram-display";

const PAGE_SIZE: number = 50;
const POLL_MS: number = 5000;

// One conversation: the latest page, refreshed while it is open, and older
// pages on demand. `messages` is oldest first, the way a chat is read.
export const useInstagramMessages = (
  igsid: string | null,
): {
  messages: IInstagramMessage[];
  hasOlder: boolean;
  isLoadingMessages: boolean;
  isLoadingOlder: boolean;
  loadOlder: () => Promise<void>;
  addMessage: (message: IInstagramMessage) => void;
} => {
  const [messages, setMessages] = useState<IInstagramMessage[]>([]);

  const [hasOlder, setHasOlder] = useState<boolean>(false);

  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);

  const [isLoadingOlder, setIsLoadingOlder] = useState<boolean>(false);

  // Answers that arrive after the user moved to another conversation are dropped.
  const currentChat = useRef<string | null>(null);

  const fetchLatest = useCallback(
    async (silent: boolean): Promise<void> => {
      if (igsid === null) {
        return;
      }

      try {
        if (!silent) {
          setIsLoadingMessages(true);
        }

        const page =
          await serviceMethodsInstance.instagramServiceMethods.getChatMessages(
            igsid,
            { limit: PAGE_SIZE },
          );

        if (currentChat.current !== igsid) {
          return;
        }

        setMessages((current) => mergeMessages(current, page));

        if (!silent) {
          setHasOlder(page.length === PAGE_SIZE);
        }
      } catch (error: any) {
        if (!silent) {
          handleClientError(error);
        }
      } finally {
        if (!silent && currentChat.current === igsid) {
          setIsLoadingMessages(false);
        }
      }
    },
    [igsid],
  );

  useEffect(() => {
    currentChat.current = igsid;

    setMessages([]);
    setHasOlder(false);

    if (igsid === null) {
      return;
    }

    fetchLatest(false);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchLatest(true);
      }
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [igsid, fetchLatest]);

  // A message of the open conversation arrives (or the tab comes back): it
  // shows at once. Other conversations are the list's business.
  useInboxRealtime(AppsEnum.App.INSTAGRAM, (key) => {
    if (igsid !== null && (key === null || key === igsid)) {
      fetchLatest(true);
    }
  });

  const loadOlder = useCallback(async (): Promise<void> => {
    if (igsid === null || messages.length === 0) {
      return;
    }

    try {
      setIsLoadingOlder(true);

      const page =
        await serviceMethodsInstance.instagramServiceMethods.getChatMessages(
          igsid,
          { limit: PAGE_SIZE, before: messages[0]._id },
        );

      if (currentChat.current !== igsid) {
        return;
      }

      setMessages((current) => mergeMessages(current, page));
      setHasOlder(page.length === PAGE_SIZE);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [igsid, messages]);

  const addMessage = useCallback((message: IInstagramMessage): void => {
    setMessages((current) => mergeMessages(current, [message]));
  }, []);

  return {
    messages,
    hasOlder,
    isLoadingMessages,
    isLoadingOlder,
    loadOlder,
    addMessage,
  };
};
