"use client";

import { useEffect, useRef, useState } from "react";

import { Alert, App, Button, Input, Segmented, theme } from "antd";
import type { TextAreaRef } from "antd/es/input/TextArea";
import dayjs from "dayjs";

import {
  AudioOutlined,
  DeleteOutlined,
  PaperClipOutlined,
  SendOutlined,
} from "@ant-design/icons";

import ChannelIcon from "../../components/common/ChannelIcon/ChannelIcon";
import EmojiPickerButton from "../../components/common/EmojiPicker/EmojiPickerButton";
import { insertEmoji } from "../../components/common/EmojiPicker/insert-emoji";
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
import {
  MAX_RECORDING_SECONDS,
  useVoiceRecorder,
} from "../apps/telegram/useVoiceRecorder";
import { conversationName } from "./chats-display";
import ChatsMediaComposer from "./ChatsMediaComposer";
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

  // The files picked, pasted or dropped, waiting in the composer to be sent.
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const [isDragging, setIsDragging] = useState<boolean>(false);

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
    setMediaFiles([]);
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
    target.canReply && text.trim().length > 0 && !isSending;

  const canAttach: boolean = target.canReply && takesFile && !isSending;

  // Files go to the composer, to be seen and chosen before they are sent.
  const pickFiles = (picked: File[]): void => {
    if (!picked.length) {
      return;
    }

    if (!canAttach) {
      message.warning(t("chats.media.noMedia"));

      return;
    }

    setMediaFiles(picked);
  };

  const sendOneFile = async (file: File, caption: string): Promise<void> => {
    onSent(
      await serviceMethodsInstance.inboxServiceMethods.sendMedia(
        target._id,
        file,
        caption,
      ),
    );
  };

  const pickEmoji = (emoji: string): void =>
    insertEmoji(
      inputRef.current?.resizableTextArea?.textArea,
      text,
      emoji,
      MAX_LENGTH,
      setText,
    );

  const send = async (): Promise<void> => {
    if (!canSend) {
      return;
    }

    try {
      setIsSending(true);

      const sent: IInboxMessage =
        await serviceMethodsInstance.inboxServiceMethods.reply(
          target._id,
          text.trim(),
        );

      onSent(sent);

      setText("");
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
                    <ChannelIcon channel={conversation.channel} />

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

      <ChatsMediaComposer
        files={mediaFiles}
        initialCaption={text}
        maxUploadBytes={target.maxUploadBytes}
        sendOne={sendOneFile}
        onClose={(isSent: boolean) => {
          setMediaFiles([]);

          // The words went as the first file's caption.
          if (isSent) {
            setText("");
          }

          inputRef.current?.focus();
        }}
      />

      <div
        className="flex items-end gap-2 rounded-3xl py-1 pl-1 pr-1"
        style={{
          border: `1px ${isDragging ? "dashed" : "solid"} ${
            isDragging ? token.colorPrimary : token.colorBorder
          }`,
          background: isDragging
            ? token.colorPrimaryBg
            : token.colorBgContainer,
        }}
        // Files dropped on the box open the composer, as picked ones do.
        onDragOver={(event) => {
          if (canAttach && event.dataTransfer.types.includes("Files")) {
            event.preventDefault();
            setIsDragging(true);
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          if (!event.dataTransfer.files.length) {
            return;
          }

          event.preventDefault();
          setIsDragging(false);
          pickFiles(Array.from(event.dataTransfer.files));
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
              multiple
              hidden
              onChange={(event) => {
                const picked: File[] = Array.from(event.target.files ?? []);
                // The same files can be picked again after they were removed.
                event.target.value = "";
                pickFiles(picked);
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

            <EmojiPickerButton
              label={t("chats.reply.emoji")}
              disabled={isSending || !target.canReply}
              onPick={pickEmoji}
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
              // A picture pasted (a screenshot, say) opens the composer.
              onPaste={(event) => {
                const pasted: File[] = Array.from(event.clipboardData.files);

                if (pasted.length) {
                  event.preventDefault();
                  pickFiles(pasted);
                }
              }}
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
