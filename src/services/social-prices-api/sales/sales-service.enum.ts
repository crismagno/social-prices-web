namespace SalesServiceEnum {
  export enum Methods {
    FIND_BY_ID = "/sales/:saleId",
    COUNT_BY_USER = "/sales/user/count",
    FIND_BY_USER_TABLE_STATE = "/sales/userTableState",
    CREATE_MANUAL = "/sales/createManual",
  }
}

export default SalesServiceEnum;
