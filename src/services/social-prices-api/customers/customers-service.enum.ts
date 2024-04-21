namespace CustomersServiceEnum {
  export enum Methods {
    CREATE = "/customers",
    UPDATE = "/customers",
    FIND_BY_ID = "/customers/:customerId",
    FIND_BY_OWNER_OF_USER_TABLE_STATE = "/customers/ownerOfUserTableState",
  }
}

export default CustomersServiceEnum;
