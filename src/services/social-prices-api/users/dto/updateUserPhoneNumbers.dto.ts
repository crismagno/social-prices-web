import { IPhoneNumber } from "../../../../shared/business/interfaces/phone-number.interface";

export default class UpdateUserPhoneNumbersDto {
  phoneNumbers: IPhoneNumber[] = [];
}
