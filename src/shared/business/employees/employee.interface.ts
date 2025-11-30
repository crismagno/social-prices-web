import { IAddress } from "../shared/address/address.interface";
import { ICreatedAtEntity } from "../shared/global/created-at.interface";
import { IUpdatedAtEntity } from "../shared/global/updated-at.interface";
import PersonEnum from "../shared/person/person.enum";
import { IPhoneNumber } from "../shared/phone/phone-number.interface";
import EmployeesEnum from "./employees.enum";

export interface IEmployee extends ICreatedAtEntity, IUpdatedAtEntity {
  readonly _id: string;
  userId: string;
  avatar: string | null;
  name: string;
  username: string;
  email: string;
  password: string;
  birthDate: Date | null;
  gender: PersonEnum.Gender | null;
  addresses: IAddress[];
  phoneNumbers: IPhoneNumber[];
  tagsIds: string[];
  about: string | null;
  level: EmployeesEnum.Level;
  status: EmployeesEnum.Status;
  isMain: boolean;
  uploadFilename: string | null;
}
