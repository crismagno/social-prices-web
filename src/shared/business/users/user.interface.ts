import UsersEnum from "./users.enum";

export default interface IUser {
  readonly _id: string;
  uid: string;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  username: string | null;
  email: string | null;
  providerToken: string;
  providerId: string | null;
  authToken: string | null;
  avatar: string | null;
  authProvider: UsersEnum.Provider;
  phoneNumbers: IPhoneNumber[] | null;
  status: UsersEnum.Status | null;
  extraDataProvider: any | null;
  birthDate: Date | null;
  addresses: IUserAddress[] | null;
  gender: UsersEnum.Gender | null;
  loggedByAuthProvider: UsersEnum.Provider;
  about: string | null;
}

export interface IUserAddress {
  address1: string;
  address2?: string;
  city: string;
  isValid: boolean;
  state?: IUserAddressState;
  uid: string;
  zip: string;
  description?: string;
  country: IUserAddressCountry;
  district: string;
}

export interface IPhoneNumber {
  uid: string;
  type: UsersEnum.PhoneTypes;
  number: string;
  messengers: UsersEnum.PhoneNumberMessenger[];
}

export interface IUserAddressState {
  code: string;
  name: string;
}

export interface IUserAddressCountry {
  code: string;
  name: string;
}
