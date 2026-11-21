"use client";

import { useState } from "react";

import { Card, Grid, theme } from "antd";
import { useRouter, useSearchParams } from "next/navigation";

import Layout from "../../../components/template/Layout/Layout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  IStoreChatConversation,
  IStoreChatStoreCard,
} from "../../../shared/business/store-chat/store-chat.types";
import Urls from "../../../shared/common/routes-app/routes-app";
import { useFillViewportHeight } from "../../../shared/hooks/useFillViewportHeight";
import CustomerChatsEmptyState from "./CustomerChatsEmptyState";
import CustomerChatsList from "./CustomerChatsList";
import CustomerChatsThread from "./CustomerChatsThread";
import { useCustomerConversations } from "./useCustomerConversations";

const MIN_HEIGHT: number = 440;

// The customer account's conversations with stores, laid out like the stores'
// own chat. The open one is in the address (?store=), which is also what a
// store's shared link points to.
export default function CustomerChatsPage() {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const router = useRouter();

  const storeId: string | null = useSearchParams().get("store");

  const { conversations, isLoading, refetch } = useCustomerConversations();

  const screens = Grid.useBreakpoint();

  // On a phone one side shows at a time: the list, or the open thread.
  const isNarrow: boolean = screens.md === false;

  const { ref: cardRef, height } = useFillViewportHeight(MIN_HEIGHT);

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

  const close = (): void => router.replace(Urls.CUSTOMER_CHATS);

  const list = (
    <CustomerChatsList
      conversations={conversations}
      isLoading={isLoading}
      selectedStoreId={storeId}
      onOpen={open}
    />
  );

  const thread = storeId ? (
    <CustomerChatsThread
      key={storeId}
      storeId={storeId}
      knownStore={knownStore}
      onBack={isNarrow ? close : undefined}
      onSent={() => refetch(true)}
      onLeave={close}
    />
  ) : (
    <CustomerChatsEmptyState
      isEmpty={!isLoading && conversations.length === 0}
    />
  );

  return (
    <Layout
      title={t("customerChats.title")}
      subtitle={t("customerChats.subtitle")}
    >
      <div className="mt-4">
        <Card
          ref={cardRef}
          styles={{ body: { padding: 0 } }}
          style={{ overflow: "hidden" }}
        >
          <div className="flex" style={{ height }}>
            {isNarrow ? (
              <div className="w-full">{storeId ? thread : list}</div>
            ) : (
              <>
                <div
                  className="w-80 shrink-0"
                  style={{
                    borderRight: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  {list}
                </div>

                <div className="min-w-0 flex-1">{thread}</div>
              </>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
