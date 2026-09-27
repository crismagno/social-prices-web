namespace TransactionsEnum {
  export enum Type {
    INCOME = "INCOME",
    EXPENSE = "EXPENSE",
  }

  export const TypeLabels = {
    [Type.INCOME]: "transactions.typeIncome",
    [Type.EXPENSE]: "transactions.typeExpense",
  };

  export const TypeColors = {
    [Type.INCOME]: "success",
    [Type.EXPENSE]: "red",
  };

  export enum Status {
    COMPLETED = "COMPLETED",
    PENDING = "PENDING",
    CANCELED = "CANCELED",
  }

  export const StatusLabels = {
    [Status.COMPLETED]: "transactions.statusCompleted",
    [Status.PENDING]: "transactions.statusPending",
    [Status.CANCELED]: "transactions.statusCanceled",
  };

  export const StatusColors = {
    [Status.COMPLETED]: "success",
    [Status.PENDING]: "warning",
    [Status.CANCELED]: "default",
  };
}

export default TransactionsEnum;
