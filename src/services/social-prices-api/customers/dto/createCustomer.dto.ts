import UsersEnum from '../../../../shared/business/users/users.enum';

export default class CreateCustomerDto {
  email: string | null = null;
  firstName: string | null = null;
  lastName: string | null = null;
  middleName: string | null = null;
  birthDate: Date | null = null;
  gender: UsersEnum.Gender | null = null;
  about: string | null = null;
  addresses: any[] = [];
  phoneNumbers: any[] = [];
}
