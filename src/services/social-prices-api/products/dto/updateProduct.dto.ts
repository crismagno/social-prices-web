import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export default class UpdateProductDto {
  @IsString()
  productId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  barCode: string | null;

  @IsString()
  @IsOptional()
  details: string | null;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  description: string | null;

  @IsNumber()
  price: number;

  @IsBoolean()
  isActive: boolean;

  @IsArray()
  storeIds: string[];

  @IsString()
  @IsOptional()
  QRCode: string | null;

  @IsArray()
  deletedFilesUrl: string[];

  @IsArray()
  categoriesCode: string[];
}
