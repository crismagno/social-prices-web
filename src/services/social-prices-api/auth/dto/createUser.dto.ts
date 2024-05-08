import {
  IPhoneNumber,
} from '../../../../shared/business/interfaces/phone-number';
import UsersEnum from '../../../../shared/business/users/users.enum';

export default class CreateUserDto {
  email: string = "";
  password: string = "";
  uid: string | null = "";
  authProvider: UsersEnum.Provider | null = null;
  avatar: string | null = null;
  phoneNumbers: IPhoneNumber[] = [];
  extraDataProvider: any | null = null;
  about: string | null = null;
}
