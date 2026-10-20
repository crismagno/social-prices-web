"use client";

import { Fragment, useEffect, useRef, useState } from "react";

import {
  Alert,
  App,
  Avatar,
  Button,
  Input,
  Popconfirm,
  Space,
  Spin,
  theme,
} from "antd";
import type { TextAreaRef } from "antd/es/input/TextArea";
import dayjs from "dayjs";
import Link from "next/link";

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  LinkOutlined,
  SendOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import InstagramEnum from "../../../shared/business/apps/instagram/instagram.enum";
import {
  IInstagramChat,
  IInstagramMessage,
} from "../../../shared/business/apps/instagram/instagram.types";
import { ICustomer } from "../../../shared/business/customers/customer.interface";
import Urls from "../../../shared/common/routes-app/routes-app";
import LinkCustomerModal from "../telegram/LinkCustomerModal";
import { relativeDay } from "../telegram/telegram-display";
import { avatarColor } from "../telegram/telegram-theme";
import InstagramAttachment from "./InstagramAttachment";
import { seedOf } from "./InstagramChatList";
import { chatDisplayName, chatInitial } from "./instagram-display";
import { useInstagramMessages } from "./useInstagramMessages";

// Instagram refuses anything longer than this in a single message.
const MAX_LENGTH: number = 1000;

interface Props {
  chat: IInstagramChat;
  onChatChanged: () => void;
  onBack?: () => void;
  canDelete: boolean;
}

