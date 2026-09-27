namespace NotesServiceEnum {
  export enum Methods {
    CREATE = "/notes",
    UPDATE = "/notes/:id",
    UPDATE_STATUS = "/notes/:id/status",
    REMOVE = "/notes/:id",
    FIND_BY_USER_TABLE_STATE = "/notes/userTableState",
    CALENDAR_MARKERS = "/notes/calendarMarkers",
  }
}

export default NotesServiceEnum;
