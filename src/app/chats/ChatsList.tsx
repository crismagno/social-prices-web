"use client";

import { useMemo, useState } from "react";

import { Avatar, Badge, Checkbox, Input, Segmented, Spin, Tooltip, theme } from "antd";

import { ClockCircleOutlined, InboxOutlined, SearchOutlined } from "@ant-design/icons";

import ChannelIcon from "../../components/common/ChannelIcon/ChannelIcon";
import useLanguageData from "../../data/context/language/useLanguageData";
import { useStoreChatTypingKeys } from "../../data/context/socket/useStoreChatTyping";
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
import ChatsCounts, { TChatsFocus } from "./ChatsCounts";

// Each choice of the channel filter: the word and the icons on one centred line.
const CHANNEL_CELL: string =
  "flex h-6 items-center justify-center leading-none";

interface Props {
  chats: IInboxChat[];
  isLoading: boolean;
  selectedKey: string | null;
  onSelect: (chat: IInboxChat) => void;
  // An app's own list has one channel, so the channel filter has nothing to pick.
  isScopedToChannel?: boolean;
}

// The customers (and the people not tied to one yet), most recent first, each
// with the channels they talked through.
// The chats whose last word is the person's: they still wait for an answer.
const isUnanswered = (chat: IInboxChat): boolean =>
  chat.lastMessageDirection === InboxEnum.Direction.IN;

export default function ChatsList({
  chats,
  isLoading,
  selectedKey,
  onSelect,
  isScopedToChannel = false,
}: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const [search, setSearch] = useState<string>("");

  // The conversations whose customer is writing right now, on the store chat
  // (the other channels do not tell us this): their row says so instead of
  // showing the last message.
  const typingConversationIds: Set<string> = useStoreChatTypingKeys(
    (event) => event.conversationId,
  );

  const [channel, setChannel] = useState<InboxEnum.Channel | "ALL">("ALL");

  // Only the people nobody has tied to a customer yet, to go through them.
  const [onlyUnlinked, setOnlyUnlinked] = useState<boolean>(false);

  // The chats set aside live apart, out of the way until wanted again.
  const [view, setView] = useState<"ACTIVE" | "LIMBO">("ACTIVE");

  const limboCount: number = useMemo(
    () => chats.filter((chat: IInboxChat) => chat.isInLimbo).length,
    [chats],
  );

  const inView: IInboxChat[] = useMemo(
    () =>
      chats.filter((chat: IInboxChat) =>
        view === "LIMBO" ? chat.isInLimbo : !chat.isInLimbo,
      ),
    [chats, view],
  );

  const unlinkedCount: number = useMemo(
    () => inView.filter((chat: IInboxChat) => !chat.customerId).length,
    [inView],
  );

  // The chats with messages nobody has read yet: what still waits for an answer.
  const pendingCount: number = useMemo(
    () => inView.filter((chat: IInboxChat) => chat.unreadCount > 0).length,
    [inView],
  );

  // Only the chats still waiting, to answer them one after another.
  const [focus, setFocus] = useState<TChatsFocus>("ALL");

  const unansweredCount: number = inView.filter(isUnanswered).length;

  const unnamed: string = t("chats.unnamed");

  const visible: IInboxChat[] = useMemo(
    () =>
      inView.filter(
        (chat: IInboxChat) =>
          (!onlyUnlinked || !chat.customerId) &&
          (focus !== "PENDING" || chat.unreadCount > 0) &&
          (focus !== "UNANSWERED" || isUnanswered(chat)) &&
          (channel === "ALL" || chat.channels.includes(channel)) &&
          chatMatches(chat, chatName(chat, unnamed), search),
      ),
    [inView, channel, onlyUnlinked, focus, search, unnamed],
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
        <Segmented
          block
          value={view}
          onChange={(value) => setView(value as "ACTIVE" | "LIMBO")}
          options={[
            {
              value: "ACTIVE",
              label: `${t("chats.limbo.active")} (${
                chats.length - limboCount
              })`,
            },
            {
              value: "LIMBO",
              label: (
                <span title={t("chats.limbo.tabHint")}>
                  <InboxOutlined /> {t("chats.limbo.tab")} ({limboCount})
                </span>
              ),
            },
          ]}
        />

        <ChatsCounts
          total={inView.length}
          pending={pendingCount}
          unanswered={unansweredCount}
          focus={focus}
          onFocusChange={setFocus}
        />

        <Input
          allowClear
          prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
          placeholder={t("chats.search")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {!isScopedToChannel && (
          <Segmented
            block
            size="small"
            value={channel}
            onChange={(value) => setChannel(value as InboxEnum.Channel | "ALL")}
            options={[
              {
                value: "ALL",
                label: (
                  <span className={CHANNEL_CELL}>{t("chats.filter.all")}</span>
                ),
              },
              ...Object.values(InboxEnum.Channel).map((value) => ({
                value,
                label: (
                  <span
                    className={CHANNEL_CELL}
                    title={t(`chats.channels.${value}`)}
                  >
                    <ChannelIcon channel={value} className="text-base" />
                  </span>
                ),
              })),
            ]}
          />
        )}

        <Checkbox
          checked={onlyUnlinked}
          onChange={(event) => setOnlyUnlinked(event.target.checked)}
        >
          <span className="text-xs">
            {t("chats.filter.unlinked")} ({unlinkedCount})
          </span>
        </Checkbox>
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
            {view === "LIMBO" ? t("chats.limbo.empty") : t("chats.empty.title")}
          </div>
        ) : (
          visible.map((chat: IInboxChat) => {
            const name: string = chatName(chat, unnamed);

            const isSelected: boolean = chat.key === selectedKey;

            const hasUnread: boolean = chat.unreadCount > 0;

            const isTyping: boolean = chat.conversations.some(
              (conversation: IInboxConversation) =>
                typingConversationIds.has(conversation._id),
            );

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
                    {isTyping ? (
                      <span
                        className="truncate text-sm italic"
                        style={{ color: token.colorPrimary }}
                      >
                        {t("chats.typing")}
                      </span>
                    ) : (
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
                    )}

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
                            <ChannelIcon channel={conversation.channel} />

                            <span
                              className="truncate"
                              style={{ color: token.colorTextSecondary }}
                            >
                              {contact}
                            </span>
                          </span>
                        );
                      },
                    )}

                    {!chat.customerId && (
                      <span style={{ color: token.colorTextTertiary }}>
                        · {t("chats.noCustomer")}
                      </span>
                    )}

                    {chat.hasReplied === false && (
                      <Tooltip
                        title={
                          <>
                            <strong>{t("chats.notAnswered")}</strong>
                            <div>{t("chats.notAnsweredHint")}</div>
                          </>
                        }
                      >
                        <ClockCircleOutlined
                          className="ml-auto shrink-0 text-[13px]"
                          aria-label={t("chats.notAnswered")}
                          style={{ color: token.colorWarning }}
                        />
                      </Tooltip>
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
