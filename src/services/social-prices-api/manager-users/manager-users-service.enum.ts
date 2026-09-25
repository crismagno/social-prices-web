namespace ManagerUsersServiceEnum {
  export enum Methods {
    FIND_BY_TABLE_STATE = "/manager-users/tableState",
    FIND_BY_ID = "/manager-users/:id",
    UPDATE = "/manager-users/:id",
    UPDATE_LIMITS = "/manager-users/:id/limits",
  }
}

export default ManagerUsersServiceEnum;
