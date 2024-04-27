namespace NotificationServiceEnum {
  export enum Methods {
    FIND_BY_ID = "/notifications",
    FIND_BY_USER_TABLE_STATE = "/notifications/userTableState",
    COUNT_NOT_SEEN_BY_USER = "/notifications/countNotSeenByUser",
  }
}

export default NotificationServiceEnum;
