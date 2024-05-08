import CategoriesEnum
  from '../../../../shared/business/categories/categories.enum';

export default class CreateCategoryDto {
  name: string = "";
  type: CategoriesEnum.Type = CategoriesEnum.Type.PRODUCT;
  code: string = "";
  ownerUserId: string | null = null;
  description: string | null = null;
}
