"use client";

import { useEffect, useState } from "react";

import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import InboxEnum from "../../../shared/business/inbox/inbox.enum";
import { IInboxConversation } from "../../../shared/business/inbox/inbox.types";

// The channels a customer has talked through. A failure just means no chat
// button: the profile does not depend on it.
export const useCustomerChats = (
  customerId: string | undefined,
): InboxEnum.Channel[] => {
  const [channels, setChannels] = useState<InboxEnum.Channel[]>([]);

  useEffect(() => {
    if (!customerId) {
      return;
    }

    let isCurrent = true;

    serviceMethodsInstance.inboxServiceMethods
      .getCustomerSummary(customerId)
      .then((conversations: IInboxConversation[]) => {
        if (isCurrent) {
          setChannels(
            Array.from(
              new Set(
                conversations.map((conversation) => conversation.channel),
              ),
            ),
          );
        }
      })
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, [customerId]);

  return channels;
};
