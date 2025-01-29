namespace EmployeesEnum {
  export enum Level {
    ADMIN = "ADMIN",
    MASTER = "MASTER",
    EMPLOYEE = "EMPLOYEE",
  }

  export const LevelLabels = {
    [Level.ADMIN]: "Admin",
    [Level.MASTER]: "Master",
    [Level.EMPLOYEE]: "Employee",
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
    [Status.PENDING]: "Pending",
    [Status.ACTIVE]: "Active",
    [Status.STOPPED]: "Stopped",
  };

  export const StatusColors = {
    [Status.PENDING]: "warning",
    [Status.ACTIVE]: "success",
    [Status.STOPPED]: "red",
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
}

export default EmployeesEnum;
