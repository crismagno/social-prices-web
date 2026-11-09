"use client";

import { useEffect, useRef, useState } from "react";

import { Alert, App, Button, Input, Segmented, theme } from "antd";
import type { TextAreaRef } from "antd/es/input/TextArea";
import dayjs from "dayjs";

import {
  AudioOutlined,
  CloseOutlined,
  DeleteOutlined,
  PaperClipOutlined,
  SendOutlined,
} from "@ant-design/icons";

import AppIcon from "../../components/common/AppIcon/AppIcon";
import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import InboxEnum from "../../shared/business/inbox/inbox.enum";
import QuickMessagesEnum from "../../shared/business/quick-messages/quick-messages.enum";
import {
  IQuickMessageAvailable,
  IQuickMessageSendResult,
} from "../../shared/business/quick-messages/quick-messages.types";
import {
  IInboxChat,
  IInboxConversation,
  IInboxMessage,
} from "../../shared/business/inbox/inbox.types";
import { useTypingSignal } from "../../shared/hooks/useTypingSignal";
import { formatFileSize } from "../apps/telegram/telegram-display";
import {
  MAX_RECORDING_SECONDS,
  useVoiceRecorder,
} from "../apps/telegram/useVoiceRecorder";
import { conversationName } from "./chats-display";
import ChatsQuickMessages from "./ChatsQuickMessages";
import { useQuickMessages } from "./useQuickMessages";

// Instagram and Messenger refuse anything longer than this in one message.
const MAX_LENGTH: number = 1000;

interface Props {
  chat: IInboxChat;
  onSent: (message: IInboxMessage) => void;
}

