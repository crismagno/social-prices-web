namespace MessengerServiceEnum {
  export enum Methods {
    CONNECT = "/apps/messenger/connect",
    CONNECTION = "/apps/messenger/connection",
    CONNECTION_PAGE = "/apps/messenger/connection/page",
    CHATS = "/apps/messenger/chats",
    CHAT_MESSAGES = "/apps/messenger/chats/:psid/messages",
    CHAT_MEDIA = "/apps/messenger/chats/:psid/media",
    CHAT_READ = "/apps/messenger/chats/:psid/read",
    CHAT_CUSTOMER = "/apps/messenger/chats/:psid/customer",
    CHAT_CUSTOMER_CREATE = "/apps/messenger/chats/:psid/customer/create",
    ATTACHMENT = "/apps/messenger/chats/:psid/messages/:messageId/attachments/:index",
  }
}

export default MessengerServiceEnum;
