import { IAddress } from "../../../../shared/business/shared/address/address.interface";

export default class UpdateUserAddressesDto {
  addresses: IAddress[] = [];
}
