import AppsEnum from "../apps/apps.enum";
import { IAddress } from "../shared/address/address.interface";
import { ICreatedAtEntity } from "../shared/global/created-at.interface";
import { IUpdatedAtEntity } from "../shared/global/updated-at.interface";
import PersonEnum from "../shared/person/person.enum";
import { IPhoneNumber } from "../shared/phone/phone-number.interface";

// An app this customer came from or was linked to (one entry per app).
export interface ICustomerExternalSource {
  appId: AppsEnum.App;
  externalId: string;
}

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
  idNumber: string | null;
  cpf: string | null;
  cnpj: string | null;
  phoneNumbers: IPhoneNumber[];
  tagsIds: string[];
  uniqName: string | null;
  uploadFilename: string | null;
  customerId: string | null;
  externalSources?: ICustomerExternalSource[];
}
