"use client";

import { useMemo, useState } from "react";

import { Avatar, Badge, Input, Segmented, Spin, theme } from "antd";

import { SearchOutlined } from "@ant-design/icons";

import AppIcon from "../../components/common/AppIcon/AppIcon";
import useLanguageData from "../../data/context/language/useLanguageData";
import InboxEnum from "../../shared/business/inbox/inbox.enum";
import {
  IInboxChat,
  IInboxConversation,
} from "../../shared/business/inbox/inbox.types";
import { avatarColor } from "../apps/telegram/telegram-theme";
import {
  chatInitial,
  chatMatches,
  chatName,
  contentKey,
  conversationName,
  formatWhen,
  seedOf,
} from "./chats-display";

interface Props {
  chats: IInboxChat[];
  isLoading: boolean;
  selectedKey: string | null;
  onSelect: (chat: IInboxChat) => void;
}

// The customers (and the people not tied to one yet), most recent first, each
// with the channels they talked through.
export default function ChatsList({
  chats,
  isLoading,
  selectedKey,
  onSelect,
}: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const [search, setSearch] = useState<string>("");

  const [channel, setChannel] = useState<InboxEnum.Channel | "ALL">("ALL");

  const unnamed: string = t("chats.unnamed");

  const visible: IInboxChat[] = useMemo(
    () =>
      chats.filter(
        (chat: IInboxChat) =>
          (channel === "ALL" || chat.channels.includes(channel)) &&
          chatMatches(chat, chatName(chat, unnamed), search),
      ),
    [chats, channel, search, unnamed],
  );

  // A message with a file and no text shows what the file is, in the user's language.
  const previewOf = (chat: IInboxChat): string => {
    const text: string =
      chat.lastMessageText ??
      (chat.lastMessageKind
        ? `[${t(`chats.content.${contentKey(chat.lastMessageKind)}`)}]`
        : "");

    return chat.lastMessageDirection === InboxEnum.Direction.OUT
      ? `${t("chats.you")}${text}`
      : text;
  };

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex flex-col gap-2 p-3"
        style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
      >
        <Input
          allowClear
          prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
          placeholder={t("chats.search")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <Segmented
          block
          size="small"
          value={channel}
          onChange={(value) => setChannel(value as InboxEnum.Channel | "ALL")}
          options={[
            { value: "ALL", label: t("chats.filter.all") },
            ...Object.values(InboxEnum.Channel).map((value) => ({
              value,
              label: (
                <span title={t(`chats.channels.${value}`)}>
                  <AppIcon app={InboxEnum.ChannelApp[value]} />
                </span>
              ),
            })),
          ]}
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
            {t("chats.empty.title")}
          </div>
        ) : (
          visible.map((chat: IInboxChat) => {
            const name: string = chatName(chat, unnamed);

            const isSelected: boolean = chat.key === selectedKey;

            const hasUnread: boolean = chat.unreadCount > 0;

            return (
              <button
                key={chat.key}
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
                  src={
                    chat.avatar ??
                    chat.conversations[0]?.profilePic ??
                    undefined
                  }
                  style={{
                    backgroundColor: avatarColor(seedOf(chat.key)),
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

                  <div className="mt-0.5 flex items-center gap-1 text-xs">
                    {chat.conversations.map(
                      (conversation: IInboxConversation) => {
                        const contact: string = conversationName(
                          conversation,
                          unnamed,
                        );

                        return (
                          <span
                            key={conversation._id}
                            className="flex min-w-0 items-center gap-1"
                            title={t(`chats.channels.${conversation.channel}`)}
                          >
                            <AppIcon
                              app={InboxEnum.ChannelApp[conversation.channel]}
                            />

                            {/* The row is already named after the person when no customer is tied. */}
                            {contact !== name && (
                              <span
                                className="truncate"
                                style={{ color: token.colorTextSecondary }}
                              >
                                {contact}
                              </span>
                            )}
                          </span>
                        );
                      },
                    )}

                    {!chat.customerId && (
                      <span style={{ color: token.colorTextTertiary }}>
                        · {t("chats.noCustomer")}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
