namespace UsersEnum {
  export enum Provider {
    GOOGLE = "GOOGLE",
    SOCIAL_PRICES = "SOCIAL_PRICES",
  }

  export const ProviderLabels = {
    [Provider.GOOGLE]: "Google",
    [Provider.SOCIAL_PRICES]: "Social Prices",
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
}

export default UsersEnum;
