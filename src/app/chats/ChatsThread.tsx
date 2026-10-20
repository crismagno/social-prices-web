"use client";

import { Fragment, useEffect, useRef, useState } from "react";

import { App, Avatar, Button, Popconfirm, Spin, theme } from "antd";
import dayjs from "dayjs";
import Link from "next/link";

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import AppIcon from "../../components/common/AppIcon/AppIcon";
import useLanguageData from "../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import InboxEnum from "../../shared/business/inbox/inbox.enum";
import {
  IInboxChat,
  IInboxConversation,
  IInboxMessage,
} from "../../shared/business/inbox/inbox.types";
import Urls from "../../shared/common/routes-app/routes-app";
import { avatarColor } from "../apps/telegram/telegram-theme";
import { relativeDay } from "../apps/telegram/telegram-display";
import ChatsAttachment from "./ChatsAttachment";
import ChatsConversationsModal from "./ChatsConversationsModal";
import ChatsReplyBox from "./ChatsReplyBox";
import {
  CHANNEL_COLOR,
  chatInitial,
  chatName,
  conversationName,
  seedOf,
} from "./chats-display";
import { useChatMessages } from "./useChatMessages";

interface Props {
  chat: IInboxChat;
  onBack?: () => void;
  // The list changed (a customer was linked or moved): `row` is where the
  // conversation ended up, when it did.
  onChanged: (row?: IInboxChat) => void;
  // An answer was sent from here.
  onSent: () => void;
  // Removing a message needs an admin or master employee (the API enforces it too).
  canDelete: boolean;
}

