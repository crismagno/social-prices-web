import PersonEnum from "../../../../shared/business/shared/person/person.enum";

export default class CreateCustomerDto {
  email: string | null = null;
  name: string | null = null;
  birthDate: Date | null = null;
  gender: PersonEnum.Gender | null = null;
  about: string | null = null;
  addresses: any[] = [];
  phoneNumbers: any[] = [];
  tagsIds: string[] = [];
  uniqName: string | null = null;
}
