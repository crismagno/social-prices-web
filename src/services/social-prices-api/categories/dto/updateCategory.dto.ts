import { IsEnum, IsOptional, IsString } from "class-validator";

import CategoriesEnum from "../../../../shared/business/categories/categories.enum";

export default class UpdateCategoryDto {
  @IsString()
  categoryId: string;

  @IsString()
  name: string;

  @IsString()
  @IsEnum(CategoriesEnum.Type)
  type: CategoriesEnum.Type;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  ownerUserId: string | null;
}
