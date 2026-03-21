namespace StoresEnum {
  export enum Status {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    STOPPED = "STOPPED",
  }

  export const StatusLabel = {
    [Status.ACTIVE]: "stores.statusActive",
    [Status.INACTIVE]: "stores.statusInactive",
    [Status.STOPPED]: "stores.statusStopped",
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
    OTHER = "OTHER",
  }

  export const TypeLabels = {
    [Type.ONLINE]: "stores.typeOnline",
    [Type.PHYSICAL]: "stores.typePhysical",
    [Type.HYBRID]: "stores.typeHybrid",
    [Type.OTHER]: "stores.typeOther",
  };
}

export default StoresEnum;
