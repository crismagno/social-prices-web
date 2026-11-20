"use client";

import { Avatar, Badge, Empty, Spin, theme } from "antd";
import dayjs from "dayjs";

import { ShopOutlined } from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  IStoreChatConversation,
  IStoreChatStoreCard,
} from "../../../shared/business/store-chat/store-chat.types";
import { getImageUrl } from "../../../shared/utils/images/images-url";
import CustomerStoreSearch from "./CustomerStoreSearch";

interface Props {
  conversations: IStoreChatConversation[];
  isLoading: boolean;
  selectedStoreId: string | null;
  onOpen: (store: IStoreChatStoreCard) => void;
}

// Today shows the hour, older days the date.
const when = (date: string): string => {
  const at = dayjs(date);

  return at.isSame(dayjs(), "day") ? at.format("HH:mm") : at.format("DD/MM");
};

export const StoreAvatar: React.FC<{
  store: Pick<IStoreChatStoreCard, "logo">;
  size?: number;
}> = ({ store, size = 40 }) => (
  <Avatar
    size={size}
    className="shrink-0"
    src={store.logo ? getImageUrl(store.logo) : undefined}
    icon={<ShopOutlined />}
  />
);

// The left side: find a store, and the conversations already started.
export default function CustomerChatsList({
  conversations,
  isLoading,
  selectedStoreId,
  onOpen,
}: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className="p-3"
        style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
      >
        <CustomerStoreSearch onPick={onOpen} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && !conversations.length ? (
          <div className="flex justify-center p-8">
            <Spin />
          </div>
        ) : !conversations.length ? (
          <Empty
            className="p-6"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("customerChats.noConversations")}
          />
        ) : (
          conversations.map((conversation: IStoreChatConversation) => {
            const isSelected: boolean =
              conversation.store._id === selectedStoreId;

            return (
              <button
                key={conversation.store._id}
                type="button"
                onClick={() => onOpen(conversation.store)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
                style={{
                  background: isSelected
                    ? token.controlItemBgActive
                    : "transparent",
                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <StoreAvatar store={conversation.store} />

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-semibold">
                      {conversation.store.name}
                    </span>

                    <span
                      className="shrink-0 text-xs"
                      style={{ color: token.colorTextTertiary }}
                    >
                      {when(conversation.lastMessageAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="truncate text-sm"
                      style={{ color: token.colorTextSecondary }}
                    >
                      {conversation.lastMessageFromMe && t("chats.you")}
                      {conversation.lastMessageText}
                    </span>

                    <Badge
                      count={conversation.unreadCount}
                      size="small"
                      overflowCount={99}
                    />
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
