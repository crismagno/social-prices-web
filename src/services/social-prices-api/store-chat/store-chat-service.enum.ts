namespace StoreChatServiceEnum {
  export enum Methods {
    // The customer account's side.
    STORES_SEARCH = "/store-chat/stores/search",
    STORE = "/store-chat/stores/:storeId",
    CONVERSATIONS = "/store-chat/conversations",
    MESSAGES = "/store-chat/stores/:storeId/messages",
    MESSAGE = "/store-chat/stores/:storeId/messages/:messageId",
    MEDIA = "/store-chat/stores/:storeId/media",
    ATTACHMENT = "/store-chat/stores/:storeId/messages/:messageId/attachments/:index",
    READ = "/store-chat/stores/:storeId/read",
    TYPING = "/store-chat/stores/:storeId/typing",
    UNREAD_COUNT = "/store-chat/unread-count",
    // The store's side.
    START_WITH_CUSTOMER = "/store-chat/customers/:customerId/messages",
    OWNER_UNREAD_COUNT = "/store-chat/owner/unread-count",
  }
}

export default StoreChatServiceEnum;