// Answers a customer. The answer goes by default through the conversation of the
// last message received; the control above the box sends it through another
// channel (or another contact) of the same customer instead. Files and
// recordings go where the channel takes them.
export default function ChatsReplyBox({ chat, onSent }: Props) {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const { token } = theme.useToken();

  const [text, setText] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);

  const [isSending, setIsSending] = useState<boolean>(false);

  // Null while the user has not chosen: then the default follows the newest message.
  const [chosenId, setChosenId] = useState<string | null>(null);

  const inputRef = useRef<TextAreaRef | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const quickMessages = useQuickMessages();

  // Set at once on click: two quick clicks must not send the message twice.
  const isSendingQuickRef = useRef<boolean>(false);

  const target: IInboxConversation | undefined =
    chat.conversations.find(
      (conversation: IInboxConversation) =>
        conversation._id === (chosenId ?? chat.replyConversationId),
    ) ?? chat.conversations[0];

  // Telegram takes MP3, Messenger plays WAV.
  const recorder = useVoiceRecorder(
    (error: unknown) => {
      message.error(t("chats.media.microphoneDenied"));
      console.error(error);
    },
    target?.channel === InboxEnum.Channel.MESSENGER ? "wav" : "mp3",
  );

  // While the user writes, the person sees "typing…" on the channel the answer goes to.
  useTypingSignal(text, !!target?.canReply, () =>
    serviceMethodsInstance.inboxServiceMethods.sendTyping(target?._id ?? ""),
  );

  useEffect(() => {
    setChosenId(null);
    setText("");
    setFile(null);
  }, [chat.key]);

  // Another conversation, or leaving: a half-made recording is not sent anywhere.
  useEffect(() => recorder.cancel, [chat.key, chosenId]);

  // A recording stops by itself at the limit, and is sent.
  useEffect(() => {
    if (
      recorder.state === "recording" &&
      recorder.seconds >= MAX_RECORDING_SECONDS
    ) {
      sendVoice();
    }
  }, [recorder.seconds, recorder.state]);

  if (!target) {
    return null;
  }

  const isRecording: boolean = recorder.state !== "idle";

  const takesFile: boolean = target.canSendMedia;

  const canSend: boolean =
    target.canReply &&
    (text.trim().length > 0 || (!!file && takesFile)) &&
    !isSending;

  const pickFile = (picked: File | undefined): void => {
    if (!picked) {
      return;
    }

    if (target.maxUploadBytes !== null && picked.size > target.maxUploadBytes) {
      message.error(
        t("chats.media.tooLarge").replace(
          "{size}",
          formatFileSize(target.maxUploadBytes),
        ),
      );

      return;
    }

    setFile(picked);
    inputRef.current?.focus();
  };

  const send = async (): Promise<void> => {
    if (!canSend) {
      return;
    }

    try {
      setIsSending(true);

      const sent: IInboxMessage = file
        ? await serviceMethodsInstance.inboxServiceMethods.sendMedia(
            target._id,
            file,
            text,
          )
        : await serviceMethodsInstance.inboxServiceMethods.reply(
            target._id,
            text.trim(),
          );

      onSent(sent);

      setText("");
      setFile(null);
    } catch (error: any) {
      // The server's words say what is wrong (window closed, file refused...).
      handleClientError(error);
    } finally {
      setIsSending(false);

      inputRef.current?.focus();
    }
  };

  // A quick message replaces what was typed (it was only there to find it).
  const sendQuickMessage = async (
    quickMessage: IQuickMessageAvailable,
  ): Promise<void> => {
    if (isSending || isSendingQuickRef.current) {
      return;
    }

    isSendingQuickRef.current = true;

    try {
      setIsSending(true);

      const result: IQuickMessageSendResult =
        await serviceMethodsInstance.quickMessagesServiceMethods.send(
          quickMessage._id,
          target._id,
        );

      result.messages.forEach(onSent);

      setText("");
      setFile(null);
    } catch (error: any) {
      const data = error?.response?.data;

      if (data?.code === QuickMessagesEnum.ErrorCode.PARTIAL_SEND) {
        (data.messages ?? []).forEach(onSent);

        message.error(
          t("quickMessages.partial")
            .replace("{sent}", String(data.sentCount))
            .replace("{total}", String(data.totalCount)),
        );
      } else {
        handleClientError(error);
      }

      // Someone may have changed who can use it, or removed it.
      quickMessages.reload();
    } finally {
      isSendingQuickRef.current = false;

      setIsSending(false);

      inputRef.current?.focus();
    }
  };

  async function sendVoice(): Promise<void> {
    const recording: File | null = await recorder.finish();

    if (!recording || !target) {
      return;
    }

    try {
      setIsSending(true);

      onSent(
        await serviceMethodsInstance.inboxServiceMethods.sendMedia(
          target._id,
          recording,
          "",
          true,
        ),
      );
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsSending(false);
    }
  }

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

      {!isRecording && (
        <ChatsQuickMessages
          list={quickMessages.list}
          query={text}
          target={target}
          disabled={isSending}
          onSend={sendQuickMessage}
        />
      )}

      {file && (
        <div
          className="mb-2 flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm"
          style={{ background: token.colorFillSecondary }}
        >
          <PaperClipOutlined />

          <span className="min-w-0 flex-1 truncate">{file.name}</span>

          {!takesFile && (
            <span className="text-xs" style={{ color: token.colorError }}>
              {t("chats.media.noMedia")}
            </span>
          )}

          <span className="text-xs" style={{ color: token.colorTextSecondary }}>
            {formatFileSize(file.size)}
          </span>

          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            disabled={isSending}
            onClick={() => setFile(null)}
            aria-label={t("chats.media.removeFile")}
          />
        </div>
      )}

      <div
        className="flex items-end gap-2 rounded-3xl py-1 pl-1 pr-1"
        style={{
          border: `1px solid ${token.colorBorder}`,
          background: token.colorBgContainer,
        }}
      >
        {isRecording ? (
          <>
            <Button
              type="text"
              shape="circle"
              size="large"
              danger
              icon={<DeleteOutlined />}
              disabled={recorder.state === "encoding"}
              onClick={recorder.cancel}
              aria-label={t("chats.media.cancelRecording")}
            />

            <div className="flex flex-1 items-center gap-2 self-center">
              <span
                className="inline-block h-2.5 w-2.5 animate-pulse rounded-full"
                style={{ background: token.colorError }}
              />

              <span className="tabular-nums">
                {Math.floor(recorder.seconds / 60)}:
                {String(recorder.seconds % 60).padStart(2, "0")}
              </span>
            </div>

            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<SendOutlined />}
              loading={recorder.state === "encoding" || isSending}
              onClick={sendVoice}
              aria-label={t("chats.reply.send")}
            />
          </>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={(event) => {
                pickFile(event.target.files?.[0]);
                // The same file can be picked again after it was removed.
                event.target.value = "";
              }}
            />

            <Button
              type="text"
              shape="circle"
              size="large"
              icon={<PaperClipOutlined />}
              disabled={isSending || !target.canReply || !takesFile}
              title={takesFile ? undefined : t("chats.media.noMedia")}
              onClick={() => fileInputRef.current?.click()}
              aria-label={t("chats.media.attach")}
            />

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

            {canSend || isSending || !target.canSendVoice ? (
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
            ) : (
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<AudioOutlined />}
                disabled={!target.canReply}
                onClick={recorder.start}
                aria-label={t("chats.media.record")}
              />
            )}
          </>
        )}
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
