import { IsArray } from "class-validator";

import { IPhoneNumber } from "../../../../shared/business/users/user.interface";

export default class UpdateUserPhoneNumbersDto {
  @IsArray()
  phoneNumbers: IPhoneNumber[];
}
