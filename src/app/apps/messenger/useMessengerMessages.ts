"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { useInboxRealtime } from "../../../data/context/socket/useInboxRealtime";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import AppsEnum from "../../../shared/business/apps/apps.enum";
import { IMessengerMessage } from "../../../shared/business/apps/messenger/messenger.types";
import { mergeMessages } from "./messenger-display";

const PAGE_SIZE: number = 50;
const POLL_MS: number = 5000;

// One conversation: the latest page, refreshed while it is open, and older
// pages on demand. `messages` is oldest first, the way a chat is read.
export const useMessengerMessages = (
  psid: string | null,
): {
  messages: IMessengerMessage[];
  hasOlder: boolean;
  isLoadingMessages: boolean;
  isLoadingOlder: boolean;
  loadOlder: () => Promise<void>;
  addMessage: (message: IMessengerMessage) => void;
  removeMessage: (messageId: string) => void;
} => {
  const [messages, setMessages] = useState<IMessengerMessage[]>([]);

  const [hasOlder, setHasOlder] = useState<boolean>(false);

  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);

  const [isLoadingOlder, setIsLoadingOlder] = useState<boolean>(false);

  // Answers that arrive after the user moved to another conversation are dropped.
  const currentChat = useRef<string | null>(null);

  const fetchLatest = useCallback(
    async (silent: boolean): Promise<void> => {
      if (psid === null) {
        return;
      }

      try {
        if (!silent) {
          setIsLoadingMessages(true);
        }

        const page =
          await serviceMethodsInstance.messengerServiceMethods.getChatMessages(
            psid,
            { limit: PAGE_SIZE },
          );

        if (currentChat.current !== psid) {
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
        if (!silent && currentChat.current === psid) {
          setIsLoadingMessages(false);
        }
      }
    },
    [psid],
  );

  useEffect(() => {
    currentChat.current = psid;

    setMessages([]);
    setHasOlder(false);

    if (psid === null) {
      return;
    }

    fetchLatest(false);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchLatest(true);
      }
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [psid, fetchLatest]);

  // A message of the open conversation arrives (or the tab comes back): it
  // shows at once. Other conversations are the list's business.
  useInboxRealtime(AppsEnum.App.FACEBOOK, (key) => {
    if (psid !== null && (key === null || key === psid)) {
      fetchLatest(true);
    }
  });

  const loadOlder = useCallback(async (): Promise<void> => {
    if (psid === null || messages.length === 0) {
      return;
    }

    try {
      setIsLoadingOlder(true);

      const page =
        await serviceMethodsInstance.messengerServiceMethods.getChatMessages(
          psid,
          { limit: PAGE_SIZE, before: messages[0]._id },
        );

      if (currentChat.current !== psid) {
        return;
      }

      setMessages((current) => mergeMessages(current, page));
      setHasOlder(page.length === PAGE_SIZE);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [psid, messages]);

  const addMessage = useCallback((message: IMessengerMessage): void => {
    setMessages((current) => mergeMessages(current, [message]));
  }, []);

  const removeMessage = useCallback((messageId: string): void => {
    setMessages((current) =>
      current.filter((message) => message._id !== messageId),
    );
  }, []);

  return {
    messages,
    hasOlder,
    isLoadingMessages,
    isLoadingOlder,
    loadOlder,
    addMessage,
    removeMessage,
  };
};
