import CreateCustomerDto from "./createCustomer.dto";

export default class UpdateCustomerDto extends CreateCustomerDto {
  customerId: string = "";
}
