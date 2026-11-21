"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";

import { App, Avatar, Button, Popconfirm, Spin, theme, Tooltip } from "antd";
import dayjs from "dayjs";
import Link from "next/link";

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  ExportOutlined,
  EditOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import TypingBubble from "../../components/common/TypingBubble/TypingBubble";
import { useStoreChatTyping } from "../../data/context/socket/useStoreChatTyping";
import EditCustomerDrawer from "../../components/common/EditCustomerDrawer/EditCustomerDrawer";
import ChannelIcon from "../../components/common/ChannelIcon/ChannelIcon";
import ScrollToBottomButton from "../../components/common/ScrollToBottomButton/ScrollToBottomButton";
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
import ChatsFastSale from "./ChatsFastSale";
import { useChatsSidePanel } from "./ChatsSidePanel";
import ChatsMessageEditor, { ChatsEditedMark } from "./ChatsMessageEditor";
import ChatsReplyBox from "./ChatsReplyBox";
import { conversationAppUrl } from "./chats-links";
import {
  CHANNEL_COLOR,
  chatInitial,
  chatName,
  conversationName,
  seedOf,
} from "./chats-display";
import { useChatMessages } from "./useChatMessages";

// Below this width the header's actions keep only their icons, so they still
// fit beside the name (a narrow window, or a panel open beside the conversation).
const COMPACT_HEADER_WIDTH_PX: number = 640;

interface Props {
  chat: IInboxChat;
  onBack?: () => void;
  // The list changed (a customer was linked or moved): `row` is where the
  // conversation ended up, when it did.
  onChanged: (row?: IInboxChat) => void;
  // An answer was sent from here.
  onSent: () => void;
  // An app's own page shows only that channel's messages of the customer.
  channel?: InboxEnum.Channel;
  // Removing a message needs an admin or master employee (the API enforces it too).
  canDelete: boolean;
}

// The longest text each channel that can change a message takes: a caption is
// shorter than a text in Telegram.
const EDIT_MAX_LENGTH: Partial<Record<InboxEnum.Channel, number>> = {
  [InboxEnum.Channel.TELEGRAM]: 4096,
  [InboxEnum.Channel.STORE]: 1000,
};

