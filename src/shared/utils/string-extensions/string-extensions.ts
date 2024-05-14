import AddressEnum from "../../business/enums/address.enum";
import { IAddress } from "../../business/interfaces/address.interface";
import { IPhoneNumber } from "../../business/interfaces/phone-number";
import UsersEnum from "../../business/users/users.enum";

export const createComma = (str: string): string =>
  str?.trim() ? ", " + str : str;

export const messengersToString = (messengers: string[]): string =>
  messengers.reduce((acc, curr, index) => {
    if (index !== 0) {
      acc += `, ${
        UsersEnum.PhoneNumberMessengerLabels[
          curr as UsersEnum.PhoneNumberMessenger
        ]
      }`;
    } else {
      acc =
        UsersEnum.PhoneNumberMessengerLabels[
          curr as UsersEnum.PhoneNumberMessenger
        ];
    }

    return acc;
  }, "");

export const createAddressName = (address: IAddress | any): string => {
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
    const typesToString = address.types.reduce(
      (acc: string, curr: AddressEnum.Type, index: number) => {
        const lastIndexElement: number = address.types.length - 1;

        if (index !== lastIndexElement) {
          acc += `${AddressEnum.TypesLabels[curr]}, `;
        } else if (index === lastIndexElement) {
          acc += `${AddressEnum.TypesLabels[curr]}`;
        }

        return acc;
      },
      ""
    );

    addressName += ` (${typesToString})`;
  }

  return addressName;
};

export const createPhoneNumberName = (phoneNumber: IPhoneNumber): string => {
  let phoneNumberName: string = "";

  if (phoneNumber?.type) {
    phoneNumberName += UsersEnum.TypeLabels[phoneNumber.type];
  }

  if (phoneNumber.number) {
    if (phoneNumber.type) {
      phoneNumberName += createComma(phoneNumber.number);
    } else {
      phoneNumberName += phoneNumber.number;
    }
  }

  if (phoneNumber.messengers.length) {
    phoneNumberName += `(${messengersToString(phoneNumber.messengers)})`;
  }

  return phoneNumberName;
};

export const formatterMoney = (value: any) =>
  `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const parserMoney = (value: any) =>
  value?.replace(/\R\$\s?|(,*)/g, "") as unknown as number;

export const getUserName = (user: IUser): string =>
  user?.name || user.username || "";

export const parseToUpperAndUnderline = (value: string): string =>
  value?.trim().toLocaleUpperCase().split(" ").join("_");
