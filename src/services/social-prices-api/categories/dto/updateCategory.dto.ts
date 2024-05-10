import CategoriesEnum
  from '../../../../shared/business/categories/categories.enum';

export default class UpdateCategoryDto {
  categoryId: string = "";
  name: string = "";
  type: CategoriesEnum.Type = CategoriesEnum.Type.PRODUCT;
  code: string = "";
  ownerUserId: string | null = null;
  description: string | null = null;
}
