namespace NotesEnum {
  export enum Status {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
  }

  export const StatusLabels = {
    [Status.PENDING]: "notes.statusPending",
    [Status.COMPLETED]: "notes.statusCompleted",
    [Status.CANCELLED]: "notes.statusCancelled",
  };

  export const StatusColors = {
    [Status.PENDING]: "warning",
    [Status.COMPLETED]: "success",
    [Status.CANCELLED]: "default",
  };
}

export default NotesEnum;
