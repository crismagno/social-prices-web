import PersonEnum from "../enums/person.enum";
import { IAddress } from "../interfaces/address.interface";
import { ICreatedAtEntity } from "../interfaces/created-at.interface";
import { IPhoneNumber } from "../interfaces/phone-number";
import { IUpdatedAtEntity } from "../interfaces/updated-at.interface";
import EmployeeEnum from "./employee.enum";

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
  level: EmployeeEnum.Level;
  status: EmployeeEnum.Status;
}
