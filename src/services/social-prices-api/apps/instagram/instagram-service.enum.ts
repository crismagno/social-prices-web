namespace InstagramServiceEnum {
  export enum Methods {
    CONNECT = "/apps/instagram/connect",
    CONNECTION = "/apps/instagram/connection",
    CHATS = "/apps/instagram/chats",
    CHAT_MESSAGES = "/apps/instagram/chats/:igsid/messages",
    CHAT_MESSAGE = "/apps/instagram/chats/:igsid/messages/:messageId",
    CHAT_READ = "/apps/instagram/chats/:igsid/read",
    CHAT_CUSTOMER = "/apps/instagram/chats/:igsid/customer",
    CHAT_CUSTOMER_CREATE = "/apps/instagram/chats/:igsid/customer/create",
    ATTACHMENT = "/apps/instagram/chats/:igsid/messages/:messageId/attachments/:index",
  }
}

export default InstagramServiceEnum;
