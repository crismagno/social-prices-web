import PersonEnum from "../../../../shared/business/enums/person.enum";

export default class UpdateUserDto {
  name: string = "";
  birthDate: Date = new Date();
  gender: PersonEnum.Gender | null = null;
  about: string | null = null;
}
