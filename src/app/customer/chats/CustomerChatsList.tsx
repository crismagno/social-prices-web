"use client";

import { Badge, Spin, theme } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import { useStoreChatTypingKeys } from "../../../data/context/socket/useStoreChatTyping";
import InboxEnum from "../../../shared/business/inbox/inbox.enum";
import {
  IStoreChatConversation,
  IStoreChatStoreCard,
} from "../../../shared/business/store-chat/store-chat.types";
import { contentKey, formatWhen } from "../../chats/chats-display";
import CustomerStoreSearch from "./CustomerStoreSearch";
import StoreAvatar from "./StoreAvatar";

interface Props {
  conversations: IStoreChatConversation[];
  isLoading: boolean;
  selectedStoreId: string | null;
  onOpen: (store: IStoreChatStoreCard) => void;
}

// The left side: find a store, and the conversations already started. Rows
// look like the ones of the stores' chat.
export default function CustomerChatsList({
  conversations,
  isLoading,
  selectedStoreId,
  onOpen,
}: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  // The stores that are writing right now: their row says so instead of
  // showing the last message.
  const typingStoreIds: Set<string> = useStoreChatTypingKeys(
    (event) => event.storeId,
  );

  // A message with a file and no text shows what the file is.
  const previewOf = (conversation: IStoreChatConversation): string =>
    conversation.lastMessageText ??
    (conversation.lastMessageKind &&
    conversation.lastMessageKind !== InboxEnum.MessageKind.TEXT
      ? `[${t(`chats.content.${contentKey(conversation.lastMessageKind)}`)}]`
      : "");

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex flex-col gap-2 p-3"
        style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
      >
        <CustomerStoreSearch onPick={onOpen} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && conversations.length === 0 ? (
          <div className="p-6 text-center">
            <Spin />
          </div>
        ) : conversations.length === 0 ? (
          <div
            className="p-6 text-center text-sm"
            style={{ color: token.colorTextTertiary }}
          >
            {t("customerChats.noConversations")}
          </div>
        ) : (
          conversations.map((conversation: IStoreChatConversation) => {
            const isSelected: boolean =
              conversation.store._id === selectedStoreId;

            const hasUnread: boolean = conversation.unreadCount > 0;

            const isTyping: boolean = typingStoreIds.has(
              conversation.store._id,
            );

            return (
              <button
                key={conversation.store._id}
                type="button"
                onClick={() => onOpen(conversation.store)}
                className="flex w-full cursor-pointer items-center gap-3 border-0 px-3 py-3 text-left"
                style={{
                  background: isSelected ? token.colorPrimaryBg : "transparent",
                  borderLeft: `3px solid ${isSelected ? token.colorPrimary : "transparent"}`,
                }}
              >
                <StoreAvatar store={conversation.store} size={44} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`truncate ${hasUnread ? "font-semibold" : "font-medium"}`}
                    >
                      {conversation.store.name}
                    </span>

                    <span
                      className="shrink-0 text-xs"
                      style={{
                        color: hasUnread
                          ? token.colorPrimary
                          : token.colorTextTertiary,
                      }}
                    >
                      {formatWhen(conversation.lastMessageAt)}
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
                        {conversation.lastMessageFromMe && t("chats.you")}
                        {previewOf(conversation)}
                      </span>
                    )}

                    {hasUnread && (
                      <Badge
                        count={conversation.unreadCount}
                        overflowCount={99}
                        color={token.colorPrimary}
                      />
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
