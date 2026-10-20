"use client";

import { useEffect, useRef, useState } from "react";

import { Card, Grid, theme } from "antd";
import { useSearchParams } from "next/navigation";

import { MessageOutlined } from "@ant-design/icons";

import useAppData from "../../data/context/app/useAppData";
import useLanguageData from "../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { IInboxChat } from "../../shared/business/inbox/inbox.types";
import ChatsList from "./ChatsList";
import ChatsThread from "./ChatsThread";
import { useChats } from "./useChats";

// The rows on the left and the open one on the right. On a narrow screen only
// one of them shows at a time.
export default function ChatsInbox() {
  const { t } = useLanguageData();

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

  const emptyThread = (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <MessageOutlined
        style={{ fontSize: 48, color: token.colorTextQuaternary }}
      />

      {chats.length === 0 ? (
        <>
          <div className="text-lg font-semibold">{t("chats.empty.title")}</div>

          <div className="max-w-sm" style={{ color: token.colorTextSecondary }}>
            {t("chats.empty.text")}
          </div>
        </>
      ) : (
        <div style={{ color: token.colorTextSecondary }}>{t("chats.pick")}</div>
      )}
    </div>
  );

  const thread = selectedChat ? (
    <ChatsThread
      key={selectedChat.key}
      chat={selectedChat}
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
    <Card styles={{ body: { padding: 0 } }} style={{ overflow: "hidden" }}>
      <div className="flex" style={{ height: "70vh", minHeight: 440 }}>
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
