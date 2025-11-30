import { IAddress } from "../shared/address/address.interface";
import { ICreatedAtEntity } from "../shared/global/created-at.interface";
import { IUpdatedAtEntity } from "../shared/global/updated-at.interface";
import PersonEnum from "../shared/person/person.enum";
import { IPhoneNumber } from "../shared/phone/phone-number.interface";

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
  uniqName: string | null;
  uploadFilename: string | null;
  customerId: string | null;
}
