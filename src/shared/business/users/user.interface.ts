import { IAddress } from "../shared/address/address.interface";
import { ICreatedAtEntity } from "../shared/global/created-at.interface";
import { IUpdatedAtEntity } from "../shared/global/updated-at.interface";
import PersonEnum from "../shared/person/person.enum";
import { IPhoneNumber } from "../shared/phone/phone-number.interface";
import UsersEnum from "./users.enum";

export default interface IUser extends ICreatedAtEntity, IUpdatedAtEntity {
  readonly _id: string;
  uid: string;
  name: string | null;
  username: string | null;
  email: string | null;
  providerToken: string;
  providerId: string | null;
  avatar: string | null;
  authProvider: UsersEnum.Provider;
  phoneNumbers: IPhoneNumber[];
  status: UsersEnum.Status | null;
  extraDataProvider: any | null;
  birthDate: Date | null;
  addresses: IAddress[];
  gender: PersonEnum.Gender | null;
  loggedByAuthProvider: UsersEnum.Provider;
  about: string | null;
  type: UsersEnum.Type;
}
