"use client";

import IUser from "../../../shared/business/users/user.interface";
import ServiceMethodsBase from "../ServiceMethods.base";
import AuthServiceEnum from "./auth-service.enum";
import CreateUserDto from "./dto/createUser.dto";

export default class AuthServiceMethods extends ServiceMethodsBase {
  public async signIn(email: string, password: string): Promise<IUser> {
    const response = await this._fetchAxios.post<IUser>(
      `${this._socialPricesApiV1}${AuthServiceEnum.Methods.SIGN_IN}`,
      {
        email,
        password,
      }
    );

    return response.data;
  }

  public async signUp(createUserDto: CreateUserDto): Promise<IUser> {
    const response = await this._fetchAxios.post<IUser>(
      `${this._socialPricesApiV1}${AuthServiceEnum.Methods.SIGN_UP}`,
      createUserDto
    );

    return response.data;
  }

  public async validateToken(token: string): Promise<boolean> {
    try {
      const response = await this._fetchAxios.get<boolean>(
        `${this._socialPricesApiV1}${AuthServiceEnum.Methods.VALIDATE_TOKEN}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: this.formatAuthorization(token),
          },
        }
      );

      return response.data;
    } catch (error: any) {
      return false;
    }
  }

  public async validateSignInCode(
    token: string,
    codeValue: string
  ): Promise<boolean> {
    try {
      const response = await this._fetchAxios.get<boolean>(
        `${this._socialPricesApiV1}${AuthServiceEnum.Methods.VALIDATE_SIGN_IN_CODE}/${codeValue}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: this.formatAuthorization(token),
          },
        }
      );

      return response.data;
    } catch (error: any) {
      return false;
    }
  }
}
