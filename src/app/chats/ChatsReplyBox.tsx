"use client";

import { useEffect, useRef, useState } from "react";

import { Alert, Button, Input, Segmented, theme } from "antd";
import type { TextAreaRef } from "antd/es/input/TextArea";
import dayjs from "dayjs";

import { SendOutlined } from "@ant-design/icons";

import AppIcon from "../../components/common/AppIcon/AppIcon";
import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import InboxEnum from "../../shared/business/inbox/inbox.enum";
import {
  IInboxChat,
  IInboxConversation,
  IInboxMessage,
} from "../../shared/business/inbox/inbox.types";
import { conversationName } from "./chats-display";

// Instagram and Messenger refuse anything longer than this in one message.
const MAX_LENGTH: number = 1000;

interface Props {
  chat: IInboxChat;
  onSent: (message: IInboxMessage) => void;
}

// Answers a customer. The answer goes by default through the conversation of the
// last message received; the control above the box sends it through another
// channel (or another contact) of the same customer instead.
export default function ChatsReplyBox({ chat, onSent }: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const [text, setText] = useState<string>("");

  const [isSending, setIsSending] = useState<boolean>(false);

  // Null while the user has not chosen: then the default follows the newest message.
  const [chosenId, setChosenId] = useState<string | null>(null);

  const inputRef = useRef<TextAreaRef | null>(null);

  useEffect(() => {
    setChosenId(null);
    setText("");
  }, [chat.key]);

  const target: IInboxConversation | undefined =
    chat.conversations.find(
      (conversation: IInboxConversation) =>
        conversation._id === (chosenId ?? chat.replyConversationId),
    ) ?? chat.conversations[0];

  if (!target) {
    return null;
  }

  const canSend: boolean =
    target.canReply && text.trim().length > 0 && !isSending;

  const send = async (): Promise<void> => {
    if (!canSend) {
      return;
    }

    try {
      setIsSending(true);

      onSent(
        await serviceMethodsInstance.inboxServiceMethods.reply(
          target._id,
          text.trim(),
        ),
      );

      setText("");
    } catch (error: any) {
      // The server's words say what is wrong (window closed, person unreachable...).
      handleClientError(error);
    } finally {
      setIsSending(false);

      inputRef.current?.focus();
    }
  };

  return (
    <div
      className="px-4 py-3"
      style={{ borderTop: `1px solid ${token.colorBorderSecondary}` }}
    >
      {chat.conversations.length > 1 && (
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <span style={{ color: token.colorTextSecondary }}>
            {t("chats.reply.via")}
          </span>

          <Segmented
            size="small"
            value={target._id}
            onChange={(value) => setChosenId(String(value))}
            options={chat.conversations.map(
              (conversation: IInboxConversation) => ({
                value: conversation._id,
                label: (
                  <span className="flex items-center gap-1">
                    <AppIcon app={InboxEnum.ChannelApp[conversation.channel]} />

                    {conversationName(conversation, t("chats.unnamed"))}
                  </span>
                ),
              }),
            )}
          />
        </div>
      )}

      {!target.canReply && (
        <Alert
          className="mb-2"
          type="warning"
          showIcon
          message={t("chats.reply.windowClosed")}
          description={t("chats.reply.windowClosedHint")}
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
          placeholder={t("chats.reply.placeholder")}
          value={text}
          disabled={!target.canReply}
          readOnly={isSending}
          onChange={(event) => setText(event.target.value)}
          onPressEnter={(event) => {
            // Enter sends; Shift+Enter keeps the line break.
            if (!event.shiftKey) {
              event.preventDefault();
              send();
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
          onClick={send}
          aria-label={t("chats.reply.send")}
        />
      </div>

      <div
        className="mt-1 pl-4 text-xs"
        style={{ color: token.colorTextTertiary }}
      >
        {target.canReply && target.replyWindowEndsAt
          ? t("chats.reply.windowOpen").replace(
              "{time}",
              dayjs(target.replyWindowEndsAt).format("DD/MM HH:mm"),
            )
          : t("chats.reply.sendHint")}
      </div>
    </div>
  );
}
