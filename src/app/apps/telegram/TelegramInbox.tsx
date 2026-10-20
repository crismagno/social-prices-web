"use client";

import { useEffect, useRef, useState } from "react";

import { Button, Card, Grid, theme } from "antd";
import { useSearchParams } from "next/navigation";

import { ExportOutlined } from "@ant-design/icons";

import AppIcon from "../../../components/common/AppIcon/AppIcon";
import { AppTile } from "../../../components/common/ConnectSteps/ConnectSteps";
import useAppData from "../../../data/context/app/useAppData";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import AppsEnum from "../../../shared/business/apps/apps.enum";
import { ITelegramChat } from "../../../shared/business/apps/telegram/telegram.types";
import TelegramChatList from "./TelegramChatList";
import TelegramThread from "./TelegramThread";
import { TELEGRAM_BLUE } from "./telegram-theme";
import { useTelegramChats } from "./useTelegramChats";

interface Props {
  isEnabled: boolean;
  botUsername: string | null;
  // Deleting removes the message for the customer too, so it is for managers.
  canDelete: boolean;
}

// The conversations on the left and the open one on the right. On a narrow
// screen only one of them shows at a time.
export default function TelegramInbox({
  isEnabled,
  botUsername,
  canDelete,
}: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const screens = Grid.useBreakpoint();

  const {
    apps: { fetchApps },
  } = useAppData();

  const { chats, isLoadingChats, refetchChats } = useTelegramChats(isEnabled);

  // A link from a customer opens that person's conversation straight away.
  const requestedChat: number = Number(useSearchParams().get("chat"));

  const [selectedChatId, setSelectedChatId] = useState<number | null>(
    Number.isInteger(requestedChat) && requestedChat !== 0
      ? requestedChat
      : null,
  );

  const isNarrow: boolean = screens.md === false;

  // Always the freshest copy: the list refreshes in the background.
  const selectedChat: ITelegramChat | undefined = chats.find(
    (chat: ITelegramChat) => chat.chatId === selectedChatId,
  );

  // Opening a conversation reads it, and so does a message that arrives while
  // it is open. The ref keeps one request per unread count.
  const markedAt = useRef<string>("");

  useEffect(() => {
    if (!selectedChat || selectedChat.unreadCount === 0) {
      return;
    }

    const key: string = `${selectedChat.chatId}:${selectedChat.unreadCount}:${selectedChat.lastMessageAt}`;

    if (markedAt.current === key) {
      return;
    }

    markedAt.current = key;

    serviceMethodsInstance.telegramServiceMethods
      .markRead(selectedChat.chatId)
      .then(() => {
        refetchChats(true);

        // The count in the menu drops as soon as the conversation is read.
        fetchApps(true);
      })
      .catch(() => undefined);
  }, [selectedChat, refetchChats, fetchApps]);

  const list = (
    <TelegramChatList
      chats={chats}
      isLoading={isLoadingChats}
      selectedChatId={selectedChatId}
      onSelect={(chat: ITelegramChat) => setSelectedChatId(chat.chatId)}
    />
  );

  // With no conversation open, the right side either invites the first message
  // or asks to pick one.
  const emptyThread = (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <AppTile
        icon={<AppIcon app={AppsEnum.App.TELEGRAM} />}
        accentColor={TELEGRAM_BLUE}
        size={72}
      />

      {chats.length === 0 && botUsername ? (
        <>
          <div className="text-lg font-semibold">
            {t("apps.telegram.inbox.emptyState.title")}
          </div>

          <div className="max-w-sm" style={{ color: token.colorTextSecondary }}>
            {t("apps.telegram.inbox.emptyState.text").replace(
              "{username}",
              botUsername,
            )}
          </div>

          <Button
            type="primary"
            href={`https://t.me/${botUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            icon={<ExportOutlined />}
          >
            {t("apps.telegram.inbox.emptyState.action").replace(
              "{username}",
              botUsername,
            )}
          </Button>
        </>
      ) : (
        <div style={{ color: token.colorTextSecondary }}>
          {t("apps.telegram.inbox.pick")}
        </div>
      )}
    </div>
  );

  const thread = selectedChat ? (
    <TelegramThread
      key={selectedChat.chatId}
      chat={selectedChat}
      canDelete={canDelete}
      onChatChanged={() => refetchChats(true)}
      onBack={isNarrow ? () => setSelectedChatId(null) : undefined}
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
