namespace CustomersServiceEnum {
  export enum Methods {
    CREATE = "/customers",
    UPDATE = "/customers",
    FIND_BY_ID = "/customers/:customerId",
    FIND_BY_OWNER_USER_TABLE_STATE = "/customers/ownerUserTableState",
    FIND_BY_STORE_TABLE_STATE = "/customers/storeTableState/:storeId",
    COUNT_BY_OWNER_USER = "/customers/ownerUser/count",
    UPLOAD_CUSTOMERS = "/customers/uploadCustomers",
    DOWNLOAD_CUSTOMERS = "/customers/downloadCustomers",
  }
}

export default CustomersServiceEnum;
