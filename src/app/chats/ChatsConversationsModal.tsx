"use client";

import { useState } from "react";

import { App, Button, List, Modal, Popconfirm } from "antd";

import AppIcon from "../../components/common/AppIcon/AppIcon";
import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import { ICustomer } from "../../shared/business/customers/customer.interface";
import InboxEnum from "../../shared/business/inbox/inbox.enum";
import {
  IInboxChat,
  IInboxConversation,
} from "../../shared/business/inbox/inbox.types";
import LinkCustomerModal from "../apps/telegram/LinkCustomerModal";
import { conversationName } from "./chats-display";

interface Props {
  open: boolean;
  chat: IInboxChat;
  onClose: () => void;
  // The row the conversation ended up in, when it moved to another one.
  onChanged: (row: IInboxChat | undefined) => void;
}

// The conversations of a row, each with who it is tied to: link a loose one to a
// customer, move it to another customer, or free it. The history goes with it.
export default function ChatsConversationsModal({
  open,
  chat,
  onClose,
  onChanged,
}: Props) {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const [busyId, setBusyId] = useState<string | null>(null);

  const [linking, setLinking] = useState<IInboxConversation | null>(null);

  const assign = async (
    conversation: IInboxConversation,
    customerId: string | null,
  ): Promise<void> => {
    try {
      setBusyId(conversation._id);

      const row =
        await serviceMethodsInstance.inboxServiceMethods.assignCustomer(
          conversation._id,
          customerId,
        );

      message.success(
        t(customerId ? "chats.customer.linked" : "chats.customer.unlinked"),
      );

      onChanged(row);
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        title={t("chats.customer.modalTitle")}
      >
        <p className="mb-3 text-sm opacity-70">{t("chats.customer.hint")}</p>

        <List
          dataSource={chat.conversations}
          renderItem={(conversation: IInboxConversation) => (
            <List.Item
              actions={[
                <Button
                  key="change"
                  size="small"
                  loading={busyId === conversation._id}
                  onClick={() => setLinking(conversation)}
                >
                  {t(
                    chat.customerId
                      ? "chats.customer.change"
                      : "chats.customer.link",
                  )}
                </Button>,
                chat.customerId ? (
                  <Popconfirm
                    key="unlink"
                    title={t("chats.customer.unlinkConfirm")}
                    onConfirm={() => assign(conversation, null)}
                  >
                    <Button size="small" type="text">
                      {t("chats.customer.unlink")}
                    </Button>
                  </Popconfirm>
                ) : null,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <AppIcon app={InboxEnum.ChannelApp[conversation.channel]} />
                }
                title={conversationName(conversation, t("chats.unnamed"))}
                description={
                  chat.customerId ? chat.name : t("chats.customer.none")
                }
              />
            </List.Item>
          )}
        />
      </Modal>

      <LinkCustomerModal
        open={!!linking}
        onClose={() => setLinking(null)}
        onPick={(customer: ICustomer) => {
          const conversation = linking;

          setLinking(null);

          if (conversation) {
            assign(conversation, customer._id);
          }
        }}
      />
    </>
  );
}