// One customer (or one person): the messages of every channel together, each
// marked with where it came from.
export default function ChatsThread({
  chat,
  onBack,
  onChanged,
  onSent,
  canDelete,
  channel,
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
      ? { customerId: chat.customerId, channel }
      : { conversationId: chat.conversations[0]?._id },
  );

  const [isManageOpen, setIsManageOpen] = useState<boolean>(false);

  const [isFastSaleOpen, setIsFastSaleOpen] = useState<boolean>(false);

  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

  const [isCreatingCustomer, setIsCreatingCustomer] = useState<boolean>(false);

  const headerRef = useRef<HTMLDivElement | null>(null);

  const [isCompact, setIsCompact] = useState<boolean>(false);

  useLayoutEffect(() => {
    const element: HTMLDivElement | null = headerRef.current;

    if (!element) {
      return;
    }

    const measure = (): void =>
      setIsCompact(element.clientWidth < COMPACT_HEADER_WIDTH_PX);

    measure();

    const observer: ResizeObserver = new ResizeObserver(measure);

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // The fast sale and the customer's data open beside the conversation when
  // there is room, so it can go on while they are filled in; one at a time.
  const sidePanel: HTMLElement | undefined = useChatsSidePanel(
    isEditOpen || isFastSaleOpen,
  );

  // The message whose words are being changed, if any: one at a time.
  const [editingId, setEditingId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const name: string = chatName(chat, t("chats.unnamed"));

  const lastMessageId: string | undefined = messages[messages.length - 1]?._id;

  // Reading goes to the newest message; loading older ones does not move it.
  // The customer is writing on the store chat: shown for a few seconds, until
  // the message arrives. The other channels do not tell us this.
  const { isTyping, clear: clearTyping } = useStoreChatTyping((event) =>
    chat.conversations.some(
      (conversation: IInboxConversation) =>
        conversation._id === event.conversationId,
    ),
  );

  useEffect(() => {
    clearTyping();
  }, [lastMessageId, chat.key, clearTyping]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lastMessageId, chat.key, isTyping]);

  const conversationOf = (
    message: IInboxMessage,
  ): IInboxConversation | undefined =>
    chat.conversations.find(
      (conversation: IInboxConversation) =>
        conversation._id === message.conversationId,
    );

  // A person with no customer yet: one is made from what the conversation
  // brought (the name, the username) and tied to it.
  const createCustomer = async (): Promise<void> => {
    const conversation: IInboxConversation | undefined = chat.conversations[0];

    if (!conversation) {
      return;
    }

    try {
      setIsCreatingCustomer(true);

      const row: IInboxChat =
        await serviceMethodsInstance.inboxServiceMethods.createCustomer(
          conversation._id,
        );

      message.success(t("chats.customer.created"));

      onChanged(row);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  // Thrown again after being shown, so the editor stays open.
  const editMessage = async (
    item: IInboxMessage,
    text: string,
  ): Promise<void> => {
    try {
      const edited: IInboxMessage =
        await serviceMethodsInstance.inboxServiceMethods.editMessage(
          item._id,
          text,
        );

      // Same id: it takes the place of the message as it was.
      addMessage(edited);

      setEditingId(null);

      message.success(t("chats.edit.done"));

      onSent();
    } catch (error: any) {
      // The channel's own reason comes with the error.
      handleClientError(error);

      throw error;
    }
  };

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
        ref={headerRef}
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
            <span className="truncate font-semibold">
              {name}

              {/* While the customer writes on the store chat, it says so here too. */}
              {isTyping && (
                <span
                  className="ml-2 text-xs font-normal italic"
                  style={{ color: token.colorPrimary }}
                >
                  {t("chats.typing")}
                </span>
              )}
            </span>

            <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
              {chat.conversations.map((conversation: IInboxConversation) => {
                const appUrl: string | null = conversationAppUrl(conversation);

                // The store chat has no app to go to: it is only named.
                if (!appUrl) {
                  return (
                    <span
                      key={conversation._id}
                      className="flex items-center gap-1"
                      style={{ color: token.colorTextSecondary }}
                      title={t(`chats.channels.${conversation.channel}`)}
                    >
                      <ChannelIcon channel={conversation.channel} />

                      {t(`chats.channels.${conversation.channel}`)}
                    </span>
                  );
                }

                // The person on that channel: a click goes to the app, with this conversation open.
                return (
                  <Link
                    key={conversation._id}
                    href={appUrl}
                    className="flex items-center gap-1 hover:underline"
                    style={{ color: token.colorTextSecondary }}
                    title={t("chats.openInApp").replace(
                      "{app}",
                      t(`chats.channels.${conversation.channel}`),
                    )}
                  >
                    <ChannelIcon channel={conversation.channel} />

                    {conversationName(conversation, t("chats.unnamed"))}

                    <ExportOutlined style={{ fontSize: 10, opacity: 0.6 }} />
                  </Link>
                );
              })}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Keeping the customer's data up to date while the conversation goes on. */}
          {chat.customerId && (
            <Tooltip title={t("chats.actions.edit")}>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setIsFastSaleOpen(false);
                  setIsEditOpen(true);
                }}
                aria-label={t("customers.editCustomer")}
              >
                {!isCompact && t("customers.editCustomer")}
              </Button>
            </Tooltip>
          )}

          {/* A sale needs a customer, so only a customer tied to this chat can have one. */}
          {chat.customerId && (
            <Tooltip title={t("chats.actions.fastSale")}>
              <Button
                size="small"
                className="!border-amber-500 !bg-amber-500 !text-white hover:!bg-amber-400"
                icon={<ThunderboltOutlined />}
                onClick={() => {
                  setIsEditOpen(false);
                  setIsFastSaleOpen(true);
                }}
                aria-label={t("sales.fastSale")}
              >
                {!isCompact && t("sales.fastSale")}
              </Button>
            </Tooltip>
          )}

          <Tooltip title={t("chats.actions.manage")}>
            <Button
              size="small"
              icon={<TeamOutlined />}
              onClick={() => setIsManageOpen(true)}
              aria-label={t("chats.customer.manage")}
            >
              {!isCompact && t("chats.customer.manage")}
            </Button>
          </Tooltip>

          {chat.customerId ? (
            <Tooltip title={t("chats.actions.open")}>
              <Link
                href={Urls.CUSTOMER.replace(":customerId", chat.customerId)}
              >
                <Button
                  size="small"
                  type="primary"
                  ghost
                  icon={<UserOutlined />}
                  aria-label={t("chats.openCustomer")}
                >
                  {!isCompact && t("chats.openCustomer")}
                </Button>
              </Link>
            </Tooltip>
          ) : (
            <Tooltip title={t("chats.customer.createHint")}>
              <Button
                size="small"
                type="primary"
                icon={<UserAddOutlined />}
                loading={isCreatingCustomer}
                onClick={createCustomer}
                aria-label={t("chats.customer.create")}
              >
                {!isCompact && t("chats.customer.create")}
              </Button>
            </Tooltip>
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

                    {editingId === item._id ? (
                      <ChatsMessageEditor
                        initialText={item.text ?? ""}
                        maxLength={EDIT_MAX_LENGTH[item.channel] ?? 1000}
                        onSave={(text: string) => editMessage(item, text)}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      item.text && (
                        <div
                          style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {item.text}
                        </div>
                      )
                    )}

                    <div
                      className="mt-0.5 flex items-center justify-end gap-1 text-[11px]"
                      style={{ opacity: 0.8 }}
                    >
                      <span
                        className="flex items-center gap-1"
                        title={t(`chats.channels.${item.channel}`)}
                      >
                        <ChannelIcon channel={item.channel} />

                        {conversation
                          ? conversationName(conversation, t("chats.unnamed"))
                          : null}
                      </span>

                      <ChatsEditedMark editedAt={item.editedAt} />

                      <span>{dayjs(item.sentAt).format("HH:mm")}</span>
                    </div>
                  </div>

                  {/* Offered only where the message's channel lets its words
                      be changed for the person too. */}
                  {item.canEdit && editingId !== item._id && (
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      className="opacity-60 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                      aria-label={t("chats.edit.action")}
                      title={t("chats.edit.action")}
                      onClick={() => setEditingId(item._id)}
                    />
                  )}

                  {canDelete && item.canDelete && (
                    <Popconfirm
                      title={t(
                        item.channel === InboxEnum.Channel.TELEGRAM
                          ? "chats.delete.confirmTelegram"
                          : item.channel === InboxEnum.Channel.STORE
                            ? "chats.delete.confirmStore"
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

        {isTyping && <TypingBubble label={t("chats.typing")} />}

        <div ref={bottomRef} />

        <ScrollToBottomButton />
      </div>

      <ChatsReplyBox
        chat={chat}
        onSent={(message: IInboxMessage) => {
          addMessage(message);
          onSent();
        }}
      />

      {isEditOpen && chat.customerId && (
        <EditCustomerDrawer
          customerId={chat.customerId}
          onClose={() => setIsEditOpen(false)}
          onSaved={() => onChanged()}
          container={sidePanel}
        />
      )}

      {isFastSaleOpen && chat.customerId && (
        <ChatsFastSale
          customerId={chat.customerId}
          onClose={() => setIsFastSaleOpen(false)}
          container={sidePanel}
        />
      )}

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
