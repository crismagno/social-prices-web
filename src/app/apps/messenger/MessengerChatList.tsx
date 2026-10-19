"use client";

import { useMemo, useState } from "react";

import { Avatar, Badge, Input, Spin, theme } from "antd";
import dayjs from "dayjs";

import { SearchOutlined, UserOutlined } from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import MessengerEnum from "../../../shared/business/apps/messenger/messenger.enum";
import { IMessengerChat } from "../../../shared/business/apps/messenger/messenger.types";
import { avatarColor } from "../telegram/telegram-theme";
import {
  chatDisplayName,
  chatInitial,
  chatMatchesSearch,
} from "./messenger-display";

interface Props {
  chats: IMessengerChat[];
  isLoading: boolean;
  selectedPsid: string | null;
  onSelect: (chat: IMessengerChat) => void;
}

// Today shows the hour; older shows the day.
const formatWhen = (at: string): string => {
  const when = dayjs(at);

  return when.isSame(dayjs(), "day")
    ? when.format("HH:mm")
    : when.format("DD/MM");
};

// The same person always gets the same color.
export const seedOf = (psid: string): number =>
  Array.from(psid).reduce((sum, char) => sum + char.charCodeAt(0), 0);

export default function MessengerChatList({
  chats,
  isLoading,
  selectedPsid,
  onSelect,
}: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const [search, setSearch] = useState<string>("");

  const unnamed: string = t("apps.messenger.unnamed");

  const visible: IMessengerChat[] = useMemo(
    () =>
      chats.filter((chat: IMessengerChat) =>
        chatMatchesSearch(chat, chatDisplayName(chat, unnamed), search),
      ),
    [chats, search, unnamed],
  );

  // A message with a file and no text shows what the file is, in the user's language.
  const previewOf = (chat: IMessengerChat): string => {
    const text: string =
      chat.lastMessageText ??
      (chat.lastAttachmentType
        ? `[${t(`apps.messenger.content.${chat.lastAttachmentType}`)}]`
        : "");

    return chat.lastMessageDirection === MessengerEnum.Direction.OUT
      ? `${t("apps.messenger.inbox.you")}${text}`
      : text;
  };

  return (
    <div className="flex h-full flex-col">
      <div
        className="p-3"
        style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
      >
        <Input
          allowClear
          prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
          placeholder={t("apps.messenger.inbox.search")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && chats.length === 0 ? (
          <div className="p-6 text-center">
            <Spin />
          </div>
        ) : visible.length === 0 ? (
          <div
            className="p-6 text-center text-sm"
            style={{ color: token.colorTextTertiary }}
          >
            {t("apps.messenger.inbox.emptyState.title")}
          </div>
        ) : (
          visible.map((chat: IMessengerChat) => {
            const name: string = chatDisplayName(chat, unnamed);

            const isSelected: boolean = chat.psid === selectedPsid;

            const hasUnread: boolean = chat.unreadCount > 0;

            return (
              <button
                key={chat.psid}
                type="button"
                onClick={() => onSelect(chat)}
                className="flex w-full cursor-pointer items-center gap-3 border-0 px-3 py-3 text-left"
                style={{
                  background: isSelected ? token.colorPrimaryBg : "transparent",
                  borderLeft: `3px solid ${isSelected ? token.colorPrimary : "transparent"}`,
                }}
              >
                <Avatar
                  size={44}
                  src={chat.profilePic ?? undefined}
                  style={{
                    backgroundColor: avatarColor(seedOf(chat.psid)),
                    fontWeight: 600,
                  }}
                >
                  {chatInitial(name)}
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`truncate ${hasUnread ? "font-semibold" : "font-medium"}`}
                    >
                      {name}
                    </span>

                    <span
                      className="shrink-0 text-xs"
                      style={{
                        color: hasUnread
                          ? token.colorPrimary
                          : token.colorTextTertiary,
                      }}
                    >
                      {formatWhen(chat.lastMessageAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="truncate text-sm"
                      style={{
                        color: hasUnread
                          ? token.colorText
                          : token.colorTextSecondary,
                      }}
                    >
                      {previewOf(chat)}
                    </span>

                    {hasUnread && (
                      <Badge
                        count={chat.unreadCount}
                        overflowCount={99}
                        color={token.colorPrimary}
                      />
                    )}
                  </div>

                  {chat.customerName && (
                    <div
                      className="mt-0.5 flex items-center gap-1 text-xs"
                      style={{ color: token.colorPrimary }}
                    >
                      <UserOutlined />

                      <span className="truncate">{chat.customerName}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
