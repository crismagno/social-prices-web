import { IsArray } from "class-validator";

import { IPhoneNumber } from "../../../../shared/business/interfaces/phone-number";

export default class UpdateUserPhoneNumbersDto {
  @IsArray()
  phoneNumbers: IPhoneNumber[];
}
