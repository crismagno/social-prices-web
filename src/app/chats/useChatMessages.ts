"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import { useInboxRealtime } from "../../data/context/socket/useInboxRealtime";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import AppsEnum from "../../shared/business/apps/apps.enum";
import {
  IInboxMessage,
  IInboxScope,
} from "../../shared/business/inbox/inbox.types";
import { mergeMessages } from "./chats-display";

const PAGE_SIZE: number = 50;
const POLL_MS: number = 5000;

// The timeline of one row of the list (a customer, or one person): the latest
// page, refreshed while it is open, and older pages on demand. `messages` is
// oldest first, the way a chat is read.
export const useChatMessages = (
  scope: IInboxScope | null,
): {
  messages: IInboxMessage[];
  hasOlder: boolean;
  isLoadingMessages: boolean;
  isLoadingOlder: boolean;
  loadOlder: () => Promise<void>;
  addMessage: (message: IInboxMessage) => void;
} => {
  const [messages, setMessages] = useState<IInboxMessage[]>([]);

  const [hasOlder, setHasOlder] = useState<boolean>(false);

  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);

  const [isLoadingOlder, setIsLoadingOlder] = useState<boolean>(false);

  const scopeKey: string | null = scope
    ? `${scope.customerId ?? ""}|${scope.conversationId ?? ""}`
    : null;

  // Answers that arrive after the user moved to another row are dropped.
  const currentScope = useRef<string | null>(null);

  const scopeRef = useRef<IInboxScope | null>(scope);

  scopeRef.current = scope;

  const fetchLatest = useCallback(
    async (silent: boolean): Promise<void> => {
      const wanted: IInboxScope | null = scopeRef.current;

      if (!wanted) {
        return;
      }

      try {
        if (!silent) {
          setIsLoadingMessages(true);
        }

        const page =
          await serviceMethodsInstance.inboxServiceMethods.getMessages(wanted, {
            limit: PAGE_SIZE,
          });

        if (currentScope.current !== scopeKey) {
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
        if (!silent && currentScope.current === scopeKey) {
          setIsLoadingMessages(false);
        }
      }
    },
    [scopeKey],
  );

  useEffect(() => {
    currentScope.current = scopeKey;

    setMessages([]);
    setHasOlder(false);

    if (scopeKey === null) {
      return;
    }

    fetchLatest(false);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchLatest(true);
      }
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [scopeKey, fetchLatest]);

  // Any channel says something changed (or the tab comes back): the open
  // timeline looks again. Which conversation it was does not matter here.
  useInboxRealtime(AppsEnum.App.TELEGRAM, () => fetchLatest(true));
  useInboxRealtime(AppsEnum.App.FACEBOOK, () => fetchLatest(true));
  useInboxRealtime(AppsEnum.App.INSTAGRAM, () => fetchLatest(true));

  const loadOlder = useCallback(async (): Promise<void> => {
    const wanted: IInboxScope | null = scopeRef.current;

    if (!wanted || messages.length === 0) {
      return;
    }

    try {
      setIsLoadingOlder(true);

      const page = await serviceMethodsInstance.inboxServiceMethods.getMessages(
        wanted,
        { limit: PAGE_SIZE, before: messages[0]._id },
      );

      if (currentScope.current !== scopeKey) {
        return;
      }

      setMessages((current) => mergeMessages(current, page));
      setHasOlder(page.length === PAGE_SIZE);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [scopeKey, messages]);

  const addMessage = useCallback((message: IInboxMessage): void => {
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
