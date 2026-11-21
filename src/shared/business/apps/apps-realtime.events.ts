import AppsEnum from "./apps.enum";

// The socket.io events of the apps' inboxes. Mirrors the API by hand.
export const AppsRealtimeEvents = {
  // Client to server: "send me what happens to my apps". Carries the login token.
  SUBSCRIBE: "apps:subscribe",
  // Client to server: "stop". Sent on logout.
  UNSUBSCRIBE: "apps:unsubscribe",
  // Server to client: something changed in an app's inbox. No message content.
  INBOX_UPDATED: "apps:inbox-updated",
  // Server to client: a store chat of this account changed. No message content.
  STORE_CHAT_UPDATED: "store-chat:updated",
  // Server to client: the other side of a store chat is writing. Nothing stored.
  STORE_CHAT_TYPING: "store-chat:typing",
} as const;

export interface IInboxUpdatedEvent {
  app: AppsEnum.App;
  // The conversation that changed: a chat id for Telegram, a psid for Messenger.
  chatKey: string;
}
