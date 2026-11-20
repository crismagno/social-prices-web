namespace StoreChatServiceEnum {
  export enum Methods {
    // The customer account's side.
    STORES_SEARCH = "/store-chat/stores/search",
    STORE = "/store-chat/stores/:storeId",
    CONVERSATIONS = "/store-chat/conversations",
    MESSAGES = "/store-chat/stores/:storeId/messages",
    READ = "/store-chat/stores/:storeId/read",
    UNREAD_COUNT = "/store-chat/unread-count",
    // The store's side.
    START_WITH_CUSTOMER = "/store-chat/customers/:customerId/messages",
    OWNER_UNREAD_COUNT = "/store-chat/owner/unread-count",
  }
}

export default StoreChatServiceEnum;
