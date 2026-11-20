import InboxEnum from "../../shared/business/inbox/inbox.enum";
import { IInboxConversation } from "../../shared/business/inbox/inbox.types";
import Urls from "../../shared/common/routes-app/routes-app";

// The page of the app a conversation belongs to, with that conversation open.
// Null for the store chat: it lives in the central chat only.
export const conversationAppUrl = (
  conversation: Pick<IInboxConversation, "channel" | "contactKey">,
): string | null => {
  switch (conversation.channel) {
    case InboxEnum.Channel.STORE:
      return null;

    case InboxEnum.Channel.TELEGRAM:
      return Urls.APPS_TELEGRAM_CHAT.replace(
        ":chatId",
        conversation.contactKey,
      );

    case InboxEnum.Channel.MESSENGER:
      return Urls.APPS_MESSENGER_CHAT.replace(
        ":psid",
        encodeURIComponent(conversation.contactKey),
      );

    case InboxEnum.Channel.WHATSAPP:
      return Urls.APPS_WHATSAPP_CHAT.replace(
        ":waId",
        encodeURIComponent(conversation.contactKey),
      );

    default:
      return Urls.APPS_INSTAGRAM_CHAT.replace(
        ":igsid",
        encodeURIComponent(conversation.contactKey),
      );
  }
};
