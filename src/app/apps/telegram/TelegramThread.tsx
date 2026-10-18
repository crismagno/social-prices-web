"use client";

import { Fragment, useEffect, useRef, useState } from "react";

import {
  App,
  Avatar,
  Button,
  Input,
  Popconfirm,
  Space,
  Spin,
  theme,
} from "antd";
import dayjs from "dayjs";
import Link from "next/link";

import {
  ArrowLeftOutlined,
  LinkOutlined,
  SendOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import TelegramEnum from "../../../shared/business/apps/telegram/telegram.enum";
import {
  ITelegramChat,
  ITelegramMessage,
} from "../../../shared/business/apps/telegram/telegram.types";
import { ICustomer } from "../../../shared/business/customers/customer.interface";
import Urls from "../../../shared/common/routes-app/routes-app";
import LinkCustomerModal from "./LinkCustomerModal";
import { chatDisplayName, chatInitial, relativeDay } from "./telegram-display";
import { avatarColor } from "./telegram-theme";
import { useTelegramMessages } from "./useTelegramMessages";

// Telegram refuses anything longer than this in a single message.
const MAX_LENGTH: number = 4096;

interface Props {
  chat: ITelegramChat;
  onChatChanged: () => void;
  onBack?: () => void;
}

export default function TelegramThread({ chat, onChatChanged, onBack }: Props) {
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
  } = useTelegramMessages(chat.chatId);

  const [text, setText] = useState<string>("");

  const [isSending, setIsSending] = useState<boolean>(false);

  const [isCustomerBusy, setIsCustomerBusy] = useState<boolean>(false);

  const [isLinkOpen, setIsLinkOpen] = useState<boolean>(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const name: string = chatDisplayName(chat, t("apps.telegram.unnamed"));

  const lastMessageId: string | undefined = messages[messages.length - 1]?._id;

  // Reading goes to the newest message; loading older ones does not move it.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lastMessageId, chat.chatId]);

  const canSend: boolean = text.trim().length > 0 && !isSending;

  const handleSend = async (): Promise<void> => {
    if (!canSend) {
      return;
    }

    try {
      setIsSending(true);

      const sent =
        await serviceMethodsInstance.telegramServiceMethods.sendMessage(
          chat.chatId,
          text,
        );

      addMessage(sent);

      setText("");

      onChatChanged();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSending(false);
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
      // The server's message already says what is wrong (limit reached, already linked...).
      handleClientError(error);
    } finally {
      setIsCustomerBusy(false);
    }
  };

  const contentLabel = (item: ITelegramMessage): string =>
    item.contentType === TelegramEnum.ContentType.TEXT
      ? (item.text ?? "")
      : [`[${t(`apps.telegram.content.${item.contentType}`)}]`, item.text]
          .filter(Boolean)
          .join(" ");

  // "Today", "Yesterday", or the date: the label of the separator above a day.
  const dayLabel = (at: string): string => {
    const day = relativeDay(at);

    return day === "today"
      ? t("apps.telegram.inbox.today")
      : day === "yesterday"
        ? t("apps.telegram.inbox.yesterday")
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
            title={t("apps.telegram.customer.open")}
          >
            {chat.customerName ?? t("apps.telegram.customer.open")}
          </Button>
        </Link>

        <Popconfirm
          title={t("apps.telegram.customer.unlinkConfirm")}
          onConfirm={() =>
            runCustomerAction(
              () =>
                serviceMethodsInstance.telegramServiceMethods.unlinkCustomer(
                  chat.chatId,
                ),
              "apps.telegram.customer.unlinked",
            )
          }
        >
          <Button size="small" type="text" loading={isCustomerBusy}>
            {t("apps.telegram.customer.unlink")}
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
                serviceMethodsInstance.telegramServiceMethods.createCustomer(
                  chat.chatId,
                ),
              "apps.telegram.customer.created",
            )
          }
        >
          {t("apps.telegram.customer.create")}
        </Button>

        <Button
          size="small"
          icon={<LinkOutlined />}
          disabled={isCustomerBusy}
          onClick={() => setIsLinkOpen(true)}
        >
          {t("apps.telegram.customer.link")}
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
              aria-label={t("apps.telegram.inbox.back")}
            />
          )}

          <Avatar
            size={40}
            style={{
              backgroundColor: avatarColor(chat.telegramUserId),
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
              {t("apps.telegram.inbox.loadOlder")}
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
            {t("apps.telegram.inbox.noMessages")}
          </div>
        ) : (
          messages.map((item: ITelegramMessage, index: number) => {
            const isOut: boolean =
              item.direction === TelegramEnum.Direction.OUT;

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
                  className={`flex ${isOut ? "justify-end" : "justify-start"}`}
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
                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {contentLabel(item)}
                    </div>

                    <div
                      className="mt-0.5 text-right text-[11px]"
                      style={{ opacity: 0.7 }}
                    >
                      {dayjs(item.sentAt).format("HH:mm")}
                    </div>
                  </div>
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
        <div
          className="flex items-end gap-2 rounded-3xl py-1 pl-4 pr-1"
          style={{
            border: `1px solid ${token.colorBorder}`,
            background: token.colorBgContainer,
          }}
        >
          <Input.TextArea
            variant="borderless"
            autoSize={{ minRows: 1, maxRows: 5 }}
            maxLength={MAX_LENGTH}
            placeholder={t("apps.telegram.inbox.reply")}
            value={text}
            disabled={isSending}
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
            aria-label={t("apps.telegram.inbox.send")}
          />
        </div>

        <div
          className="mt-1 pl-4 text-xs"
          style={{ color: token.colorTextTertiary }}
        >
          {t("apps.telegram.inbox.sendHint")}
        </div>
      </div>

      <LinkCustomerModal
        open={isLinkOpen}
        onClose={() => setIsLinkOpen(false)}
        onPick={(customer: ICustomer) => {
          setIsLinkOpen(false);

          runCustomerAction(
            () =>
              serviceMethodsInstance.telegramServiceMethods.linkCustomer(
                chat.chatId,
                customer._id,
              ),
            "apps.telegram.customer.linked",
          );
        }}
      />
    </div>
  );
}
