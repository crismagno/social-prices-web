"use client";

import { useEffect, useState } from "react";

import { Alert, App, Input, Modal, Select } from "antd";
import { useRouter } from "next/navigation";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import {
  STORE_CHAT_MAX_TEXT,
  StoreChatCodes,
  storeChatErrorCode,
} from "../../../shared/business/store-chat/store-chat.types";
import { IStore } from "../../../shared/business/stores/stores.interface";
import StoresEnum from "../../../shared/business/stores/stores.enum";
import Urls from "../../../shared/common/routes-app/routes-app";

interface Props {
  customerId: string;
  customerName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Writes first to a customer on the platform's own chat, from one of the user's
// stores. The customer reads it in their account, so they need one.
export default function StoreChatStartModal({
  customerId,
  customerName,
  isOpen,
  onClose,
}: Props) {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const router = useRouter();

  const [stores, setStores] = useState<IStore[]>([]);

  const [isLoadingStores, setIsLoadingStores] = useState<boolean>(false);

  const [storeId, setStoreId] = useState<string | null>(null);

  const [text, setText] = useState<string>("");

  const [isSending, setIsSending] = useState<boolean>(false);

  const [hasNoAccount, setHasNoAccount] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCurrent = true;

    setHasNoAccount(false);
    setIsLoadingStores(true);

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
        setStoreId((chosen) =>
          chosen && usable.some((store: IStore) => store._id === chosen)
            ? chosen
            : (usable[0]?._id ?? null),
        );
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
  }, [isOpen]);

  const send = async (): Promise<void> => {
    if (!storeId || !text.trim()) {
      return;
    }

    try {
      setIsSending(true);

      await serviceMethodsInstance.storeChatServiceMethods.startWithCustomer(
        customerId,
        storeId,
        text.trim(),
      );

      message.success(t("storeChat.start.sent"));

      setText("");
      onClose();

      router.push(Urls.CHATS_CUSTOMER.replace(":customerId", customerId));
    } catch (error: any) {
      // Explained here, where the text still is, rather than in a passing toast.
      if (storeChatErrorCode(error) === StoreChatCodes.NO_ACCOUNT) {
        setHasNoAccount(true);
      } else {
        handleClientError(error);
      }
    } finally {
      setIsSending(false);
    }
  };

  const hasNoStore: boolean = !isLoadingStores && !stores.length;

  return (
    <Modal
      open={isOpen}
      title={t("storeChat.start.title").replace(
        "{name}",
        customerName ?? t("chats.unnamed"),
      )}
      okText={t("storeChat.start.send")}
      cancelText={t("common.cancel")}
      confirmLoading={isSending}
      okButtonProps={{ disabled: !storeId || !text.trim() || hasNoAccount }}
      onOk={send}
      onCancel={onClose}
      destroyOnClose
    >
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
              onChange={(value: string) => setStoreId(value)}
              options={stores.map((store: IStore) => ({
                value: store._id,
                label: store.name,
              }))}
            />
          </div>
        )}

        <Input.TextArea
          value={text}
          maxLength={STORE_CHAT_MAX_TEXT}
          showCount
          autoSize={{ minRows: 3, maxRows: 8 }}
          placeholder={t("storeChat.start.placeholder")}
          onChange={(event) => setText(event.target.value)}
        />
      </div>
    </Modal>
  );
}
