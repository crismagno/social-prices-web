"use client";

import { useState } from "react";

import { Card, Empty, theme } from "antd";
import { useRouter, useSearchParams } from "next/navigation";

import Layout from "../../../components/template/Layout/Layout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  IStoreChatConversation,
  IStoreChatStoreCard,
} from "../../../shared/business/store-chat/store-chat.types";
import Urls from "../../../shared/common/routes-app/routes-app";
import CustomerChatsList from "./CustomerChatsList";
import CustomerChatsThread from "./CustomerChatsThread";
import { useCustomerConversations } from "./useCustomerConversations";

// The customer account's conversations with stores. The open one is in the
// address (?store=), which is also what a store's shared link points to.
export default function CustomerChatsPage() {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const router = useRouter();

  const storeId: string | null = useSearchParams().get("store");

  const { conversations, isLoading, refetch } = useCustomerConversations();

  // A store picked in the search has no conversation yet: its card is kept so
  // the thread can name it at once.
  const [picked, setPicked] = useState<IStoreChatStoreCard | null>(null);

  const knownStore: IStoreChatStoreCard | null =
    conversations.find(
      (conversation: IStoreChatConversation) =>
        conversation.store._id === storeId,
    )?.store ?? (picked?._id === storeId ? picked : null);

  const open = (store: IStoreChatStoreCard): void => {
    setPicked(store);

    router.replace(
      Urls.CUSTOMER_CHAT_STORE.replace(
        ":storeId",
        encodeURIComponent(store._id),
      ),
    );
  };

  return (
    <Layout
      title={t("customerChats.title")}
      subtitle={t("customerChats.subtitle")}
    >
      <Card className="mt-4" styles={{ body: { padding: 0 } }}>
        <div className="flex h-[calc(100vh-240px)] min-h-[420px]">
          {/* On a phone one side shows at a time: the list, or the open thread. */}
          <div
            className={`${storeId ? "hidden md:block" : "block"} w-full shrink-0 md:w-80`}
            style={{ borderRight: `1px solid ${token.colorBorderSecondary}` }}
          >
            <CustomerChatsList
              conversations={conversations}
              isLoading={isLoading}
              selectedStoreId={storeId}
              onOpen={open}
            />
          </div>

          <div
            className={`${storeId ? "block" : "hidden md:block"} min-w-0 flex-1`}
          >
            {storeId ? (
              <CustomerChatsThread
                key={storeId}
                storeId={storeId}
                knownStore={knownStore}
                onBack={() => router.replace(Urls.CUSTOMER_CHATS)}
                onSent={() => refetch(true)}
              />
            ) : (
              <div className="flex h-full items-center justify-center p-6">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t("customerChats.pick")}
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </Layout>
  );
}
