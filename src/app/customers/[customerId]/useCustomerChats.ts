"use client";

import { useEffect, useState } from "react";

import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IInboxConversation } from "../../../shared/business/inbox/inbox.types";

// The conversations a customer has, on any channel. A failure just means no chat
// button: the profile does not depend on it.
export const useCustomerChats = (
  customerId: string | undefined,
): IInboxConversation[] => {
  const [conversations, setConversations] = useState<IInboxConversation[]>([]);

  useEffect(() => {
    if (!customerId) {
      return;
    }

    let isCurrent = true;

    serviceMethodsInstance.inboxServiceMethods
      .getCustomerSummary(customerId)
      .then((found: IInboxConversation[]) => {
        if (isCurrent) {
          setConversations(found);
        }
      })
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, [customerId]);

  return conversations;
};
