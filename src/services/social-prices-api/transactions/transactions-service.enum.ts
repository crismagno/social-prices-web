namespace TransactionsServiceEnum {
  export enum Methods {
    CREATE = "/transactions",
    UPDATE = "/transactions/:id",
    REMOVE = "/transactions/:id",
    FIND_BY_USER_TABLE_STATE = "/transactions/userTableState",
    SUMMARY = "/transactions/summary",
  }
}

export default TransactionsServiceEnum;
