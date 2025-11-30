import { IAddress } from "../shared/address/address.interface";
import { ICreatedAtEntity } from "../shared/global/created-at.interface";
import { ISoftDeleteEntity } from "../shared/global/soft-delete.interface";
import { IUpdatedAtEntity } from "../shared/global/updated-at.interface";
import { IPhoneNumber } from "../shared/phone/phone-number.interface";
import StoresEnum from "./stores.enum";

export interface IStore
  extends ISoftDeleteEntity,
    ICreatedAtEntity,
    IUpdatedAtEntity {
  readonly _id: string;
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
  tagsIds: string[];
  cnpj: string | null;
  type: StoresEnum.Type | null;
}
