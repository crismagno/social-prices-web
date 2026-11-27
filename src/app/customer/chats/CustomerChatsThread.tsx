"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";

import { App, Button, Popconfirm, Spin, theme } from "antd";
import dayjs from "dayjs";

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import TypingBubble from "../../../components/common/TypingBubble/TypingBubble";
import { useStoreChatTyping } from "../../../data/context/socket/useStoreChatTyping";
import ScrollToBottomButton from "../../../components/common/ScrollToBottomButton/ScrollToBottomButton";
import ChatText from "../../../components/common/ChatText/ChatText";
import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  IStoreChatMessage,
  IStoreChatStoreCard,
  STORE_CHAT_MAX_TEXT,
  STORE_CHAT_MAX_UPLOAD_BYTES,
  StoreChatCodes,
  storeChatErrorCode,
} from "../../../shared/business/store-chat/store-chat.types";
import { IInboxAttachment } from "../../../shared/business/inbox/inbox.types";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import Urls from "../../../shared/common/routes-app/routes-app";
import {
  formatFileSize,
  relativeDay,
} from "../../apps/telegram/telegram-display";
import ChatsAttachment from "../../chats/ChatsAttachment";
import ChatsMessageEditor, {
  ChatsEditedMark,
} from "../../chats/ChatsMessageEditor";
import CustomerChatsComposer from "./CustomerChatsComposer";
import StoreAvatar from "./StoreAvatar";
import { useCustomerThread } from "./useCustomerThread";

interface Props {
  storeId: string;
  // What the list already knows of the store, shown when it can no longer be
  // talked to (its history stays).
  knownStore: IStoreChatStoreCard | null;
  // Present on a phone, where the thread takes the place of the list.
  onBack?: () => void;
  onSent: () => void;
  // Leaves a store that is not there.
  onLeave: () => void;
}

