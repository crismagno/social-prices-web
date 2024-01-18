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
    [Status.STOPPED]: "gray",
  };
}

export default StoresEnum;
