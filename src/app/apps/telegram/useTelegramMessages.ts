"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { useInboxRealtime } from "../../../data/context/socket/useInboxRealtime";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import AppsEnum from "../../../shared/business/apps/apps.enum";
import { ITelegramMessage } from "../../../shared/business/apps/telegram/telegram.types";
import { mergeMessages } from "./telegram-display";

const PAGE_SIZE: number = 50;
const POLL_MS: number = 5000;

// One conversation: the latest page, refreshed while it is open, and older
// pages on demand. `messages` is oldest first, the way a chat is read.
export const useTelegramMessages = (
  chatId: number | null,
): {
  messages: ITelegramMessage[];
  hasOlder: boolean;
  isLoadingMessages: boolean;
  isLoadingOlder: boolean;
  loadOlder: () => Promise<void>;
  addMessage: (message: ITelegramMessage) => void;
  removeMessage: (messageId: string) => void;
} => {
  const [messages, setMessages] = useState<ITelegramMessage[]>([]);

  const [hasOlder, setHasOlder] = useState<boolean>(false);

  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);

  const [isLoadingOlder, setIsLoadingOlder] = useState<boolean>(false);

  // Answers that arrive after the user moved to another conversation are dropped.
  const currentChat = useRef<number | null>(null);

  const fetchLatest = useCallback(
    async (silent: boolean): Promise<void> => {
      if (chatId === null) {
        return;
      }

      try {
        if (!silent) {
          setIsLoadingMessages(true);
        }

        const page =
          await serviceMethodsInstance.telegramServiceMethods.getChatMessages(
            chatId,
            { limit: PAGE_SIZE },
          );

        if (currentChat.current !== chatId) {
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
        if (!silent && currentChat.current === chatId) {
          setIsLoadingMessages(false);
        }
      }
    },
    [chatId],
  );

  useEffect(() => {
    currentChat.current = chatId;

    setMessages([]);
    setHasOlder(false);

    if (chatId === null) {
      return;
    }

    fetchLatest(false);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchLatest(true);
      }
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [chatId, fetchLatest]);

  // A message of the open conversation arrives (or the tab comes back): it
  // shows at once. Other conversations are the list's business.
  useInboxRealtime(AppsEnum.App.TELEGRAM, (key) => {
    if (chatId !== null && (key === null || key === String(chatId))) {
      fetchLatest(true);
    }
  });

  const loadOlder = useCallback(async (): Promise<void> => {
    if (chatId === null || messages.length === 0) {
      return;
    }

    try {
      setIsLoadingOlder(true);

      const page =
        await serviceMethodsInstance.telegramServiceMethods.getChatMessages(
          chatId,
          { limit: PAGE_SIZE, before: messages[0]._id },
        );

      if (currentChat.current !== chatId) {
        return;
      }

      setMessages((current) => mergeMessages(current, page));
      setHasOlder(page.length === PAGE_SIZE);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [chatId, messages]);

  const addMessage = useCallback((message: ITelegramMessage): void => {
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
