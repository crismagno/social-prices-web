"use client";

import { useEffect, useRef, useState } from "react";

import { App, Button, Input, theme } from "antd";
import type { TextAreaRef } from "antd/es/input/TextArea";

import {
  AudioOutlined,
  CloseOutlined,
  DeleteOutlined,
  PaperClipOutlined,
  SendOutlined,
} from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  STORE_CHAT_MAX_TEXT,
  STORE_CHAT_MAX_UPLOAD_BYTES,
} from "../../../shared/business/store-chat/store-chat.types";
import { useTypingSignal } from "../../../shared/hooks/useTypingSignal";
import { formatFileSize } from "../../apps/telegram/telegram-display";
import {
  MAX_RECORDING_SECONDS,
  useVoiceRecorder,
} from "../../apps/telegram/useVoiceRecorder";

interface Props {
  isSending: boolean;
  // Tells the store that the customer is writing. Best effort.
  onTyping: () => Promise<unknown>;
  // Each says whether it went: what was typed or picked is only cleared then.
  onSendText: (text: string) => Promise<boolean>;
  onSendMedia: (
    file: File,
    caption: string,
    asVoice: boolean,
  ) => Promise<boolean>;
}

// Where the customer writes to the store: a text, a file with an optional
// caption, or a recording from the microphone. Built like the stores' reply box.
export default function CustomerChatsComposer({
  isSending,
  onTyping,
  onSendText,
  onSendMedia,
}: Props) {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const { token } = theme.useToken();

  const [text, setText] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);

  const inputRef = useRef<TextAreaRef | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const recorder = useVoiceRecorder((error: unknown) => {
    message.error(t("chats.media.microphoneDenied"));
    console.error(error);
  }, "mp3");

  // While the customer writes, the store sees "typing…".
  useTypingSignal(text, true, onTyping);

  // Leaving the conversation: a half-made recording is not sent anywhere.
  useEffect(() => recorder.cancel, []);

  const isRecording: boolean = recorder.state !== "idle";

  const canSend: boolean = (text.trim().length > 0 || !!file) && !isSending;

  const pickFile = (picked: File | undefined): void => {
    if (!picked) {
      return;
    }

    if (picked.size > STORE_CHAT_MAX_UPLOAD_BYTES) {
      message.error(
        t("chats.media.tooLarge").replace(
          "{size}",
          formatFileSize(STORE_CHAT_MAX_UPLOAD_BYTES),
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

    const hasGone: boolean = file
      ? await onSendMedia(file, text, false)
      : await onSendText(text);

    if (hasGone) {
      setText("");
      setFile(null);
    }

    inputRef.current?.focus();
  };

  async function sendVoice(): Promise<void> {
    const recording: File | null = await recorder.finish();

    if (recording) {
      await onSendMedia(recording, "", true);
    }
  }

  // A recording stops by itself at the limit, and is sent.
  useEffect(() => {
    if (
      recorder.state === "recording" &&
      recorder.seconds >= MAX_RECORDING_SECONDS
    ) {
      sendVoice();
    }
  }, [recorder.seconds, recorder.state]);

  return (
    <div
      className="px-4 py-3"
      style={{ borderTop: `1px solid ${token.colorBorderSecondary}` }}
    >
      {file && (
        <div
          className="mb-2 flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm"
          style={{ background: token.colorFillSecondary }}
        >
          <PaperClipOutlined />

          <span className="min-w-0 flex-1 truncate">{file.name}</span>

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
              aria-label={t("customerChats.send")}
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
              disabled={isSending}
              onClick={() => fileInputRef.current?.click()}
              aria-label={t("chats.media.attach")}
              title={t("chats.media.attach")}
            />

            <Input.TextArea
              ref={inputRef}
              variant="borderless"
              autoSize={{ minRows: 1, maxRows: 5 }}
              maxLength={STORE_CHAT_MAX_TEXT}
              placeholder={t("customerChats.placeholder")}
              value={text}
              readOnly={isSending}
              onChange={(event) => setText(event.target.value)}
              onPressEnter={(event) => {
                // Enter sends; Shift+Enter keeps the line break.
                if (!event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  send();
                }
              }}
            />

            {canSend || isSending ? (
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<SendOutlined />}
                loading={isSending}
                disabled={!canSend}
                onClick={send}
                aria-label={t("customerChats.send")}
              />
            ) : (
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<AudioOutlined />}
                onClick={recorder.start}
                aria-label={t("chats.media.record")}
                title={t("chats.media.record")}
              />
            )}
          </>
        )}
      </div>

      <div
        className="mt-1 pl-4 text-xs"
        style={{ color: token.colorTextTertiary }}
      >
        {t("chats.reply.sendHint")}
      </div>
    </div>
  );
}
