import PersonEnum from "../enums/person.enum";
import { IAddress } from "../interfaces/address.interface";
import { ICreatedAtEntity } from "../interfaces/created-at.interface";
import { IPhoneNumber } from "../interfaces/phone-number.interface";
import { IUpdatedAtEntity } from "../interfaces/updated-at.interface";

export interface ICustomer extends ICreatedAtEntity, IUpdatedAtEntity {
  readonly _id: string;
  avatar: string | null;
  userId: string | null;
  email: string | null;
  ownerUserId: string;
  name: string | null;
  birthDate: Date | null;
  addresses: IAddress[];
  gender: PersonEnum.Gender | null;
  about: string | null;
  phoneNumbers: IPhoneNumber[];
  tagsIds: string[];
}
