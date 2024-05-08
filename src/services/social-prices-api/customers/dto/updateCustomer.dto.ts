import CreateCategoryDto from '../../categories/dto/createCategory.dto';

export default class UpdateCustomerDto extends CreateCategoryDto {
  customerId: string = "";
}
