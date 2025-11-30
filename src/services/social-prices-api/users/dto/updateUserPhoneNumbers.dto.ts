import { IPhoneNumber } from "../../../../shared/business/shared/phone/phone-number.interface";

export default class UpdateUserPhoneNumbersDto {
  phoneNumbers: IPhoneNumber[] = [];
}
