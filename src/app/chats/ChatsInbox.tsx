"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Card, Grid, theme } from "antd";
import { useSearchParams } from "next/navigation";

import useAuthData from "../../data/context/auth/useAuthData";
import EmployeesEnum from "../../shared/business/employees/employees.enum";
import useAppData from "../../data/context/app/useAppData";
import useLanguageData from "../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { IInboxChat } from "../../shared/business/inbox/inbox.types";
import ChatsEmptyState from "./ChatsEmptyState";
import ChatsList from "./ChatsList";
import ChatsThread from "./ChatsThread";
import { useChats } from "./useChats";

// The page's own padding under the card (the main area has 1.75rem all around).
const PAGE_BOTTOM_PADDING: number = 28;
const MIN_HEIGHT: number = 440;

// The rows on the left and the open one on the right. On a narrow screen only
// one of them shows at a time.
export default function ChatsInbox() {
  const { t } = useLanguageData();

  const { employee } = useAuthData();

  const { token } = theme.useToken();

  const screens = Grid.useBreakpoint();

  const {
    apps: { fetchApps },
  } = useAppData();

  const { chats, isLoadingChats, refetchChats } = useChats();

  // A link from a customer opens that customer's chat straight away.
  const requestedCustomer: string | null = useSearchParams().get("customer");

  const [selectedKey, setSelectedKey] = useState<string | null>(
    requestedCustomer,
  );

  const isNarrow: boolean = screens.md === false;

  // The chat takes the rest of the screen, down to the bottom: its height is what
  // is left under where it starts, and follows the window being resized.
  const cardRef = useRef<HTMLDivElement | null>(null);

  const [height, setHeight] = useState<number>(MIN_HEIGHT);

  useLayoutEffect(() => {
    const fit = (): void => {
      const top: number = cardRef.current?.getBoundingClientRect().top ?? 0;

      setHeight(
        Math.max(MIN_HEIGHT, window.innerHeight - top - PAGE_BOTTOM_PADDING),
      );
    };

    fit();

    window.addEventListener("resize", fit);

    return () => window.removeEventListener("resize", fit);
  }, []);

  // Always the freshest copy: the list refreshes in the background.
  const selectedChat: IInboxChat | undefined = chats.find(
    (chat: IInboxChat) => chat.key === selectedKey,
  );

  // Opening a row reads it, and so does a message that arrives while it is open.
  // The ref keeps one request per unread count.
  const markedAt = useRef<string>("");

  useEffect(() => {
    if (!selectedChat || selectedChat.unreadCount === 0) {
      return;
    }

    const key: string = `${selectedChat.key}:${selectedChat.unreadCount}:${selectedChat.lastMessageAt}`;

    if (markedAt.current === key) {
      return;
    }

    markedAt.current = key;

    serviceMethodsInstance.inboxServiceMethods
      .markRead(
        selectedChat.customerId
          ? { customerId: selectedChat.customerId }
          : { conversationId: selectedChat.conversations[0]._id },
      )
      .then(() => {
        refetchChats(true);

        // The count in the menu drops as soon as the conversation is read.
        fetchApps(true);
      })
      .catch(() => undefined);
  }, [selectedChat, refetchChats, fetchApps]);

  const list = (
    <ChatsList
      chats={chats}
      isLoading={isLoadingChats}
      selectedKey={selectedKey}
      onSelect={(chat: IInboxChat) => setSelectedKey(chat.key)}
    />
  );

  const emptyThread = <ChatsEmptyState isEmpty={chats.length === 0} />;

  const thread = selectedChat ? (
    <ChatsThread
      key={selectedChat.key}
      chat={selectedChat}
      canDelete={employee?.level !== EmployeesEnum.Level.EMPLOYEE}
      onBack={isNarrow ? () => setSelectedKey(null) : undefined}
      onSent={() => refetchChats(true)}
      onChanged={(row?: IInboxChat) => {
        // The conversation may now belong to another row: follow it.
        if (row) {
          setSelectedKey(row.key);
        }

        refetchChats(true);
      }}
    />
  ) : (
    emptyThread
  );

  return (
    <Card
      ref={cardRef}
      styles={{ body: { padding: 0 } }}
      style={{ overflow: "hidden" }}
    >
      <div className="flex" style={{ height }}>
        {isNarrow ? (
          <div className="w-full">{selectedChat ? thread : list}</div>
        ) : (
          <>
            <div
              className="w-80 shrink-0"
              style={{ borderRight: `1px solid ${token.colorBorderSecondary}` }}
            >
              {list}
            </div>

            <div className="min-w-0 flex-1">{thread}</div>
          </>
        )}
      </div>
    </Card>
  );
}
