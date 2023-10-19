import {
  IPhoneNumber,
  IUserAddress,
} from "../../business/users/user.interface";
import UsersEnum from "../../business/users/users.enum";

export const createComma = (str: string): string =>
  str?.trim() ? ", " + str : str;

export const createUserAddressName = (address: IUserAddress | any): string => {
  let addressName: string = "";

  if (address.countryCode || address.country) {
    addressName += address.countryCode ?? address.country.name;
  }

  if (address.stateCode || address.country) {
    addressName += createComma(address.stateCode ?? address.state.name);
  }

  if (address.city) {
    addressName += createComma(address.city);
  }

  if (address.district) {
    addressName += createComma(address.district);
  }

  if (address.zip) {
    addressName += createComma(address.zip);
  }

  if (address.address1) {
    addressName += createComma(address.address1);
  }

  return addressName;
};

export const createPhoneNumberName = (phoneNumber: IPhoneNumber): string => {
  let phoneNumberName: string = "";

  if (phoneNumber.type) {
    phoneNumberName += UsersEnum.PhoneTypesLabels[phoneNumber.type];
  }

  if (phoneNumber.number) {
    phoneNumberName += createComma(phoneNumber.number);
  }

  return phoneNumberName;
};
