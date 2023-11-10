import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

import { IPhoneNumber } from "../../../../shared/business/users/user.interface";
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
  phoneNumbers?: IPhoneNumber[];

  @IsOptional()
  extraDataProvider?: any;
}
