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
    MOBILE = "MOBILE",
    HOME = "HOME",
    BUSINESS = "BUSINESS",
    OTHER = "OTHER",
  }

  export const TypeLabels = {
    [Type.MOBILE]: "Mobile",
    [Type.HOME]: "Home",
    [Type.BUSINESS]: "Business",
    [Type.OTHER]: "Other",
  };

  export enum PhoneNumberMessenger {
    WHATSAPP = "WHATSAPP",
    TELEGRAM = "TELEGRAM",
    MESSENGER = "MESSENGER",
    OTHER = "OTHER",
  }

  export const PhoneNumberMessengerLabels = {
    [PhoneNumberMessenger.WHATSAPP]: "Whatsapp",
    [PhoneNumberMessenger.TELEGRAM]: "Telegram",
    [PhoneNumberMessenger.MESSENGER]: "Messenger",
    [PhoneNumberMessenger.OTHER]: "Other",
  };
}

export default StoresEnum;
