"use client";

import { useCallback, useEffect, useState } from "react";

import { useStoreChatRealtime } from "../../../data/context/socket/useStoreChatRealtime";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";

const POLL_MS: number = 20000;

// What the account has not read on the store chat, for the menu's badge: the
// store's count for a company, the customer's own for a customer account. Kept
// fresh by the server's push and a slow refresh; a failure counts as nothing.
export const useStoreChatUnread = (
  side: "owner" | "customer" | null,
): number => {
  const [unread, setUnread] = useState<number>(0);

  const refetch = useCallback(async (): Promise<void> => {
    if (!side) {
      setUnread(0);

      return;
    }

    try {
      const methods = serviceMethodsInstance.storeChatServiceMethods;

      setUnread(
        side === "owner"
          ? await methods.countOwnerUnread()
          : await methods.countUnread(),
      );
    } catch {
      setUnread(0);
    }
  }, [side]);

  useEffect(() => {
    refetch();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        refetch();
      }
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [refetch]);

  useStoreChatRealtime(() => {
    refetch();
  });

  return unread;
};
