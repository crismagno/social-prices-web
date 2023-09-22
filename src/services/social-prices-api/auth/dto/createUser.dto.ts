import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

import UsersEnum from "../../../../shared/business/users/users.enum";

export default class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsOptional()
  uid?: string;

  @IsString()
  @IsOptional()
  @IsEnum(UsersEnum.Provider)
  authProvider?: UsersEnum.Provider;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsOptional()
  @IsArray()
  phoneNumbers?: string[];

  @IsOptional()
  extraDataProvider?: any;
}
