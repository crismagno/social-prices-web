import { IsEnum, IsOptional, isString, IsString } from "class-validator";

import CategoriesEnum from "../../../../shared/business/categories/categories.enum";

export default class CreateCategoryDto {
  @isString()
  name: string;

  @IsString()
  @IsEnum(CategoriesEnum.Type)
  type: CategoriesEnum.Type;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  ownerUserId: string | null;

  @IsString()
  @IsOptional()
  description: string | null;
}
