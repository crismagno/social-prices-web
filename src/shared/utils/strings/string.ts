import AddressEnum from "../../business/shared/address/address.enum";
import { IAddress } from "../../business/shared/address/address.interface";
import PhoneNumberEnum from "../../business/shared/phone/phone-number.enum";
import { IPhoneNumber } from "../../business/shared/phone/phone-number.interface";
import IUser from "../../business/users/user.interface";

export const createComma = (str: string): string =>
  str?.trim() ? ", " + str : str;

export const messengersToString = (
  messengers: string[],
  t: (key: string) => string,
): string =>
  messengers.reduce((acc, curr, index) => {
    const label = t(
      PhoneNumberEnum.PhoneNumberMessengerLabels[
        curr as PhoneNumberEnum.PhoneNumberMessenger
      ],
    );
    if (index !== 0) {
      acc += `, ${label}`;
    } else {
      acc = label;
    }

    return acc;
  }, "");

export const createAddressName = (
  address: IAddress | any,
  t: (key: string) => string,
): string => {
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

  if (address.types?.length) {
    addressName += ` (${addressTypesToString(address, t)})`;
  }

  return addressName;
};

export const createPhoneNumberName = (
  phoneNumber: IPhoneNumber,
  t: (key: string) => string,
): string => {
  let phoneNumberName: string = "";

  if (phoneNumber?.type) {
    phoneNumberName += t(PhoneNumberEnum.TypeLabels[phoneNumber.type]);
  }

  if (phoneNumber.number) {
    if (phoneNumber.type) {
      phoneNumberName += createComma(phoneNumber.number);
    } else {
      phoneNumberName += phoneNumber.number;
    }
  }

  if (phoneNumber.messengers.length) {
    phoneNumberName += `(${messengersToString(phoneNumber.messengers, t)})`;
  }

  return phoneNumberName;
};

export const formatterMoney = (value: any): string =>
  `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const parserMoney = (value: any) =>
  value?.replace(/\R\$\s?|(,*)/g, "") as unknown as number;

export const getUserName = (user: IUser): string =>
  user?.name || user.username || "";

export const parseToUpperAndUnderline = (value: string): string =>
  value?.trim().toLocaleUpperCase().split(" ").join("_");

export const formatToMoneyDecimal = (
  value: number,
  decimal: number = 2,
): string => `R$ ${value?.toFixed(decimal) ?? 0}`;

export const addressTypesToString = (
  address: IAddress,
  t: (key: string) => string,
): string =>
  address?.types?.length
    ? address.types.reduce((acc: string, curr: string, index: number) => {
        const lastIndexElement: number = address.types.length - 1;
        const label = t(AddressEnum.TypesLabels[curr as AddressEnum.Type]);

        if (index !== lastIndexElement) {
          acc += `${label}, `;
        } else if (index === lastIndexElement) {
          acc += `${label}`;
        }

        return acc;
      }, "")
    : "";
