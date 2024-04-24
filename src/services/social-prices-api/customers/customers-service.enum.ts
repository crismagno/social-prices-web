namespace CustomersServiceEnum {
  export enum Methods {
    CREATE = "/customers",
    UPDATE = "/customers",
    FIND_BY_ID = "/customers/:customerId",
    FIND_BY_OWNER_USER_TABLE_STATE = "/customers/ownerUserTableState",
  }
}

export default CustomersServiceEnum;