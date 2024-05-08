import UsersEnum from '../../../../shared/business/users/users.enum';

export default class UpdateUserDto {
  firstName: string = "";
  lastName: string = "";
  middleName: string | null = null;
  birthDate: Date = new Date();
  gender: UsersEnum.Gender | null = null;
  about: string | null = null;
}
