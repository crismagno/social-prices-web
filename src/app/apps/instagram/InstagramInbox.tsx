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
import { IInstagramChat } from "../../../shared/business/apps/instagram/instagram.types";
import InstagramChatList from "./InstagramChatList";
import InstagramThread from "./InstagramThread";
import { INSTAGRAM_PINK } from "./instagram-display";
import { useInstagramChats } from "./useInstagramChats";

interface Props {
  isEnabled: boolean;
  // Removing a message needs an admin or master employee (the API enforces it too).
  canDelete: boolean;
}

// The conversations on the left and the open one on the right. On a narrow
// screen only one of them shows at a time.
export default function InstagramInbox({ isEnabled, canDelete }: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const screens = Grid.useBreakpoint();

  const {
    apps: { fetchApps },
  } = useAppData();

  const { chats, isLoadingChats, refetchChats } = useInstagramChats(isEnabled);

  // A link from a customer opens that person's conversation straight away.
  const requestedIgsid: string | null = useSearchParams().get("chat");

  const [selectedIgsid, setSelectedIgsid] = useState<string | null>(
    requestedIgsid,
  );

  const isNarrow: boolean = screens.md === false;

  // Always the freshest copy: the list refreshes in the background.
  const selectedChat: IInstagramChat | undefined = chats.find(
    (chat: IInstagramChat) => chat.igsid === selectedIgsid,
  );

  // Opening a conversation reads it, and so does a message that arrives while
  // it is open. The ref keeps one request per unread count.
  const markedAt = useRef<string>("");

  useEffect(() => {
    if (!selectedChat || selectedChat.unreadCount === 0) {
      return;
    }

    const key: string = `${selectedChat.igsid}:${selectedChat.unreadCount}:${selectedChat.lastMessageAt}`;

    if (markedAt.current === key) {
      return;
    }

    markedAt.current = key;

    serviceMethodsInstance.instagramServiceMethods
      .markRead(selectedChat.igsid)
      .then(() => {
        refetchChats(true);

        // The count in the menu drops as soon as the conversation is read.
        fetchApps(true);
      })
      .catch(() => undefined);
  }, [selectedChat, refetchChats, fetchApps]);

  const list = (
    <InstagramChatList
      chats={chats}
      isLoading={isLoadingChats}
      selectedIgsid={selectedIgsid}
      onSelect={(chat: IInstagramChat) => setSelectedIgsid(chat.igsid)}
    />
  );

  // With no conversation open, the right side explains what shows up here, or
  // asks to pick one.
  const emptyThread = (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <AppTile
        icon={<AppIcon app={AppsEnum.App.INSTAGRAM} />}
        accentColor={INSTAGRAM_PINK}
        size={72}
      />

      {chats.length === 0 ? (
        <>
          <div className="text-lg font-semibold">
            {t("apps.instagram.inbox.emptyState.title")}
          </div>

          <div className="max-w-sm" style={{ color: token.colorTextSecondary }}>
            {t("apps.instagram.inbox.emptyState.text")}
          </div>
        </>
      ) : (
        <div style={{ color: token.colorTextSecondary }}>
          {t("apps.instagram.inbox.pick")}
        </div>
      )}
    </div>
  );

  const thread = selectedChat ? (
    <InstagramThread
      key={selectedChat.igsid}
      chat={selectedChat}
      canDelete={canDelete}
      onChatChanged={() => refetchChats(true)}
      onBack={isNarrow ? () => setSelectedIgsid(null) : undefined}
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
