import { IPhoneNumber } from "../../../../shared/business/shared/phone/phone-number.interface";
import UsersEnum from "../../../../shared/business/users/users.enum";

export default class CreateUserDto {
  email: string = "";
  password: string = "";
  uid: string | null = "";
  authProvider: UsersEnum.Provider | null = null;
  avatar: string | null = null;
  phoneNumbers: IPhoneNumber[] = [];
  extraDataProvider: any | null = null;
  about: string | null = null;
  type: UsersEnum.Type = UsersEnum.Type.COMMON;
}
