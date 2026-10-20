namespace InboxServiceEnum {
  export enum Methods {
    CHATS = "/inbox/chats",
    MESSAGES = "/inbox/messages",
    READ = "/inbox/read",
    CONVERSATION_CUSTOMER = "/inbox/conversations/:conversationId/customer",
    CONVERSATION_MESSAGES = "/inbox/conversations/:conversationId/messages",
    CUSTOMER_SUMMARY = "/inbox/customers/:customerId/summary",
    ATTACHMENT = "/inbox/messages/:messageId/attachments/:index",
  }
}

export default InboxServiceEnum;
