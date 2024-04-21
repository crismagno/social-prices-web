import { IAddress } from "../interfaces/address.interface";
import { ICreatedAtEntity } from "../interfaces/created-at.interface";
import { IPhoneNumber } from "../interfaces/phone-number";
import { IUpdatedAtEntity } from "../interfaces/updated-at.interface";
import UsersEnum from "./users.enum";

export default interface IUser extends ICreatedAtEntity, IUpdatedAtEntity {
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
  addresses: IAddress[];
  gender: UsersEnum.Gender | null;
  loggedByAuthProvider: UsersEnum.Provider;
  about: string | null;
}
