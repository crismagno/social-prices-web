import { IEmployee } from "./employee.interface";

namespace EmployeesEnum {
  export enum Level {
    ADMIN = "ADMIN",
    MASTER = "MASTER",
    EMPLOYEE = "EMPLOYEE",
  }

  export const LevelLabels = {
    [Level.ADMIN]: "common.admin",
    [Level.MASTER]: "common.master",
    [Level.EMPLOYEE]: "common.employee",
  };

  export const LevelColors = {
    [Level.ADMIN]: "gold",
    [Level.MASTER]: "purple",
    [Level.EMPLOYEE]: "blue",
  };

  export enum Status {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    STOPPED = "STOPPED",
  }

  export const StatusLabels = {
    [Status.PENDING]: "common.pending",
    [Status.ACTIVE]: "common.active",
    [Status.STOPPED]: "common.stopped",
  };

  export const StatusColors = {
    [Status.PENDING]: "warning",
    [Status.ACTIVE]: "success",
    [Status.STOPPED]: "red",
  };

  export enum SortField {
    birthDate = "birthDate",
    createdAt = "createdAt",
  }

  export const SortFieldLabels = {
    [SortField.birthDate]: "common.birthDate",
    [SortField.createdAt]: "sales.createdAt",
  };

  export const getLevelsByEmployeeLevel = (level: Level): string[] => {
    if (level === Level.ADMIN) {
      return Object.keys(Level);
    }

    if (level === Level.MASTER) {
      return [Level.EMPLOYEE];
    }

    return [];
  };

  export const allowEmployeeActionByLevel = (
    myEmployee: IEmployee,
    otherEmployee: IEmployee
  ): boolean => {
    if (!myEmployee || !otherEmployee) {
      return false;
    }

    if (myEmployee._id === otherEmployee._id) {
      return false;
    }

    if (myEmployee.level === Level.ADMIN) {
      return true;
    }

    if (myEmployee.level === Level.MASTER) {
      return otherEmployee.level === Level.EMPLOYEE;
    }

    return false;
  };
}

export default EmployeesEnum;
