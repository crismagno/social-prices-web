import UsersEnum from '../../../../shared/business/users/users.enum';

export default class CreateCustomerDto {
  email: string | null = null;
  name: string | null = null;
  birthDate: Date | null = null;
  gender: UsersEnum.Gender | null = null;
  about: string | null = null;
  addresses: any[] = [];
  phoneNumbers: any[] = [];
}
