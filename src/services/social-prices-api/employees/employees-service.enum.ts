namespace EmployeesServiceEnum {
  export enum Methods {
    CREATE = "/employees",
    UPDATE = "/employees",
    FIND_BY_ID = "/employees/:employeeId",
    FIND_BY_USER = "/employees/user",
    FIND_BY_USER_TABLE_STATE = "/employees/userTableState",
    COUNT_BY_USER = "/employees/user/count",
  }
}

export default EmployeesServiceEnum;
