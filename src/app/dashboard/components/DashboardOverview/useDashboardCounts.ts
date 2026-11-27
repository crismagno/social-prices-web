import { useEffect, useState } from "react";

import handleClientError from "../../../../components/common/HandleClientError/HandleClientError";
import { serviceMethodsInstance } from "../../../../services/social-prices-api/service-methods";
import InboxEnum from "../../../../shared/business/inbox/inbox.enum";
import { IInboxChat } from "../../../../shared/business/inbox/inbox.types";

interface ICounts {
  count: number;
  /** Those still waiting for something from the store. */
  pending: number;
}

interface ICountsState extends ICounts {
  isLoading: boolean;
}

/** Numbers asked once, when the dashboard opens. */
const useCounts = (ask: () => Promise<ICounts>): ICountsState => {
  const [counts, setCounts] = useState<ICounts>({ count: 0, pending: 0 });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCurrent: boolean = true;

    ask()
      .then((value: ICounts) => isCurrent && setCounts(value))
      .catch(handleClientError)
      .finally(() => isCurrent && setIsLoading(false));

    return () => {
      isCurrent = false;
    };
    // Asked once: the question never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isLoading, ...counts };
};

/** The sales of the account, and those not completed yet. */
export const useCountSalesByUser = (): ICountsState =>
  useCounts(async () => {
    const [count, pending] = await Promise.all([
      serviceMethodsInstance.salesServiceMethods.countByUser(),
      serviceMethodsInstance.salesServiceMethods.countPendingByUser(),
    ]);

    return { count, pending };
  });

// Waiting for the store: unread, or the person wrote last. One set aside is
// not waiting until the person writes again.
const isPendingChat = (chat: IInboxChat): boolean =>
  !chat.isInLimbo &&
  (chat.unreadCount > 0 ||
    chat.lastMessageDirection === InboxEnum.Direction.IN);

/** The conversations of the inbox, of every channel, and those waiting. */
export const useCountChats = (): ICountsState =>
  useCounts(async () => {
    const chats: IInboxChat[] =
      await serviceMethodsInstance.inboxServiceMethods.listChats();

    return { count: chats.length, pending: chats.filter(isPendingChat).length };
  });

/** The units the account sold, over every sale that counts. */
export const useCountProductsSold = (): ICountsState =>
  useCounts(async () => ({
    count:
      await serviceMethodsInstance.salesServiceMethods.countProductsSoldByUser(),
    pending: 0,
  }));
