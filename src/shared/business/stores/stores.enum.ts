namespace StoresEnum {
  export enum Status {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    STOPPED = "STOPPED",
  }

  export const StatusLabel = {
    [Status.ACTIVE]: "Active",
    [Status.INACTIVE]: "Inactive",
    [Status.STOPPED]: "Stopped",
  };

  export const StatusColor = {
    [Status.ACTIVE]: "success",
    [Status.INACTIVE]: "warning",
    [Status.STOPPED]: "red",
  };

  export const StatusBadgeColor = {
    [Status.ACTIVE]: "green",
    [Status.INACTIVE]: "yellow",
    [Status.STOPPED]: "red",
  };

  export enum Type {
    ONLINE = "ONLINE",
    PHYSICAL = "PHYSICAL",
    HYBRID = "HYBRID",
  }

  export const TypeLabels = {
    [Type.ONLINE]: "Online",
    [Type.PHYSICAL]: "Physical",
    [Type.HYBRID]: "Hybrid",
  };
}

export default StoresEnum;
