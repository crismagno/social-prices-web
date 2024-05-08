import UsersEnum from '../../../../shared/business/users/users.enum';

export default class UpdateUserDto {
  name: string = "";
  birthDate: Date = new Date();
  gender: UsersEnum.Gender | null = null;
  about: string | null = null;
}
