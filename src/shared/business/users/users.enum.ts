namespace UsersEnum {
  export enum Provider {
    GOOGLE = "GOOGLE",
    SOCIAL_PRICES = "SOCIAL_PRICES",
    OTHER = "OTHER",
  }

  export const ProviderLabels = {
    [Provider.GOOGLE]: "common.google",
    [Provider.SOCIAL_PRICES]: "common.socialPrices",
    [Provider.OTHER]: "common.other",
  };

  export const ProviderColors = {
    [Provider.GOOGLE]: "orange",
    [Provider.SOCIAL_PRICES]: "blue",
    [Provider.OTHER]: "gray",
  };

  export enum Status {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    STOPPED = "STOPPED",
    INACTIVE = "INACTIVE",
  }

  export const StatusLabels = {
    [Status.PENDING]: "common.pending",
    [Status.ACTIVE]: "common.active",
    [Status.STOPPED]: "common.stopped",
    [Status.INACTIVE]: "common.inactive",
  };

  export const StatusColors = {
    [Status.PENDING]: "warning",
    [Status.ACTIVE]: "success",
    [Status.STOPPED]: "red",
    [Status.INACTIVE]: "gray",
  };

  export enum Type {
    COMPANY = "COMPANY",
    COMMON = "COMMON",
  }

  export const TypeLabels = {
    [Type.COMPANY]: "users.typeCompany",
    [Type.COMMON]: "users.typeCommon",
  };
}

export default UsersEnum;
