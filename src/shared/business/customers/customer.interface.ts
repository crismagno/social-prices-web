import { IAddress } from '../interfaces/address.interface';
import { ICreatedAtEntity } from '../interfaces/created-at.interface';
import { IPhoneNumber } from '../interfaces/phone-number';
import { IUpdatedAtEntity } from '../interfaces/updated-at.interface';
import UsersEnum from '../users/users.enum';

export interface ICustomer extends ICreatedAtEntity, IUpdatedAtEntity {
  readonly _id: string;
  avatar: string | null;
  userId: string | null;
  email: string | null;
  ownerUserId: string;
  name: string | null;
  birthDate: Date | null;
  addresses: IAddress[];
  gender: UsersEnum.Gender | null;
  about: string | null;
  phoneNumbers: IPhoneNumber[];
}
