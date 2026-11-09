namespace QuickMessagesServiceEnum {
  export enum Methods {
    BASE = "/quick-messages",
    TABLE = "/quick-messages/userTableState",
    ONE = "/quick-messages/:id",
    DELETE = "/quick-messages/:id/delete",
    ACTIVATE = "/quick-messages/:id/activate",
    AVAILABLE = "/quick-messages/available",
    FIELDS = "/quick-messages/fields",
    SEND = "/quick-messages/:id/send",
  }
}

export default QuickMessagesServiceEnum;
