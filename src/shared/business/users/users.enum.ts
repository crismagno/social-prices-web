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
    FEMALE = "FEMALE",
    MALE = "MALE",
  }

  export const GenderLabels = {
    [Gender.FEMALE]: "Female",
    [Gender.MALE]: "Male",
  };
}

export default UsersEnum;
