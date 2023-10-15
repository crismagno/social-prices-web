namespace UsersEnum {
  export enum Provider {
    GOOGLE = "GOOGLE",
    SOCIAL_PRICES = "SOCIAL_PRICES",
  }

  export enum Status {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    STOPPED = "STOPPED",
  }

  export enum Gender {
    OTHER = "OTHER",
    FEMALE = "FEMALE",
    MALE = "MALE",
  }

  export enum PhoneTypes {
    MOBILE = "MOBILE",
    HOME = "HOME",
    BUSINESS = "BUSINESS",
    OTHER = "OTHER",
  }

  export const GenderLabels = {
    [Gender.OTHER]: "Other",
    [Gender.FEMALE]: "Female",
    [Gender.MALE]: "Male",
  };
}

export default UsersEnum;