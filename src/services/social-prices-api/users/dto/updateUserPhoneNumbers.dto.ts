import {
  IPhoneNumber,
} from '../../../../shared/business/interfaces/phone-number';

export default class UpdateUserPhoneNumbersDto {
  phoneNumbers: IPhoneNumber[] = [];
}