// One customer (or one person): the messages of every channel together, each
// marked with where it came from.
export default function ChatsThread({
  chat,
  onBack,
  onChanged,
  onSent,
  canDelete,
}: Props) {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const { token } = theme.useToken();

  const {
    messages,
    hasOlder,
    isLoadingMessages,
    isLoadingOlder,
    loadOlder,
    addMessage,
    removeMessage,
  } = useChatMessages(
    chat.customerId
      ? { customerId: chat.customerId }
      : { conversationId: chat.conversations[0]?._id },
  );

  const [isManageOpen, setIsManageOpen] = useState<boolean>(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const name: string = chatName(chat, t("chats.unnamed"));

  const lastMessageId: string | undefined = messages[messages.length - 1]?._id;

  // Reading goes to the newest message; loading older ones does not move it.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lastMessageId, chat.key]);

  const conversationOf = (
    message: IInboxMessage,
  ): IInboxConversation | undefined =>
    chat.conversations.find(
      (conversation: IInboxConversation) =>
        conversation._id === message.conversationId,
    );

  const deleteMessage = async (item: IInboxMessage): Promise<void> => {
    try {
      await serviceMethodsInstance.inboxServiceMethods.deleteMessage(item._id);

      removeMessage(item._id);

      message.success(t("chats.delete.done"));

      onSent();
    } catch (error: any) {
      // The channel's own reason (Telegram: older than 48 hours, say) comes with the error.
      handleClientError(error);
    }
  };

  // With several contacts on the same channel, the caption also says which one.
  const hasSeveralContacts: boolean = chat.conversations.length > 1;

  // "Today", "Yesterday", or the date: the label of the separator above a day.
  const dayLabel = (at: string): string => {
    const day = relativeDay(at);

    return day === "today"
      ? t("chats.today")
      : day === "yesterday"
        ? t("chats.yesterday")
        : dayjs(at).format("DD/MM/YYYY");
  };

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
        style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
      >
        <div className="flex min-w-0 items-center gap-3">
          {onBack && (
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              aria-label={t("chats.back")}
            />
          )}

          <Avatar
            size={40}
            src={chat.avatar ?? chat.conversations[0]?.profilePic ?? undefined}
            style={{
              backgroundColor: avatarColor(seedOf(chat.key)),
              fontWeight: 600,
            }}
          >
            {chatInitial(name)}
          </Avatar>

          <div className="flex min-w-0 flex-col">
            <span className="truncate font-semibold">{name}</span>

            <span className="flex items-center gap-1 text-xs">
              {chat.conversations.map((conversation: IInboxConversation) => (
                <span
                  key={conversation._id}
                  className="flex items-center gap-1"
                  style={{ color: token.colorTextSecondary }}
                >
                  <AppIcon app={InboxEnum.ChannelApp[conversation.channel]} />

                  {hasSeveralContacts &&
                    conversationName(conversation, t("chats.unnamed"))}
                </span>
              ))}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="small"
            icon={<TeamOutlined />}
            onClick={() => setIsManageOpen(true)}
          >
            {t("chats.customer.manage")}
          </Button>

          {chat.customerId ? (
            <Link href={Urls.CUSTOMER.replace(":customerId", chat.customerId)}>
              <Button size="small" type="primary" ghost icon={<UserOutlined />}>
                {t("chats.openCustomer")}
              </Button>
            </Link>
          ) : (
            <span
              className="text-xs"
              style={{ color: token.colorTextTertiary }}
            >
              {t("chats.noCustomer")}
            </span>
          )}
        </div>
      </div>

      <div
        className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-3"
        style={{ background: token.colorFillQuaternary }}
      >
        {hasOlder && (
          <div className="mb-2 text-center">
            <Button size="small" loading={isLoadingOlder} onClick={loadOlder}>
              {t("chats.loadOlder")}
            </Button>
          </div>
        )}

        {isLoadingMessages && messages.length === 0 ? (
          <div className="p-6 text-center">
            <Spin />
          </div>
        ) : messages.length === 0 ? (
          <div
            className="p-6 text-center"
            style={{ color: token.colorTextTertiary }}
          >
            {t("chats.noMessages")}
          </div>
        ) : (
          messages.map((item: IInboxMessage, index: number) => {
            const isOut: boolean = item.direction === InboxEnum.Direction.OUT;

            const conversation = conversationOf(item);

            const startsDay: boolean =
              index === 0 ||
              !dayjs(item.sentAt).isSame(
                dayjs(messages[index - 1].sentAt),
                "day",
              );

            return (
              <Fragment key={item._id}>
                {startsDay && (
                  <div className="my-2 text-center">
                    <span
                      className="rounded-full px-3 py-0.5 text-xs"
                      style={{
                        background: token.colorFillSecondary,
                        color: token.colorTextSecondary,
                      }}
                    >
                      {dayLabel(item.sentAt)}
                    </span>
                  </div>
                )}

                <div
                  className={`group flex w-full items-center gap-1 ${isOut ? "flex-row-reverse justify-start" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${isOut ? "rounded-br-md" : "rounded-bl-md"}`}
                    style={{
                      background: isOut
                        ? CHANNEL_COLOR[item.channel]
                        : token.colorBgContainer,
                      color: isOut
                        ? token.colorTextLightSolid
                        : token.colorText,
                    }}
                  >
                    {item.attachments?.map((attachment) => (
                      <div
                        key={attachment.index}
                        className={item.text ? "mb-1" : ""}
                      >
                        <ChatsAttachment
                          message={item}
                          attachment={attachment}
                          isOut={isOut}
                        />
                      </div>
                    ))}

                    {item.isUnsupported && !item.attachments?.length && (
                      <div className="italic" style={{ opacity: 0.8 }}>
                        {t("chats.content.unsupported")}
                      </div>
                    )}

                    {item.text && (
                      <div
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {item.text}
                      </div>
                    )}

                    <div
                      className="mt-0.5 flex items-center justify-end gap-1 text-[11px]"
                      style={{ opacity: 0.8 }}
                    >
                      <span
                        className="flex items-center gap-1"
                        title={t(`chats.channels.${item.channel}`)}
                      >
                        <AppIcon app={InboxEnum.ChannelApp[item.channel]} />

                        {hasSeveralContacts && conversation
                          ? conversationName(conversation, t("chats.unnamed"))
                          : null}
                      </span>

                      <span>{dayjs(item.sentAt).format("HH:mm")}</span>
                    </div>
                  </div>

                  {canDelete && item.canDelete && (
                    <Popconfirm
                      title={t(
                        item.channel === InboxEnum.Channel.TELEGRAM
                          ? "chats.delete.confirmTelegram"
                          : "chats.delete.confirmLocal",
                      )}
                      okText={t("chats.delete.ok")}
                      okButtonProps={{ danger: true }}
                      onConfirm={() => deleteMessage(item)}
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        className="opacity-60 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                        aria-label={t("chats.delete.ok")}
                      />
                    </Popconfirm>
                  )}
                </div>
              </Fragment>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      <ChatsReplyBox
        chat={chat}
        onSent={(message: IInboxMessage) => {
          addMessage(message);
          onSent();
        }}
      />

      <ChatsConversationsModal
        open={isManageOpen}
        chat={chat}
        onClose={() => setIsManageOpen(false)}
        onChanged={(row?: IInboxChat) => {
          setIsManageOpen(false);
          onChanged(row);
        }}
      />
    </div>
  );
}
