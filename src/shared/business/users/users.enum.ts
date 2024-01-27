namespace UsersEnum {
  export enum Provider {
    GOOGLE = "GOOGLE",
    SOCIAL_PRICES = "SOCIAL_PRICES",
    OTHER = "OTHER",
  }

  export const ProviderLabels = {
    [Provider.GOOGLE]: "Google",
    [Provider.SOCIAL_PRICES]: "Social Prices",
    [Provider.OTHER]: "Other",
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

  export enum Gender {
    OTHER = "OTHER",
    FEMALE = "FEMALE",
    MALE = "MALE",
  }

  export const GenderLabels = {
    [Gender.OTHER]: "Other",
    [Gender.FEMALE]: "Female",
    [Gender.MALE]: "Male",
  };

  export const GenderColors = {
    [Gender.OTHER]: "gray",
    [Gender.FEMALE]: "pink",
    [Gender.MALE]: "blue",
  };

  export enum PhoneTypes {
    MOBILE = "MOBILE",
    HOME = "HOME",
    BUSINESS = "BUSINESS",
    OTHER = "OTHER",
  }

  export const PhoneTypesLabels = {
    [PhoneTypes.MOBILE]: "Mobile",
    [PhoneTypes.HOME]: "Home",
    [PhoneTypes.BUSINESS]: "Business",
    [PhoneTypes.OTHER]: "Other",
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

export default UsersEnum;
