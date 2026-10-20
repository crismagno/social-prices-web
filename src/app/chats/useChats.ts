"use client";

import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import { useInboxRealtime } from "../../data/context/socket/useInboxRealtime";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import AppsEnum from "../../shared/business/apps/apps.enum";
import { IInboxChat } from "../../shared/business/inbox/inbox.types";

const POLL_MS: number = 8000;

// The central list, refreshed every few seconds while the page is open and
// visible, and at once when any channel says something changed. A failed refresh
// in the background stays quiet: only the first load complains.
export const useChats = (): {
  chats: IInboxChat[];
  isLoadingChats: boolean;
  refetchChats: (silent?: boolean) => Promise<void>;
} => {
  const [chats, setChats] = useState<IInboxChat[]>([]);

  const [isLoadingChats, setIsLoadingChats] = useState<boolean>(false);

  const refetchChats = useCallback(async (silent: boolean = false) => {
    try {
      if (!silent) {
        setIsLoadingChats(true);
      }

      setChats(await serviceMethodsInstance.inboxServiceMethods.listChats());
    } catch (error: any) {
      if (!silent) {
        handleClientError(error);
      }
    } finally {
      if (!silent) {
        setIsLoadingChats(false);
      }
    }
  }, []);

  useEffect(() => {
    refetchChats();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        refetchChats(true);
      }
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [refetchChats]);

  useInboxRealtime(AppsEnum.App.TELEGRAM, () => refetchChats(true));
  useInboxRealtime(AppsEnum.App.FACEBOOK, () => refetchChats(true));
  useInboxRealtime(AppsEnum.App.INSTAGRAM, () => refetchChats(true));

  return { chats, isLoadingChats, refetchChats };
};
