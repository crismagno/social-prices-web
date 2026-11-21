"use client";

import { useEffect, useRef, useState } from "react";

import { Select } from "antd";

import { SearchOutlined } from "@ant-design/icons";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IStoreChatStoreCard } from "../../../shared/business/store-chat/store-chat.types";
import StoreAvatar from "./StoreAvatar";

const DEBOUNCE_MS: number = 300;

interface Props {
  onPick: (store: IStoreChatStoreCard) => void;
}

// Finds a store to talk to: the ones the customer bought from come first, then
// every store that is listed. Picking one opens its thread.
export default function CustomerStoreSearch({ onPick }: Props) {
  const { t } = useLanguageData();

  const [stores, setStores] = useState<IStoreChatStoreCard[]>([]);

  const [isSearching, setIsSearching] = useState<boolean>(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Only the answer to the latest search is shown.
  const latest = useRef<number>(0);

  const search = async (term: string): Promise<void> => {
    const ticket: number = ++latest.current;

    try {
      setIsSearching(true);

      const response =
        await serviceMethodsInstance.storeChatServiceMethods.searchStores({
          search: term,
          pagination: { pageSize: 20, skip: 0 },
        });

      if (ticket === latest.current) {
        setStores(response.data);
      }
    } catch (error: any) {
      handleClientError(error);
    } finally {
      if (ticket === latest.current) {
        setIsSearching(false);
      }
    }
  };

  const onSearch = (term: string): void => {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => search(term), DEBOUNCE_MS);
  };

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  return (
    <Select
      showSearch
      className="w-full"
      size="large"
      value={null}
      filterOption={false}
      loading={isSearching}
      suffixIcon={<SearchOutlined />}
      placeholder={t("customerChats.findStore")}
      notFoundContent={
        isSearching ? t("common.loading") : t("customerChats.noStoresFound")
      }
      onFocus={() => search("")}
      onSearch={onSearch}
      onSelect={(storeId: string | null) => {
        const store: IStoreChatStoreCard | undefined = stores.find(
          (item: IStoreChatStoreCard) => item._id === storeId,
        );

        if (store) {
          onPick(store);
        }
      }}
      options={stores.map((store: IStoreChatStoreCard) => ({
        value: store._id,
        label: (
          <div className="flex items-center gap-2.5 py-1">
            <StoreAvatar store={store} size={32} />

            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-medium">{store.name}</span>

              {store.description && (
                <span className="truncate text-xs opacity-60">
                  {store.description}
                </span>
              )}
            </div>
          </div>
        ),
      }))}
    />
  );
}
