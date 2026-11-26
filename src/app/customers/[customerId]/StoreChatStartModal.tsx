"use client";

import { useEffect, useRef, useState } from "react";

import { Alert, App, Button, Input, Modal, Select, theme } from "antd";
import type { TextAreaRef } from "antd/es/input/TextArea";
import { useRouter } from "next/navigation";

import {
  AudioOutlined,
  CloseOutlined,
  DeleteOutlined,
  PaperClipOutlined,
  SendOutlined,
} from "@ant-design/icons";

import { useImageEditStep } from "../../../components/common/ImageEditor/useImageEditStep";
import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import QuickMessagesEnum from "../../../shared/business/quick-messages/quick-messages.enum";
import { IQuickMessageAvailable } from "../../../shared/business/quick-messages/quick-messages.types";
import {
  STORE_CHAT_MAX_TEXT,
  STORE_CHAT_MAX_UPLOAD_BYTES,
  StoreChatCodes,
  storeChatErrorCode,
} from "../../../shared/business/store-chat/store-chat.types";
import { IStore } from "../../../shared/business/stores/stores.interface";
import StoresEnum from "../../../shared/business/stores/stores.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import { formatFileSize } from "../../apps/telegram/telegram-display";
import {
  MAX_RECORDING_SECONDS,
  useVoiceRecorder,
} from "../../apps/telegram/useVoiceRecorder";
import ChatsQuickMessages from "../../chats/ChatsQuickMessages";
import { QuickMessageTarget } from "../../chats/quick-messages-filter";
import { useQuickMessages } from "../../chats/useQuickMessages";

interface Props {
  customerId: string;
  customerName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// What the store chat takes, for the quick messages to know which of them fit.
const STORE_CHAT_TARGET: QuickMessageTarget = {
  canReply: true,
  canSendMedia: true,
  maxUploadBytes: STORE_CHAT_MAX_UPLOAD_BYTES,
};

// Writes first to a customer on the platform's own chat, from one of the user's
// stores. The customer reads it in their account, so they need one.
export default function StoreChatStartModal({
  customerId,
  customerName,
  isOpen,
  onClose,
}: Props) {
  const { t } = useLanguageData();

  // Closing the window while something is on its way would hide how it ended.
  const [isBusy, setIsBusy] = useState<boolean>(false);

  return (
    <Modal
      open={isOpen}
      title={t("storeChat.start.title").replace(
        "{name}",
        customerName ?? t("chats.unnamed"),
      )}
      footer={null}
      closable={!isBusy}
      maskClosable={!isBusy}
      keyboard={!isBusy}
      onCancel={onClose}
      destroyOnClose
    >
      {/* Mounted only while open: the stores, the quick messages and the
          microphone are asked for when someone is really about to write. */}
      <StoreChatStartComposer
        customerId={customerId}
        onBusyChange={setIsBusy}
        onClose={onClose}
      />
    </Modal>
  );
}

interface ComposerProps {
  customerId: string;
  onBusyChange: (isBusy: boolean) => void;
  onClose: () => void;
}

// The first message: a text, a file with a caption, a recording or a quick
// message. The text goes with the request that opens the conversation; anything
// else opens it empty first and then goes through the central inbox, like an answer.
function StoreChatStartComposer({
  customerId,
  onBusyChange,
  onClose,
}: ComposerProps) {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const { token } = theme.useToken();

  const router = useRouter();

  const [stores, setStores] = useState<IStore[]>([]);

  const [isLoadingStores, setIsLoadingStores] = useState<boolean>(true);

  const [storeId, setStoreId] = useState<string | null>(null);

  const [text, setText] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);

  const [isSending, setIsSending] = useState<boolean>(false);

  const [hasNoAccount, setHasNoAccount] = useState<boolean>(false);

  const inputRef = useRef<TextAreaRef | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Pictures are cropped and turned before they are attached.
  const { editIfImage, editor: imageEditor } = useImageEditStep();

  // Set at once on click: two quick clicks must not send the message twice.
  const isSendingRef = useRef<boolean>(false);

  const quickMessages = useQuickMessages();

  const recorder = useVoiceRecorder((error: unknown) => {
    message.error(t("chats.media.microphoneDenied"));
    console.error(error);
  });

