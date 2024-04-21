import { IAddress } from "../interfaces/address.interface";
import { ICreatedAtEntity } from "../interfaces/created-at.interface";
import { IPhoneNumber } from "../interfaces/phone-number";
import { ISoftDeleteEntity } from "../interfaces/soft-delete.interface";
import { IUpdatedAtEntity } from "../interfaces/updated-at.interface";
import StoresEnum from "./stores.enum";

export interface IStore
  extends ISoftDeleteEntity,
    ICreatedAtEntity,
    IUpdatedAtEntity {
  _id: string;
  logo: string | null;
  email: string;
  name: string;
  description: string | null;
  startedAt: Date;
  status: StoresEnum.Status;
  userId: string;
  addresses: IAddress[];
  phoneNumbers: IPhoneNumber[];
  about: string | null;
  categoriesIds: string[];
}