// The right side: the conversation with one store, drawn like the stores' chat.
export default function CustomerChatsThread({
  storeId,
  knownStore,
  onBack,
  onSent,
  onLeave,
}: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const { message } = App.useApp();

  const {
    store,
    messages,
    isLoading,
    hasOlder,
    isLoadingOlder,
    isSending,
    loadOlder,
    send,
    sendMedia,
    edit,
    remove,
  } = useCustomerThread(storeId);

  // The message whose words are being changed, if any: one at a time.
  const [editingId, setEditingId] = useState<string | null>(null);

  const scroller = useRef<HTMLDivElement | null>(null);

  const lastId: string | undefined = messages[messages.length - 1]?._id;

  // The store is writing: shown for a few seconds, until its message arrives.
  const { isTyping, clear: clearTyping } = useStoreChatTyping(
    (event) => event.storeId === storeId,
  );

  useEffect(() => {
    clearTyping();
  }, [lastId, clearTyping]);

  // A new message at the end (or "typing…") brings the view down; older ones
  // loaded on top do not.
  useLayoutEffect(() => {
    if (scroller.current) {
      scroller.current.scrollTop = scroller.current.scrollHeight;
    }
  }, [lastId, isLoading, isTyping]);

  const shown: IStoreChatStoreCard | null = store ?? knownStore;

  const dayLabel = (at: string): string => {
    const day = relativeDay(at);

    return day === "today"
      ? t("chats.today")
      : day === "yesterday"
        ? t("chats.yesterday")
        : dayjs(at).format("DD/MM/YYYY");
  };

  // Says in the customer's words why the store did not get the message.
  const explain = (error: any): void => {
    const code: string | null = storeChatErrorCode(error);

    if (code === StoreChatCodes.DAILY_LIMIT) {
      message.warning(t("customerChats.errors.dailyLimit"));
    } else if (code === StoreChatCodes.OWN_STORE) {
      message.warning(t("customerChats.errors.ownStore"));
    } else if (
      code === StoreChatCodes.FILE_TOO_LARGE ||
      error?.response?.status === 413
    ) {
      message.error(
        t("chats.media.tooLarge").replace(
          "{size}",
          formatFileSize(STORE_CHAT_MAX_UPLOAD_BYTES),
        ),
      );
    } else if (error?.response?.status === 404) {
      message.warning(t("customerChats.storeUnavailable"));
    } else {
      handleClientError(error);
    }
  };

  // True when it went: the composer only then clears what was typed or picked.
  const deliver = async (act: () => Promise<boolean>): Promise<boolean> => {
    try {
      const hasGone: boolean = await act();

      if (hasGone) {
        onSent();
      }

      return hasGone;
    } catch (error: any) {
      explain(error);

      return false;
    }
  };

  // Thrown again after being explained, so the editor stays open.
  const onEdit = async (
    item: IStoreChatMessage,
    text: string,
  ): Promise<void> => {
    try {
      await edit(item._id, text);

      setEditingId(null);

      message.success(t("chats.edit.done"));

      // The list's preview follows the new words.
      onSent();
    } catch (error: any) {
      explain(error);

      throw error;
    }
  };

  const onDelete = async (item: IStoreChatMessage): Promise<void> => {
    try {
      await remove(item._id);

      message.success(t("chats.delete.done"));

      // The list's preview moves to what is now the newest message.
      onSent();
    } catch (error: any) {
      handleClientError(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin />
      </div>
    );
  }

  // Nothing to show at all: the store is not there and nothing was ever said.
  if (!shown && !messages.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <div style={{ opacity: 0.5, filter: "grayscale(1)" }}>
          <StoreAvatar store={null} size={72} />
        </div>

        <div className="text-lg font-semibold">
          {t("customerChats.storeUnavailable")}
        </div>

        <Button onClick={onLeave}>{t("customerChats.back")}</Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
      >
        {onBack && (
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            aria-label={t("customerChats.back")}
          />
        )}

        <StoreAvatar store={shown} size={40} />

        <div className="flex min-w-0 flex-col">
          <span className="truncate font-semibold">
            {shown?.name ?? t("customerChats.storeUnavailable")}
          </span>

          {/* While the store writes, the line under its name says so. */}
          {isTyping ? (
            <span
              className="truncate text-xs italic"
              style={{ color: token.colorPrimary }}
            >
              {t("chats.typing")}
            </span>
          ) : (
            shown?.description && (
              <span
                className="truncate text-xs"
                style={{ color: token.colorTextSecondary }}
              >
                {shown.description}
              </span>
            )
          )}
        </div>

        {store?.siteSlug && (
          <Button
            className="ml-auto shrink-0"
            icon={<GlobalOutlined />}
            href={Urls.SITE.replace(":slug", store.siteSlug)}
            target="_blank"
            rel="noopener"
          >
            {t("customerChats.visitSite")}
          </Button>
        )}
      </div>

      <div
        ref={scroller}
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

        {messages.length === 0 && (
          <div className="m-auto flex max-w-xs flex-col items-center gap-3 p-6 text-center">
            <StoreAvatar store={shown} size={72} />

            <div className="font-semibold">{shown?.name}</div>

            <div style={{ color: token.colorTextSecondary }}>
              {t("customerChats.firstMessage")}
            </div>
          </div>
        )}

        {messages.map((item: IStoreChatMessage, index: number) => {
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
                className={`group flex w-full items-center gap-1 ${item.fromMe ? "flex-row-reverse justify-start" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${item.fromMe ? "rounded-br-md" : "rounded-bl-md"}`}
                  style={{
                    background: item.fromMe
                      ? token.colorPrimary
                      : token.colorBgContainer,
                    color: item.fromMe
                      ? token.colorTextLightSolid
                      : token.colorText,
                  }}
                >
                  {item.attachments?.map((attachment: IInboxAttachment) => (
                    <div
                      key={attachment.index}
                      className={item.text ? "mb-1" : ""}
                    >
                      <ChatsAttachment
                        message={item}
                        attachment={attachment}
                        isOut={item.fromMe}
                        fetchBlob={() =>
                          serviceMethodsInstance.storeChatServiceMethods.getAttachment(
                            storeId,
                            item._id,
                            attachment.index,
                          )
                        }
                      />
                    </div>
                  ))}

                  {editingId === item._id ? (
                    <ChatsMessageEditor
                      initialText={item.text ?? ""}
                      maxLength={STORE_CHAT_MAX_TEXT}
                      onSave={(text: string) => onEdit(item, text)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    item.text && <ChatText text={item.text} isFormatted />
                  )}

                  <div
                    className="mt-0.5 flex items-center justify-end gap-1 text-[11px]"
                    style={{ opacity: 0.8 }}
                  >
                    <ChatsEditedMark editedAt={item.editedAt} />

                    <span>{dayjs(item.sentAt).format("HH:mm")}</span>
                  </div>
                </div>

                {/* Only what the customer wrote can be changed by them, and only
                    while the store is still there to read it. */}
                {item.fromMe && store && editingId !== item._id && (
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

                {/* Only what the customer wrote can be removed by them. */}
                {item.fromMe && (
                  <Popconfirm
                    title={t("customerChats.deleteConfirm")}
                    okText={t("chats.delete.ok")}
                    cancelText={t("common.cancel")}
                    okButtonProps={{ danger: true }}
                    onConfirm={() => onDelete(item)}
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
        })}
        {isTyping && <TypingBubble label={t("chats.typing")} />}

        <ScrollToBottomButton />
      </div>

      {store ? (
        <CustomerChatsComposer
          key={storeId}
          isSending={isSending}
          onTyping={() =>
            serviceMethodsInstance.storeChatServiceMethods.sendTyping(storeId)
          }
          onSendText={(text: string) => deliver(() => send(text))}
          onSendMedia={(file: File, caption: string, asVoice: boolean) =>
            deliver(() => sendMedia(file, caption, asVoice))
          }
        />
      ) : (
        <div
          className="px-4 py-3 text-center text-sm"
          style={{
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            color: token.colorTextSecondary,
          }}
        >
          {t("customerChats.storeClosed")}
        </div>
      )}
    </div>
  );
}