  useEffect(() => {
    let isCurrent = true;

    serviceMethodsInstance.storesServiceMethods
      .findByUser()
      .then((found: IStore[]) => {
        if (!isCurrent) {
          return;
        }

        // Only a store that takes messages can start one.
        const usable: IStore[] = found.filter(
          (store: IStore) =>
            store.status === StoresEnum.Status.ACTIVE && !store.softDelete,
        );

        setStores(usable);
        setStoreId(usable[0]?._id ?? null);
      })
      .catch((error: any) => handleClientError(error))
      .finally(() => {
        if (isCurrent) {
          setIsLoadingStores(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  // A recording stops by itself at the limit, and is sent.
  useEffect(() => {
    if (
      recorder.state === "recording" &&
      recorder.seconds >= MAX_RECORDING_SECONDS
    ) {
      sendVoice();
    }
  }, [recorder.seconds, recorder.state]);

  const isRecording: boolean = recorder.state !== "idle";

  const isBlocked: boolean = !storeId || hasNoAccount;

  const canSend: boolean =
    !isBlocked && (text.trim().length > 0 || !!file) && !isSending;

  // The conversation, opened with nothing in it. Nobody sees it until a
  // message is there.
  const openConversation = async (): Promise<string> => {
    const started =
      await serviceMethodsInstance.storeChatServiceMethods.startWithCustomer(
        customerId,
        storeId ?? "",
      );

    return started.conversationId;
  };

  const goToChat = (): void => {
    onClose();

    router.push(Urls.CHATS_CUSTOMER.replace(":customerId", customerId));
  };

  // Runs one way of sending. True when the message went.
  const deliver = async (action: () => Promise<void>): Promise<boolean> => {
    if (isBlocked || isSendingRef.current) {
      return false;
    }

    isSendingRef.current = true;

    setIsSending(true);
    onBusyChange(true);

    try {
      await action();

      return true;
    } catch (error: any) {
      // Explained here, where the text still is, rather than in a passing toast.
      if (storeChatErrorCode(error) === StoreChatCodes.NO_ACCOUNT) {
        setHasNoAccount(true);
      } else if (
        error?.response?.data?.code === QuickMessagesEnum.ErrorCode.PARTIAL_SEND
      ) {
        message.error(
          t("quickMessages.partial")
            .replace("{sent}", String(error.response.data.sentCount))
            .replace("{total}", String(error.response.data.totalCount)),
        );

        // Part of it is there already: the rest is sorted out in the chat.
        if (error.response.data.sentCount > 0) {
          goToChat();
        }
      } else {
        handleClientError(error);
      }

      return false;
    } finally {
      isSendingRef.current = false;

      setIsSending(false);
      onBusyChange(false);
    }
  };

  const finish = (wasSent: boolean): void => {
    if (!wasSent) {
      return;
    }

    message.success(t("storeChat.start.sent"));

    goToChat();
  };

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

    finish(
      await deliver(async () => {
        if (!file) {
          await serviceMethodsInstance.storeChatServiceMethods.startWithCustomer(
            customerId,
            storeId ?? "",
            text.trim(),
          );

          return;
        }

        await serviceMethodsInstance.inboxServiceMethods.sendMedia(
          await openConversation(),
          file,
          text,
        );
      }),
    );
  };

  const sendQuickMessage = async (
    quickMessage: IQuickMessageAvailable,
  ): Promise<void> => {
    const wasSent: boolean = await deliver(async () => {
      await serviceMethodsInstance.quickMessagesServiceMethods.send(
        quickMessage._id,
        await openConversation(),
      );
    });

    if (!wasSent) {
      // Someone may have changed who can use it, or removed it.
      quickMessages.reload();
    }

    finish(wasSent);
  };

  async function sendVoice(): Promise<void> {
    const recording: File | null = await recorder.finish();

    if (!recording) {
      return;
    }

    finish(
      await deliver(async () => {
        await serviceMethodsInstance.inboxServiceMethods.sendMedia(
          await openConversation(),
          recording,
          "",
          true,
        );
      }),
    );
  }

  const hasNoStore: boolean = !isLoadingStores && !stores.length;

  return (
    <div className="flex flex-col gap-3">
      {hasNoAccount && (
        <Alert
          type="warning"
          showIcon
          message={t("storeChat.start.noAccount")}
        />
      )}

      {hasNoStore && (
        <Alert type="info" showIcon message={t("storeChat.start.noStore")} />
      )}

      {stores.length > 1 && (
        <div className="flex flex-col gap-1">
          <label className="font-bold">{t("storeChat.start.store")}</label>

          <Select
            value={storeId}
            loading={isLoadingStores}
            disabled={isSending || isRecording}
            onChange={(value: string) => setStoreId(value)}
            options={stores.map((store: IStore) => ({
              value: store._id,
              label: store.name,
            }))}
          />
        </div>
      )}

      <div>
        {!isRecording && (
          <ChatsQuickMessages
            list={quickMessages.list}
            query={text}
            target={STORE_CHAT_TARGET}
            disabled={isSending || isBlocked}
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

            <span
              className="text-xs"
              style={{ color: token.colorTextSecondary }}
            >
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
                disabled={recorder.state === "encoding" || isSending}
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
                aria-label={t("storeChat.start.send")}
              />
            </>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={(event) => {
                  const picked: File | undefined = event.target.files?.[0];
                  // The same file can be picked again after it was removed.
                  event.target.value = "";
                  // A picture passes through the image editor first.
                  if (picked) {
                    editIfImage(picked).then(pickFile);
                  }
                }}
              />
              {imageEditor}

              <Button
                type="text"
                shape="circle"
                size="large"
                icon={<PaperClipOutlined />}
                disabled={isSending || isBlocked}
                onClick={() => fileInputRef.current?.click()}
                aria-label={t("chats.media.attach")}
              />

              <Input.TextArea
                ref={inputRef}
                autoFocus
                variant="borderless"
                autoSize={{ minRows: 1, maxRows: 6 }}
                maxLength={STORE_CHAT_MAX_TEXT}
                placeholder={t("storeChat.start.placeholder")}
                value={text}
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

              {canSend || isSending ? (
                <Button
                  type="primary"
                  shape="circle"
                  size="large"
                  icon={<SendOutlined />}
                  loading={isSending}
                  disabled={!canSend}
                  onClick={send}
                  aria-label={t("storeChat.start.send")}
                />
              ) : (
                <Button
                  type="primary"
                  shape="circle"
                  size="large"
                  icon={<AudioOutlined />}
                  disabled={isBlocked}
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
          {t("chats.reply.sendHint")}
        </div>
      </div>
    </div>
  );
}