export default function InstagramThread({
  canDelete,
  chat,
  onChatChanged,
  onBack,
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
  } = useInstagramMessages(chat.igsid);

  const [text, setText] = useState<string>("");

  const [isSending, setIsSending] = useState<boolean>(false);

  const [isCustomerBusy, setIsCustomerBusy] = useState<boolean>(false);

  const [isLinkOpen, setIsLinkOpen] = useState<boolean>(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const inputRef = useRef<TextAreaRef | null>(null);

  const name: string = chatDisplayName(chat, t("apps.instagram.unnamed"));

  const lastMessageId: string | undefined = messages[messages.length - 1]?._id;

  // Reading goes to the newest message; loading older ones does not move it.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lastMessageId, chat.igsid]);

  const canSend: boolean =
    chat.canReply && text.trim().length > 0 && !isSending;

  const handleSend = async (): Promise<void> => {
    if (!canSend) {
      return;
    }

    try {
      setIsSending(true);

      addMessage(
        await serviceMethodsInstance.instagramServiceMethods.sendMessage(
          chat.igsid,
          text,
        ),
      );

      setText("");

      onChatChanged();
    } catch (error: any) {
      // The server's words say what is wrong (window closed, person unreachable...).
      handleClientError(error);

      // A window that closed while the page was open: show it as closed.
      onChatChanged();
    } finally {
      setIsSending(false);

      inputRef.current?.focus();
    }
  };

  const deleteMessage = async (item: IInstagramMessage): Promise<void> => {
    try {
      await serviceMethodsInstance.instagramServiceMethods.deleteMessage(
        chat.igsid,
        item._id,
      );

      removeMessage(item._id);

      message.success(t("apps.instagram.inbox.deleted"));

      onChatChanged();
    } catch (error: any) {
      handleClientError(error);
    }
  };

  // Every customer action ends the same way: say what happened, refresh the inbox.
  const runCustomerAction = async (
    action: () => Promise<unknown>,
    successKey: string,
  ): Promise<void> => {
    try {
      setIsCustomerBusy(true);

      await action();

      message.success(t(successKey));

      onChatChanged();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsCustomerBusy(false);
    }
  };

  // "Today", "Yesterday", or the date: the label of the separator above a day.
  const dayLabel = (at: string): string => {
    const day = relativeDay(at);

    return day === "today"
      ? t("apps.instagram.inbox.today")
      : day === "yesterday"
        ? t("apps.instagram.inbox.yesterday")
        : dayjs(at).format("DD/MM/YYYY");
  };

  const renderCustomer = () =>
    chat.customerId ? (
      <Space size={4}>
        <Link href={Urls.CUSTOMER.replace(":customerId", chat.customerId)}>
          <Button
            size="small"
            type="primary"
            ghost
            icon={<UserOutlined />}
            title={t("apps.instagram.customer.open")}
          >
            {chat.customerName ?? t("apps.instagram.customer.open")}
          </Button>
        </Link>

        <Popconfirm
          title={t("apps.instagram.customer.unlinkConfirm")}
          onConfirm={() =>
            runCustomerAction(
              () =>
                serviceMethodsInstance.instagramServiceMethods.unlinkCustomer(
                  chat.igsid,
                ),
              "apps.instagram.customer.unlinked",
            )
          }
        >
          <Button size="small" type="text" loading={isCustomerBusy}>
            {t("apps.instagram.customer.unlink")}
          </Button>
        </Popconfirm>
      </Space>
    ) : (
      <Space size={8} wrap>
        <Button
          size="small"
          type="primary"
          ghost
          icon={<UserAddOutlined />}
          loading={isCustomerBusy}
          onClick={() =>
            runCustomerAction(
              () =>
                serviceMethodsInstance.instagramServiceMethods.createCustomer(
                  chat.igsid,
                ),
              "apps.instagram.customer.created",
            )
          }
        >
          {t("apps.instagram.customer.create")}
        </Button>

        <Button
          size="small"
          icon={<LinkOutlined />}
          disabled={isCustomerBusy}
          onClick={() => setIsLinkOpen(true)}
        >
          {t("apps.instagram.customer.link")}
        </Button>
      </Space>
    );

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
              aria-label={t("apps.instagram.inbox.back")}
            />
          )}

          <Avatar
            size={40}
            src={chat.profilePic ?? undefined}
            style={{
              backgroundColor: avatarColor(seedOf(chat.igsid)),
              fontWeight: 600,
            }}
          >
            {chatInitial(name)}
          </Avatar>

          <div className="flex min-w-0 flex-col">
            <span className="truncate font-semibold">{name}</span>

            {chat.username && name !== `@${chat.username}` && (
              <span
                className="truncate text-xs"
                style={{ color: token.colorTextSecondary }}
              >
                @{chat.username}
              </span>
            )}
          </div>
        </div>

        {renderCustomer()}
      </div>

      <div
        className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-3"
        style={{ background: token.colorFillQuaternary }}
      >
        {hasOlder && (
          <div className="mb-2 text-center">
            <Button size="small" loading={isLoadingOlder} onClick={loadOlder}>
              {t("apps.instagram.inbox.loadOlder")}
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
            {t("apps.instagram.inbox.noMessages")}
          </div>
        ) : (
          messages.map((item: IInstagramMessage, index: number) => {
            const isOut: boolean =
              item.direction === InstagramEnum.Direction.OUT;

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
                        ? token.colorPrimary
                        : token.colorBgContainer,
                      color: isOut
                        ? token.colorTextLightSolid
                        : token.colorText,
                    }}
                  >
                    {item.attachments?.map((attachment, attachmentIndex) => (
                      <div
                        key={attachmentIndex}
                        className={item.text ? "mb-1" : ""}
                      >
                        <InstagramAttachment
                          igsid={chat.igsid}
                          message={item}
                          attachment={attachment}
                          index={attachmentIndex}
                          isOut={isOut}
                        />
                      </div>
                    ))}

                    {item.isUnsupported && !item.attachments?.length && (
                      <div className="italic" style={{ opacity: 0.8 }}>
                        {t("apps.instagram.content.unsupported")}
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
                      className="mt-0.5 text-right text-[11px]"
                      style={{ opacity: 0.7 }}
                    >
                      {dayjs(item.sentAt).format("HH:mm")}
                    </div>
                  </div>

                  {canDelete && (
                    <Popconfirm
                      title={t("apps.instagram.inbox.deleteConfirm")}
                      okText={t("apps.instagram.inbox.delete")}
                      okButtonProps={{ danger: true }}
                      onConfirm={() => deleteMessage(item)}
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        className="opacity-60 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                        aria-label={t("apps.instagram.inbox.delete")}
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

      <div
        className="px-4 py-3"
        style={{ borderTop: `1px solid ${token.colorBorderSecondary}` }}
      >
        {!chat.canReply && (
          <Alert
            className="mb-2"
            type="warning"
            showIcon
            message={t("apps.instagram.window.closed")}
            description={t("apps.instagram.window.closedHint")}
          />
        )}

        <div
          className="flex items-end gap-2 rounded-3xl py-1 pl-4 pr-1"
          style={{
            border: `1px solid ${token.colorBorder}`,
            background: token.colorBgContainer,
          }}
        >
          <Input.TextArea
            ref={inputRef}
            variant="borderless"
            autoSize={{ minRows: 1, maxRows: 5 }}
            maxLength={MAX_LENGTH}
            placeholder={t("apps.instagram.inbox.reply")}
            value={text}
            disabled={!chat.canReply}
            readOnly={isSending}
            onChange={(event) => setText(event.target.value)}
            onPressEnter={(event) => {
              // Enter sends; Shift+Enter keeps the line break.
              if (!event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
          />

          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<SendOutlined />}
            loading={isSending}
            disabled={!canSend}
            onClick={handleSend}
            aria-label={t("apps.instagram.inbox.send")}
          />
        </div>

        <div
          className="mt-1 pl-4 text-xs"
          style={{ color: token.colorTextTertiary }}
        >
          {chat.canReply
            ? t("apps.instagram.window.open").replace(
                "{time}",
                dayjs(chat.replyWindowEndsAt).format("DD/MM HH:mm"),
              )
            : t("apps.instagram.inbox.sendHint")}
        </div>
      </div>

      <LinkCustomerModal
        open={isLinkOpen}
        onClose={() => setIsLinkOpen(false)}
        onPick={(customer: ICustomer) => {
          setIsLinkOpen(false);

          runCustomerAction(
            () =>
              serviceMethodsInstance.instagramServiceMethods.linkCustomer(
                chat.igsid,
                customer._id,
              ),
            "apps.instagram.customer.linked",
          );
        }}
      />
    </div>
  );
}
