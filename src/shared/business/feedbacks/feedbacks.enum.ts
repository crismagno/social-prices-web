namespace FeedbacksEnum {
  export enum Status {
    NEW = "NEW",
    SEEN = "SEEN",
    COMPLETED = "COMPLETED",
    REJECTED = "REJECTED",
  }

  export const StatusLabels = {
    [Status.NEW]: "feedbacks.statusNew",
    [Status.SEEN]: "feedbacks.statusSeen",
    [Status.COMPLETED]: "feedbacks.statusCompleted",
    [Status.REJECTED]: "feedbacks.statusRejected",
  };

  export const StatusColors = {
    [Status.NEW]: "blue",
    [Status.SEEN]: "gold",
    [Status.COMPLETED]: "success",
    [Status.REJECTED]: "red",
  };
}

export default FeedbacksEnum;
