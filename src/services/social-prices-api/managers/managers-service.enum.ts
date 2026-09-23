namespace ManagersServiceEnum {
  export enum Methods {
    CREATE = "/managers",
    UPDATE = "/managers",
    FIND_BY_ID = "/managers/:managerId",
    FIND_BY_TABLE_STATE = "/managers/tableState",
    DELETE_MANUAL = "/managers/deleteManual/:managerId",
    ACTIVATE_MANUAL = "/managers/activateManual/:managerId",
  }
}

export default ManagersServiceEnum;
