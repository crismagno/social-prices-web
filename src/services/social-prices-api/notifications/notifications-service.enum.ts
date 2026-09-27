namespace NotificationServiceEnum {
  export enum Methods {
    FIND_BY_ID = "/notifications/:notificationId",
    FIND_BY_USER_TABLE_STATE = "/notifications/userTableState",
    COUNT_NOT_SEEN_BY_USER = "/notifications/countNotSeenByUser",
    UPDATE_TO_SEEN = "/notifications/updateToSeen",
    UPDATE_ALL_TO_SEEN = "/notifications/updateAllToSeen",
  }
}

export default NotificationServiceEnum;
