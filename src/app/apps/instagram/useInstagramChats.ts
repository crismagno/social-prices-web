"use client";

import { useCallback, useEffect, useState } from "react";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { useInboxRealtime } from "../../../data/context/socket/useInboxRealtime";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import AppsEnum from "../../../shared/business/apps/apps.enum";
import { IInstagramChat } from "../../../shared/business/apps/instagram/instagram.types";

const POLL_MS: number = 8000;

// The inbox, refreshed every few seconds while the page is open and visible.
// A failed refresh in the background stays quiet: only the first load complains.
export const useInstagramChats = (
  isEnabled: boolean,
): {
  chats: IInstagramChat[];
  isLoadingChats: boolean;
  refetchChats: (silent?: boolean) => Promise<void>;
} => {
  const [chats, setChats] = useState<IInstagramChat[]>([]);

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
          await serviceMethodsInstance.instagramServiceMethods.listChats(),
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

  // A message arrives, is read or is sent elsewhere: the list follows at once.
  useInboxRealtime(AppsEnum.App.INSTAGRAM, () => {
    refetchChats(true);
  });

  return { chats, isLoadingChats, refetchChats };
};
