import { IsArray } from "class-validator";

import { IUserAddress } from "../../../../shared/business/users/user.interface";

export default class UpdateUserAddressesDto {
  @IsArray()
  addresses: IUserAddress[];
}
