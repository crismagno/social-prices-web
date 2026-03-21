namespace PhoneNumberEnum {
  export enum Type {
    MOBILE = "MOBILE",
    HOME = "HOME",
    BUSINESS = "BUSINESS",
    OTHER = "OTHER",
  }

  export const TypeLabels = {
    [Type.MOBILE]: "common.mobile",
    [Type.HOME]: "common.home",
    [Type.BUSINESS]: "common.business",
    [Type.OTHER]: "common.other",
  };

  export enum PhoneNumberMessenger {
    WHATSAPP = "WHATSAPP",
    TELEGRAM = "TELEGRAM",
    MESSENGER = "MESSENGER",
    OTHER = "OTHER",
  }

  export const PhoneNumberMessengerLabels = {
    [PhoneNumberMessenger.WHATSAPP]: "common.whatsapp",
    [PhoneNumberMessenger.TELEGRAM]: "common.telegram",
    [PhoneNumberMessenger.MESSENGER]: "common.messenger",
    [PhoneNumberMessenger.OTHER]: "common.other",
  };
}

export default PhoneNumberEnum;
