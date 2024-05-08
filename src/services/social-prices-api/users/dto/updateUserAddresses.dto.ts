import {
  IAddress,
} from '../../../../shared/business/interfaces/address.interface';

export default class UpdateUserAddressesDto {
  addresses: IAddress[] = [];
}
