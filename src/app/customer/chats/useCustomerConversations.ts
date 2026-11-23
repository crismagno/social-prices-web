"use client";

import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useAuthData from "../../../data/context/auth/useAuthData";
import { useStoreChatRealtime } from "../../../data/context/socket/useStoreChatRealtime";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IStoreChatConversation } from "../../../shared/business/store-chat/store-chat.types";

const POLL_MS: number = 8000;

// The customer account's conversations with stores, most recent first. Refreshed
// at once when the server says something changed, and every few seconds while
// the page is visible. Only the first load complains about a failure.
export const useCustomerConversations = (): {
  conversations: IStoreChatConversation[];
  isLoading: boolean;
  refetch: (silent?: boolean) => Promise<void>;
} => {
  const [conversations, setConversations] = useState<IStoreChatConversation[]>(
    [],
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Nothing is asked before there is a session: a visitor who arrives here
  // logged out (from a store's site, say) is on the way to the login.
  const { authToken } = useAuthData();

  const refetch = useCallback(async (silent: boolean = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }

      setConversations(
        await serviceMethodsInstance.storeChatServiceMethods.listConversations(),
      );
    } catch (error: any) {
      if (!silent) {
        handleClientError(error);
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!authToken) {
      return;
    }

    refetch();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        refetch(true);
      }
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [refetch, authToken]);

  useStoreChatRealtime(() => {
    refetch(true);
  });

  return { conversations, isLoading, refetch };
};
