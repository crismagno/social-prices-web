import PhoneNumberEnum from "../../enums/phone-number.enum";

export class CreatePhoneNumberDto {
  uid: string = "";
  type: PhoneNumberEnum.Type = PhoneNumberEnum.Type.OTHER;
  messengers: PhoneNumberEnum.PhoneNumberMessenger[] = [];
  number: string = "";
}
