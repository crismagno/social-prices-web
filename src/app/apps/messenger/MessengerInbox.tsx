"use client";

import { useEffect, useRef, useState } from "react";

import { Card, Grid, theme } from "antd";
import { useSearchParams } from "next/navigation";

import AppIcon from "../../../components/common/AppIcon/AppIcon";
import { AppTile } from "../../../components/common/ConnectSteps/ConnectSteps";
import useAppData from "../../../data/context/app/useAppData";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import AppsEnum from "../../../shared/business/apps/apps.enum";
import { IMessengerChat } from "../../../shared/business/apps/messenger/messenger.types";
import MessengerChatList from "./MessengerChatList";
import MessengerThread from "./MessengerThread";
import { MESSENGER_BLUE } from "./messenger-display";
import { useMessengerChats } from "./useMessengerChats";

interface Props {
  isEnabled: boolean;
  // Removing a message needs an admin or master employee (the API enforces it too).
  canDelete: boolean;
}

// The conversations on the left and the open one on the right. On a narrow
// screen only one of them shows at a time.
export default function MessengerInbox({ isEnabled, canDelete }: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const screens = Grid.useBreakpoint();

  const {
    apps: { fetchApps },
  } = useAppData();

  const { chats, isLoadingChats, refetchChats } = useMessengerChats(isEnabled);

  // A link from a customer opens that person's conversation straight away.
  const requestedPsid: string | null = useSearchParams().get("chat");

  const [selectedPsid, setSelectedPsid] = useState<string | null>(
    requestedPsid,
  );

  const isNarrow: boolean = screens.md === false;

  // Always the freshest copy: the list refreshes in the background.
  const selectedChat: IMessengerChat | undefined = chats.find(
    (chat: IMessengerChat) => chat.psid === selectedPsid,
  );

  // Opening a conversation reads it, and so does a message that arrives while
  // it is open. The ref keeps one request per unread count.
  const markedAt = useRef<string>("");

  useEffect(() => {
    if (!selectedChat || selectedChat.unreadCount === 0) {
      return;
    }

    const key: string = `${selectedChat.psid}:${selectedChat.unreadCount}:${selectedChat.lastMessageAt}`;

    if (markedAt.current === key) {
      return;
    }

    markedAt.current = key;

    serviceMethodsInstance.messengerServiceMethods
      .markRead(selectedChat.psid)
      .then(() => {
        refetchChats(true);

        // The count in the menu drops as soon as the conversation is read.
        fetchApps(true);
      })
      .catch(() => undefined);
  }, [selectedChat, refetchChats, fetchApps]);

  const list = (
    <MessengerChatList
      chats={chats}
      isLoading={isLoadingChats}
      selectedPsid={selectedPsid}
      onSelect={(chat: IMessengerChat) => setSelectedPsid(chat.psid)}
    />
  );

  // With no conversation open, the right side explains what shows up here, or
  // asks to pick one.
  const emptyThread = (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <AppTile
        icon={<AppIcon app={AppsEnum.App.FACEBOOK} />}
        accentColor={MESSENGER_BLUE}
        size={72}
      />

      {chats.length === 0 ? (
        <>
          <div className="text-lg font-semibold">
            {t("apps.messenger.inbox.emptyState.title")}
          </div>

          <div className="max-w-sm" style={{ color: token.colorTextSecondary }}>
            {t("apps.messenger.inbox.emptyState.text")}
          </div>
        </>
      ) : (
        <div style={{ color: token.colorTextSecondary }}>
          {t("apps.messenger.inbox.pick")}
        </div>
      )}
    </div>
  );

  const thread = selectedChat ? (
    <MessengerThread
      key={selectedChat.psid}
      chat={selectedChat}
      canDelete={canDelete}
      onChatChanged={() => refetchChats(true)}
      onBack={isNarrow ? () => setSelectedPsid(null) : undefined}
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
