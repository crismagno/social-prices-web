import { isNil } from "lodash";

export const parseColorPickerToHexString = (value: any): string => {
  if (isNil(value)) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.toHexString();
};
