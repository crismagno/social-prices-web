"use client";

import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IMessengerChat } from "../../../shared/business/apps/messenger/messenger.types";

const POLL_MS: number = 8000;

// The inbox, refreshed every few seconds while the page is open and visible.
// A failed refresh in the background stays quiet: only the first load complains.
export const useMessengerChats = (
  isEnabled: boolean,
): {
  chats: IMessengerChat[];
  isLoadingChats: boolean;
  refetchChats: (silent?: boolean) => Promise<void>;
} => {
  const [chats, setChats] = useState<IMessengerChat[]>([]);

  const [isLoadingChats, setIsLoadingChats] = useState<boolean>(false);

  const refetchChats = useCallback(
    async (silent: boolean = false) => {
      if (!isEnabled) {
        return;
      }

      try {
        if (!silent) {
          setIsLoadingChats(true);
        }

        setChats(
          await serviceMethodsInstance.messengerServiceMethods.listChats(),
        );
      } catch (error: any) {
        if (!silent) {
          handleClientError(error);
        }
      } finally {
        if (!silent) {
          setIsLoadingChats(false);
        }
      }
    },
    [isEnabled],
  );

  useEffect(() => {
    refetchChats();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        refetchChats(true);
      }
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [refetchChats]);

  return { chats, isLoadingChats, refetchChats };
};
