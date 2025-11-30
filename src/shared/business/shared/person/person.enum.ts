namespace PersonEnum {
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
}

export default PersonEnum;
