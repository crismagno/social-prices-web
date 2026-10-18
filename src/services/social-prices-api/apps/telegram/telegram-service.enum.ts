namespace TelegramServiceEnum {
  export enum Methods {
    CONNECT = "/apps/telegram/connect",
    CONNECTION = "/apps/telegram/connection",
    WEBHOOK_STATUS = "/apps/telegram/webhook-status",
    REFRESH_WEBHOOK = "/apps/telegram/refresh-webhook",
    CHATS = "/apps/telegram/chats",
    CHAT_MESSAGES = "/apps/telegram/chats/:chatId/messages",
    CHAT_READ = "/apps/telegram/chats/:chatId/read",
    CHAT_CUSTOMER = "/apps/telegram/chats/:chatId/customer",
    CHAT_CUSTOMER_CREATE = "/apps/telegram/chats/:chatId/customer/create",
  }
}

export default TelegramServiceEnum;
