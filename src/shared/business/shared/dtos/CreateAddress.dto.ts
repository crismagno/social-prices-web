import AddressEnum from "../../enums/address.enum";

export class AddressStateDto {
  code: string = "";
  name: string = "";
}

export class AddressCountryDto {
  code: string = "";
  name: string = "";
}

export class CreateAddressDto {
  address1: string = "";
  address2: string | null = null;
  city: string = "";
  state: AddressStateDto = {} as any;
  uid: string = "";
  zip: string = "";
  description: string | null = null;
  country: AddressCountryDto = {} as any;
  district: string = "";
  types: AddressEnum.Type[] = [];
}
