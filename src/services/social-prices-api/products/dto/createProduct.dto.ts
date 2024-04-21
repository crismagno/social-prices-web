import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export default class CreateProductDto {
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
  categoriesIds: string[];
}
