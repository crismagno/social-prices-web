import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export default class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  startedAt: any;

  @IsString()
  @IsOptional()
  description: string | null;

  @IsString()
  @IsOptional()
  about: string | null;

  addresses: any[];

  phoneNumbers: any[];
}
