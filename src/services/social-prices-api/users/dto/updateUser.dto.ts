import PersonEnum from "../../../../shared/business/shared/person/person.enum";

export default class UpdateUserDto {
  name: string = "";
  birthDate: Date = new Date();
  gender: PersonEnum.Gender | null = null;
  about: string | null = null;
}
