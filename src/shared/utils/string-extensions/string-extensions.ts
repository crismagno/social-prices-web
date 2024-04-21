import { ICustomer } from "../../business/customers/customer.interface";
import { IAddress } from "../../business/interfaces/address.interface";
import { IPhoneNumber } from "../../business/interfaces/phone-number";
import IUser from "../../business/users/user.interface";
import UsersEnum from "../../business/users/users.enum";

export const createComma = (str: string): string =>
  str?.trim() ? ", " + str : str;

export const createUserAddressName = (address: IAddress | any): string => {
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

  if (phoneNumber?.type) {
    phoneNumberName += UsersEnum.PhoneTypesLabels[phoneNumber.type];
  }

  if (phoneNumber.number) {
    if (phoneNumber.type) {
      phoneNumberName += createComma(phoneNumber.number);
    } else {
      phoneNumberName += phoneNumber.number;
    }
  }

  return phoneNumberName;
};

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

export const formatterMoney = (value: any) =>
  `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const parserMoney = (value: any) =>
  value?.replace(/\R\$\s?|(,*)/g, "") as unknown as number;

export const getUserName = (user: IUser): string => {
  let userName: string = user?.firstName ?? "";

  if (user?.middleName) {
    userName += ` ${user.middleName}`;
  }

  if (user?.lastName) {
    userName += ` ${user.lastName}`;
  }

  return userName || user.username || "";
};

export const getCustomerName = (customer: ICustomer): string => {
  let customerName: string = customer?.firstName ?? "";

  if (customer?.middleName) {
    customerName += ` ${customer.middleName}`;
  }

  if (customer?.lastName) {
    customerName += ` ${customer.lastName}`;
  }

  return customerName ?? "";
};
