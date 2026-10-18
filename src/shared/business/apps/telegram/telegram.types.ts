import TelegramEnum from "./telegram.enum";

// What the bot's owner sees about the connection. Never the token.
export interface ITelegramConnection {
  connected: boolean;
  botUsername: string | null;
  botName: string | null;
  connectedAt: string | null;
  lastUpdateAt: string | null;
}

// What Telegram says about delivering to this system.
export interface ITelegramWebhookStatus {
  url: string;
  pendingUpdateCount: number;
  lastErrorMessage: string | null;
  lastErrorDate: string | null;
  expectedUrl: string;
  // False after the public address changed (a new ngrok, say).
  urlMatches: boolean;
  // Telegram never clears its last error; this is true only for one newer than
  // the last registration and the last message that did arrive.
  hasActiveError: boolean;
}

// One row of the inbox: a person talking to the bot.
export interface ITelegramChat {
  chatId: number;
  telegramUserId: number;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  customerId: string | null;
  customerName: string | null;
  lastMessageAt: string;
  lastMessageText: string | null;
  lastMessageDirection: TelegramEnum.Direction;
  lastContentType: TelegramEnum.ContentType;
  unreadCount: number;
}

export interface ITelegramMessage {
  _id: string;
  direction: TelegramEnum.Direction;
  chatId: number;
  messageId: number;
  contentType: TelegramEnum.ContentType;
  text: string | null;
  sentAt: string;
  sentByEmployeeId?: string | null;
}
