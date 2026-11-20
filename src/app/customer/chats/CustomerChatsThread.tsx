"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { App, Button, Empty, Input, Spin, theme } from "antd";
import dayjs from "dayjs";

import { ArrowLeftOutlined, SendOutlined } from "@ant-design/icons";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  IStoreChatMessage,
  IStoreChatStoreCard,
  STORE_CHAT_MAX_TEXT,
  StoreChatCodes,
  storeChatErrorCode,
} from "../../../shared/business/store-chat/store-chat.types";
import { StoreAvatar } from "./CustomerChatsList";
import { useCustomerThread } from "./useCustomerThread";

interface Props {
  storeId: string;
  // What the list already knows of the store, shown when it can no longer be
  // talked to (its history stays).
  knownStore: IStoreChatStoreCard | null;
  onBack: () => void;
  onSent: () => void;
}

const dayOf = (date: string): string => dayjs(date).format("DD/MM/YYYY");

// The right side: the conversation with one store.
export default function CustomerChatsThread({
  storeId,
  knownStore,
  onBack,
  onSent,
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
  } = useCustomerThread(storeId);

  const [text, setText] = useState<string>("");

  const scroller = useRef<HTMLDivElement | null>(null);

  const lastId: string | undefined = messages[messages.length - 1]?._id;

  // A new message at the end brings the view down; older ones loaded on top do not.
  useLayoutEffect(() => {
    if (scroller.current) {
      scroller.current.scrollTop = scroller.current.scrollHeight;
    }
  }, [lastId, isLoading]);

  useEffect(() => {
    setText("");
  }, [storeId]);

  const shown: IStoreChatStoreCard | null = store ?? knownStore;

  const onSend = async (): Promise<void> => {
    if (isSending || !text.trim()) {
      return;
    }

    try {
      // The text is only cleared once it really went.
      if (await send(text)) {
        setText("");
        onSent();
      }
    } catch (error: any) {
      const code: string | null = storeChatErrorCode(error);

      if (code === StoreChatCodes.DAILY_LIMIT) {
        message.warning(t("customerChats.errors.dailyLimit"));
      } else if (code === StoreChatCodes.OWN_STORE) {
        message.warning(t("customerChats.errors.ownStore"));
      } else if (error?.response?.status === 404) {
        message.warning(t("customerChats.storeUnavailable"));
      } else {
        handleClientError(error);
      }
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
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("customerChats.storeUnavailable")}
        />

        <Button onClick={onBack}>{t("customerChats.back")}</Button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className="flex items-center gap-3 p-3"
        style={{ borderBottom: `1px solid ${token.colorBorderSecondary}` }}
      >
        <Button
          className="md:hidden"
          type="text"
          icon={<ArrowLeftOutlined />}
          aria-label={t("customerChats.back")}
          onClick={onBack}
        />

        {shown && <StoreAvatar store={shown} size={36} />}

        <div className="flex min-w-0 flex-col">
          <span className="truncate font-semibold">
            {shown?.name ?? t("customerChats.storeUnavailable")}
          </span>

          {shown?.description && (
            <span
              className="truncate text-xs"
              style={{ color: token.colorTextSecondary }}
            >
              {shown.description}
            </span>
          )}
        </div>
      </div>

      <div
        ref={scroller}
        className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-3"
        style={{ background: token.colorFillQuaternary }}
      >
        {hasOlder && (
          <div className="flex justify-center pb-2">
            <Button size="small" loading={isLoadingOlder} onClick={loadOlder}>
              {t("chats.loadOlder")}
            </Button>
          </div>
        )}

        {!messages.length && (
          <div className="m-auto max-w-xs text-center">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("customerChats.firstMessage")}
            />
          </div>
        )}

        {messages.map((item: IStoreChatMessage, index: number) => {
          const isNewDay: boolean =
            index === 0 ||
            dayOf(messages[index - 1].sentAt) !== dayOf(item.sentAt);

          return (
            <div key={item._id} className="flex flex-col">
              {isNewDay && (
                <span
                  className="my-2 self-center rounded-full px-2.5 py-0.5 text-xs"
                  style={{
                    background: token.colorFillSecondary,
                    color: token.colorTextSecondary,
                  }}
                >
                  {dayOf(item.sentAt)}
                </span>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-3 py-1.5 ${
                  item.fromMe ? "self-end" : "self-start"
                }`}
                style={{
                  background: item.fromMe
                    ? token.colorPrimary
                    : token.colorBgContainer,
                  color: item.fromMe
                    ? token.colorTextLightSolid
                    : token.colorText,
                  border: item.fromMe
                    ? "none"
                    : `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <span className="whitespace-pre-wrap break-words">
                  {item.text}
                </span>

                <span className="ml-2 inline-block text-[10px] opacity-70">
                  {dayjs(item.sentAt).format("HH:mm")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {store ? (
        <div
          className="flex items-end gap-2 p-3"
          style={{ borderTop: `1px solid ${token.colorBorderSecondary}` }}
        >
          <Input.TextArea
            value={text}
            maxLength={STORE_CHAT_MAX_TEXT}
            autoSize={{ minRows: 1, maxRows: 5 }}
            placeholder={t("customerChats.placeholder")}
            onChange={(event) => setText(event.target.value)}
            onPressEnter={(event) => {
              // Enter sends, Shift+Enter breaks the line.
              if (!event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                onSend();
              }
            }}
          />

          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={isSending}
            disabled={!text.trim()}
            aria-label={t("customerChats.send")}
            onClick={onSend}
          />
        </div>
      ) : (
        <div
          className="p-3 text-center text-sm"
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
