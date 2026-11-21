import InboxEnum from "../inbox/inbox.enum";
import { IInboxAttachment } from "../inbox/inbox.types";
import StoresEnum from "../stores/stores.enum";

// Mirrors the API's store chat views by hand.

// All a customer account gets to know about a store.
export interface IStoreChatStoreCard {
  _id: string;
  name: string;
  logo: string | null;
  description: string | null;
  type: StoresEnum.Type | null;
}

// A conversation as the customer account lists it.
export interface IStoreChatConversation {
  store: IStoreChatStoreCard;
  lastMessageAt: string;
  lastMessageText: string | null;
  // What the last message is, for when it has no text (a photo, a recording).
  lastMessageKind: InboxEnum.MessageKind | null;
  lastMessageFromMe: boolean;
  unreadCount: number;
}

export interface IStoreChatMessage {
  _id: string;
  fromMe: boolean;
  kind: InboxEnum.MessageKind;
  text: string | null;
  attachments: IInboxAttachment[];
  sentAt: string;
  // When its words were last changed after being sent; null when they never were.
  editedAt: string | null;
}

// What starting a conversation from the store's side gives back.
export interface IStoreChatStarted {
  conversationId: string;
  customerId: string;
}

// The server says a store chat changed. No message content.
export interface IStoreChatUpdatedEvent {
  storeId: string;
  conversationId: string;
}

// Refusals the screens explain in their own words.
export const StoreChatCodes = {
  NO_ACCOUNT: "CUSTOMER_HAS_NO_ACCOUNT",
  DAILY_LIMIT: "STORE_CHAT_DAILY_LIMIT",
  OWN_STORE: "STORE_CHAT_OWN_STORE",
  FILE_TOO_LARGE: "STORE_CHAT_FILE_TOO_LARGE",
} as const;

export const STORE_CHAT_MAX_TEXT: number = 1000;

// The largest file or recording either side can send.
export const STORE_CHAT_MAX_UPLOAD_BYTES: number = 16 * 1024 * 1024;

// The code of a refusal of the API, when it has one.
export const storeChatErrorCode = (error: any): string | null =>
  error?.response?.data?.code ?? null;
