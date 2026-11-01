"use client";

import { useEffect, useRef, useState } from "react";

import { Card, Grid, theme } from "antd";
import { useSearchParams } from "next/navigation";

import useAuthData from "../../data/context/auth/useAuthData";
import EmployeesEnum from "../../shared/business/employees/employees.enum";
import { useFillViewportHeight } from "../../shared/hooks/useFillViewportHeight";
import useAppData from "../../data/context/app/useAppData";
import useLanguageData from "../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import InboxEnum from "../../shared/business/inbox/inbox.enum";
import { IInboxChat } from "../../shared/business/inbox/inbox.types";
import ChatsEmptyState from "./ChatsEmptyState";
import ChatsList from "./ChatsList";
import ChatsThread from "./ChatsThread";
import { useChats } from "./useChats";

const MIN_HEIGHT: number = 440;

interface Props {
  // Only this channel: an app's own page. Without it, every channel together.
  channel?: InboxEnum.Channel;
}

// The rows on the left and the open one on the right. On a narrow screen only
// one of them shows at a time.
export default function ChatsInbox({ channel }: Props) {
  const { t } = useLanguageData();

  const { employee } = useAuthData();

  const { token } = theme.useToken();

  const screens = Grid.useBreakpoint();

  const {
    apps: { fetchApps },
  } = useAppData();

  const { chats, isLoadingChats, refetchChats } = useChats(channel);

  // A link from a customer opens that customer's chat straight away.
  const requestedCustomer: string | null = useSearchParams().get("customer");

  const [selectedKey, setSelectedKey] = useState<string | null>(
    requestedCustomer,
  );

  // A link to one person's conversation (the app pages use their contact id).
  const requestedChat: string | null = useSearchParams().get("chat");

  useEffect(() => {
    if (!requestedChat) {
      return;
    }

    const found: IInboxChat | undefined = chats.find((chat: IInboxChat) =>
      chat.conversations.some(
        (conversation) =>
          conversation.contactKey === requestedChat &&
          (!channel || conversation.channel === channel),
      ),
    );

    if (found) {
      setSelectedKey(found.key);
    }
    // Only once the list arrives: after that the user picks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedChat, chats.length > 0]);

  const isNarrow: boolean = screens.md === false;

  // The chat takes the rest of the screen, down to the bottom.
  const { ref: cardRef, height } = useFillViewportHeight(MIN_HEIGHT);

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
          ? { customerId: selectedChat.customerId, channel }
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
      isScopedToChannel={!!channel}
    />
  );

  const emptyThread = <ChatsEmptyState isEmpty={chats.length === 0} />;

  const thread = selectedChat ? (
    <ChatsThread
      key={selectedChat.key}
      chat={selectedChat}
      channel={channel}
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
