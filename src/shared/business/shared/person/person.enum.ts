namespace PersonEnum {
  export enum Gender {
    OTHER = "OTHER",
    FEMALE = "FEMALE",
    MALE = "MALE",
  }

  export const GenderLabels = {
    [Gender.OTHER]: "common.other",
    [Gender.FEMALE]: "common.female",
    [Gender.MALE]: "common.male",
  };

  export const GenderColors = {
    [Gender.OTHER]: "gray",
    [Gender.FEMALE]: "pink",
    [Gender.MALE]: "blue",
  };
}

export default PersonEnum;
