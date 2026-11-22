"use client";

import { useRef } from "react";

import { App } from "antd";

import handleClientError from "../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../services/social-prices-api/service-methods";
import InboxEnum from "../../shared/business/inbox/inbox.enum";
import QuickMessagesEnum from "../../shared/business/quick-messages/quick-messages.enum";
import { IQuickMessageAvailable } from "../../shared/business/quick-messages/quick-messages.types";
import ChatsQuickMessages from "./ChatsQuickMessages";
import { QuickMessageTarget } from "./quick-messages-filter";
import { useQuickMessages } from "./useQuickMessages";

interface Props {
  channel: InboxEnum.Channel;
  // The channel's own id of the person: Telegram's chat, Messenger's or Instagram's scoped id.
  contactKey: string;
  // What this chat takes now, for the messages that do not fit to say why.
  target: QuickMessageTarget;
  // What is typed in the answer box narrows the strip.
  query: string;
  disabled: boolean;
  onSendingChange: (isSending: boolean) => void;
  // Something went, all of it or part: the thread has new messages to show.
  onSent: () => void;
}

// The strip of quick messages for the chat of one app. The app only knows its
// own id of the person, so the message is addressed by channel and contact.
export default function ChannelQuickMessages({
  channel,
  contactKey,
  target,
  query,
  disabled,
  onSendingChange,
  onSent,
}: Props) {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const quickMessages = useQuickMessages();

  // Set at once on click: two quick clicks must not send the message twice.
  const isSendingRef = useRef<boolean>(false);

  const send = async (quickMessage: IQuickMessageAvailable): Promise<void> => {
    if (isSendingRef.current) {
      return;
    }

    isSendingRef.current = true;

    onSendingChange(true);

    try {
      await serviceMethodsInstance.quickMessagesServiceMethods.send(
        quickMessage._id,
        { channel, contactKey },
      );

      onSent();
    } catch (error: any) {
      const data = error?.response?.data;

      if (data?.code === QuickMessagesEnum.ErrorCode.PARTIAL_SEND) {
        message.error(
          t("quickMessages.partial")
            .replace("{sent}", String(data.sentCount))
            .replace("{total}", String(data.totalCount)),
        );

        onSent();
      } else {
        handleClientError(error);
      }

      // Someone may have changed who can use it, or removed it.
      quickMessages.reload();
    } finally {
      isSendingRef.current = false;

      onSendingChange(false);
    }
  };

  return (
    <ChatsQuickMessages
      list={quickMessages.list}
      query={query}
      target={target}
      disabled={disabled}
      onSend={send}
    />
  );
}
